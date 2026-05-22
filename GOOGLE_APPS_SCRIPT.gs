// EconomiaCap - Google Apps Script sync backend
// API compatibility:
// GET  ?action=getAll
// POST action: addMov | updateMov | deleteMov | saveConfig | savePlan | saveCierres | syncAll | status

const TAB_MOVS = 'Movimientos';
const TAB_CFG = 'Config'; // Keep for metadata and backward compatibility
const TAB_PLAN = 'Plan';
const TAB_CIERRES = 'Cierres';
const TAB_PERSONAS = 'Personas';
const TAB_SERVICIOS = 'Servicios';
const TAB_CAPILLAS = 'Capillas';
const TAB_CAPELLANIAS = 'Capellanias';
const TAB_FONDOS = 'Fondos';
const TAB_PROYECTOS = 'Proyectos';
const TAB_COLECTAS = 'Colectas';
const TAB_RECORDATORIOS = 'Recordatorios';
const TAB_CUENTAS_EXTRA = 'Cuentas_Extra';
const TAB_CUENTAS_DEL = 'Cuentas_Del';
const TAB_VEHICULOS = 'Vehiculos';
const TAB_SALDOS_INICIALES = 'Saldos_Iniciales';
const TAB_MOVS_ENTRADA = 'Movimientos_Entrada';

const CFG_MOVS_DELETED_KEY = 'movimientos_eliminados';
const TAB_SYNC_LOG = '_SyncLog';
const SYNC_LOG_MAX_ROWS = 500; // Keep last N log entries

const ENTITY_LIST_SPECS = [
  { key: 'personas',      tab: TAB_PERSONAS,      fields: ['id','nombre','tipo','sueldo','vencimiento','lugar','notas','creadoEn'] },
  { key: 'servicios',     tab: TAB_SERVICIOS,     fields: ['id','nombre','tipo','pertenece','proveedor','cuenta','monto','moneda','vencimiento','notas','creadoEn'] },
  { key: 'capillas',      tab: TAB_CAPILLAS,      fields: ['id','nombre','saldoInicial','moneda','color','creadoEn'] },
  { key: 'capellanias',   tab: TAB_CAPELLANIAS,   fields: ['id','nombre','saldoInicial','moneda','color','creadoEn'] },
  { key: 'fondos',        tab: TAB_FONDOS,        fields: ['id','nombre','descripcion','color','saldoInicial','moneda','creadoEn'] },
  { key: 'proyectos',     tab: TAB_PROYECTOS,     fields: ['id','nombre','descripcion','color','meta','moneda','creadoEn'] },
  { key: 'colectas',      tab: TAB_COLECTAS,      fields: ['id','nombre','descripcion','color','moneda','creadoEn'] },
  { key: 'recordatorios', tab: TAB_RECORDATORIOS, fields: ['id','titulo','descripcion','fecha','fechaHora','prioridad','completado','tipo','creadoEn'] },
  { key: 'cuentas_extra', tab: TAB_CUENTAS_EXTRA, fields: ['id','label','banco','tipo','moneda','color'] },
  { key: 'cuentas_del',   tab: TAB_CUENTAS_DEL,   fields: ['id'] },
  { key: 'vehiculos',     tab: TAB_VEHICULOS,     fields: ['id','nombre','placa','tipo','color','notas','creadoEn'] },
  { key: 'cierres',       tab: TAB_CIERRES,       fields: ['mes','fechaCierre','cerradoPor','notas'] }
];

function doGet(e) {
  try {
    ensureSheets_();
    procesarMovimientosInput_();
    const action = (e && e.parameter && e.parameter.action) || '';

    if (action === 'getAll') {
      return json_(Object.assign({ ok: true }, getAllPayload_()));
    }

    return json_({ ok: false, error: 'Unsupported GET action: ' + action });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ensureSheets_();
    const payload = parsePayload_(e);
    const action = payload.action || '';

    switch (action) {
      case 'addMov': {
        const mov = payload.mov || null;
        if (!mov || mov.id === undefined || mov.id === null) {
          return json_({ ok: false, error: 'addMov requires mov.id' });
        }
        upsertMov_(mov);
        return json_({ ok: true, action: 'addMov' });
      }

      case 'updateMov': {
        const mov = payload.mov || null;
        if (!mov || mov.id === undefined || mov.id === null) {
          return json_({ ok: false, error: 'updateMov requires mov.id' });
        }
        upsertMov_(mov);
        return json_({ ok: true, action: 'updateMov' });
      }

      case 'deleteMov': {
        const id = String(payload.id || '');
        if (!id) return json_({ ok: false, error: 'deleteMov requires id' });
        const deleted = deleteMovById_(id);
        return json_({ ok: true, action: 'deleteMov', deleted: deleted });
      }

      case 'saveConfig': {
        const cfg = payload.config || {};
        saveConfigMap_(cfg);
        writeEntitiesFromConfig_(cfg);
        return json_({ ok: true, action: 'saveConfig', keys: Object.keys(cfg).length });
      }

      case 'savePlan': {
        const plan = payload.plan !== undefined ? payload.plan : null;
        savePlan_(plan);
        saveConfigValue_('plan', plan); // compatibility mirror
        return json_({ ok: true, action: 'savePlan' });
      }

      case 'saveCierres': {
        const cierres = payload.cierres || [];
        writeEntityListByKey_('cierres', cierres);
        saveConfigValue_('cierres', cierres); // compatibility mirror
        return json_({ ok: true, action: 'saveCierres' });
      }

      case 'syncAll': {
        // SAFETY: validate movimientos count before writing
        if (Array.isArray(payload.movimientos)) {
          const existingMovs = readMovs_();
          const incoming = payload.movimientos;
          const deletedIds = payload.deletedIds || [];
          // If incoming has <30% of existing AND existing >10, and there are no deleted IDs accounting for the difference → reject
          const threshold = Math.max(Math.floor(existingMovs.length * 0.3), 5);
          if (existingMovs.length > 10 && incoming.length < threshold && deletedIds.length < (existingMovs.length - incoming.length - 2)) {
            syncLog_('REJECTED_SUSPICIOUS', 'Movimientos', incoming.length, existingMovs.length);
            return json_({ ok: false, error: 'syncAll rechazado: los datos entrantes (' + incoming.length + ') son sospechosamente pocos vs existentes (' + existingMovs.length + '). Sync abortado para proteger datos.' });
          }
          setAllMovs_(incoming, { deletedIds: deletedIds });
        } else if (Array.isArray(payload.deletedIds) && payload.deletedIds.length) {
          applyDeletedIds_(payload.deletedIds);
        }

        if (payload.plan !== undefined) {
          savePlan_(payload.plan);
          saveConfigValue_('plan', payload.plan); // compatibility mirror
        }

        if (payload.config && typeof payload.config === 'object') {
          saveConfigMap_(payload.config);
          writeEntitiesFromConfig_(payload.config);
        }

        syncLog_('SYNC_ALL_OK', 'all', Array.isArray(payload.movimientos) ? payload.movimientos.length : 0, 0);
        return json_({ ok: true, action: 'syncAll' });
      }

      case 'status': {
        return json_({ ok: true, action: 'status', message: 'connected' });
      }

      default:
        return json_({ ok: false, error: 'Unsupported POST action: ' + action });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function ensureSheets_() {
  ensureSheet_(TAB_MOVS, ['id', 'json', 'tsMs', 'updatedAt']);
  ensureSheet_(TAB_CFG, ['key', 'value', 'updatedAt']);
  ensureSheet_(TAB_PLAN, ['key', 'value', 'updatedAt']);

  for (let i = 0; i < ENTITY_LIST_SPECS.length; i++) {
    const spec = ENTITY_LIST_SPECS[i];
    const headers = spec.fields.concat(['_extra', 'updatedAt']);
    ensureSheet_(spec.tab, headers);
    upgradeEntitySheetColumns_(spec);
  }

  ensureSheet_(TAB_SALDOS_INICIALES, ['key', 'json', 'updatedAt']);
  ensureSheet_(TAB_MOVS_ENTRADA, ['Fecha', 'Tipo', 'Monto', 'Descripción', 'Grupo', 'Cuenta', 'Subcuenta', 'Cuenta_Pago', 'Boleta', 'Canal', '_procesado']);
  ensureSheet_(TAB_SYNC_LOG, ['timestamp', 'accion', 'hoja', 'entrantes', 'existentes', 'resultado']);

  migrateLegacyConfigToEntitySheets_();
}

function ensureSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
  }
  return sh;
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  const raw = e.postData.contents || '{}';
  return JSON.parse(raw);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getMovSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_MOVS);
}

function getCfgSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_CFG);
}

function getPlanSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB_PLAN);
}

function getSheetByName_(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function movTsMs_(m) {
  const tsMs = Number(m && m.tsMs);
  if (Number.isFinite(tsMs) && tsMs > 0) return tsMs;
  const ts = Date.parse(String((m && m.ts) || ''));
  if (Number.isFinite(ts) && ts > 0) return ts;
  return Date.now();
}

function readMovs_() {
  const sh = getMovSheet_();
  const last = sh.getLastRow();
  if (last <= 1) return [];

  const rows = sh.getRange(2, 1, last - 1, 4).getValues();
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const id = rows[i][0];
    const json = rows[i][1];
    if (!id || !json) continue;
    try {
      const mov = JSON.parse(String(json));
      if (mov && mov.id !== undefined && mov.id !== null) out.push(mov);
    } catch (_e) {
      // Skip malformed rows to keep sync resilient.
    }
  }
  return out;
}

function upsertMov_(mov) {
  const sh = getMovSheet_();
  const id = String(mov.id);
  const tsMs = movTsMs_(mov);
  const row = findMovRowById_(id);
  const values = [id, JSON.stringify(mov), tsMs, new Date().toISOString()];

  if (row > 0) {
    sh.getRange(row, 1, 1, 4).setValues([values]);
  } else {
    sh.appendRow(values);
  }

  clearDeletedIds_([id]);
}

function findMovRowById_(id) {
  const sh = getMovSheet_();
  const last = sh.getLastRow();
  if (last <= 1) return -1;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) return i + 2;
  }
  return -1;
}

function deleteMovById_(id) {
  const idStr = String(id || '');
  if (!idStr) return 0;
  const row = findMovRowById_(idStr);
  if (row > 0) {
    getMovSheet_().deleteRow(row);
    markDeletedIds_([idStr]);
    return 1;
  }
  markDeletedIds_([idStr]);
  return 0;
}

function setAllMovs_(movs, options) {
  const opts = options && typeof options === 'object' ? options : {};
  const incoming = Array.isArray(movs) ? movs : [];
  const deletedIds = Array.isArray(opts.deletedIds) ? opts.deletedIds.map(function (v) { return String(v || ''); }).filter(Boolean) : [];
  const sh = getMovSheet_();
  const existing = readMovs_();
  const byId = {};

  for (let i = 0; i < existing.length; i++) {
    const em = existing[i];
    if (!em || em.id === undefined || em.id === null) continue;
    byId[String(em.id)] = em;
  }

  for (let i = 0; i < incoming.length; i++) {
    const m = incoming[i];
    if (!m || m.id === undefined || m.id === null) continue;
    const id = String(m.id);
    const prev = byId[id];
    if (!prev || movTsMs_(m) >= movTsMs_(prev)) {
      byId[id] = m;
    }
  }

  for (let i = 0; i < deletedIds.length; i++) {
    delete byId[deletedIds[i]];
  }

  const dedup = Object.keys(byId).map(function (k) { return byId[k]; });
  dedup.sort(function (a, b) { return movTsMs_(a) - movTsMs_(b); });

  // SAFETY GUARD: never write 0 movimientos if there are existing ones
  // (this can only happen if something went very wrong with the merge)
  if (dedup.length === 0 && existing.length > 0) {
    syncLog_('SKIP_EMPTY_MOVS', TAB_MOVS, 0, existing.length);
    return;
  }

  const last = sh.getLastRow();
  // Backup before mass rewrite
  if (last > 1) backupSheet_(sh, TAB_MOVS);
  if (last > 1) sh.deleteRows(2, last - 1);

  if (dedup.length) {
    const values = dedup.map(function (m) {
      return [String(m.id), JSON.stringify(m), movTsMs_(m), new Date().toISOString()];
    });
    sh.getRange(2, 1, values.length, 4).setValues(values);
  }

  if (deletedIds.length) {
    markDeletedIds_(deletedIds);
  }
  clearDeletedIds_(dedup.map(function (m) { return String(m.id); }));
}

function applyDeletedIds_(ids) {
  const list = Array.isArray(ids) ? ids.map(function (v) { return String(v || ''); }).filter(Boolean) : [];
  if (!list.length) return;
  const sh = getMovSheet_();
  for (let i = 0; i < list.length; i++) {
    const row = findMovRowById_(list[i]);
    if (row > 0) sh.deleteRow(row);
  }
  markDeletedIds_(list);
}

function readConfigMap_() {
  const sh = getCfgSheet_();
  const last = sh.getLastRow();
  const map = {};
  if (last <= 1) return map;

  const rows = sh.getRange(2, 1, last - 1, 3).getValues();
  for (let i = 0; i < rows.length; i++) {
    const key = String(rows[i][0] || '');
    if (!key) continue;
    const raw = rows[i][1];
    try {
      map[key] = JSON.parse(String(raw));
    } catch (_e) {
      map[key] = raw;
    }
  }
  return map;
}

function saveConfigValue_(key, value) {
  const sh = getCfgSheet_();
  const k = String(key || '');
  if (!k) return;
  const last = sh.getLastRow();

  if (last > 1) {
    const keys = sh.getRange(2, 1, last - 1, 1).getValues();
    for (let i = 0; i < keys.length; i++) {
      if (String(keys[i][0]) === k) {
        sh.getRange(i + 2, 1, 1, 3).setValues([[k, JSON.stringify(value), new Date().toISOString()]]);
        return;
      }
    }
  }

  sh.appendRow([k, JSON.stringify(value), new Date().toISOString()]);
}

function saveConfigMap_(cfg) {
  const obj = cfg && typeof cfg === 'object' ? cfg : {};
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    saveConfigValue_(k, obj[k]);
  }
}

function savePlan_(planObj) {
  const sh = getPlanSheet_();
  const last = sh.getLastRow();
  const payload = JSON.stringify(planObj);
  if (last <= 1) {
    sh.appendRow(['plan', payload, new Date().toISOString()]);
    return;
  }
  const keys = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < keys.length; i++) {
    if (String(keys[i][0]) === 'plan') {
      sh.getRange(i + 2, 1, 1, 3).setValues([['plan', payload, new Date().toISOString()]]);
      return;
    }
  }
  sh.appendRow(['plan', payload, new Date().toISOString()]);
}

function readPlan_() {
  const sh = getPlanSheet_();
  const last = sh.getLastRow();
  if (last <= 1) return null;
  const rows = sh.getRange(2, 1, last - 1, 3).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) !== 'plan') continue;
    try {
      return JSON.parse(String(rows[i][1] || 'null'));
    } catch (_e) {
      return null;
    }
  }
  return null;
}

function writeEntitiesFromConfig_(cfg) {
  const obj = cfg && typeof cfg === 'object' ? cfg : {};
  for (let i = 0; i < ENTITY_LIST_SPECS.length; i++) {
    const spec = ENTITY_LIST_SPECS[i];
    if (obj[spec.key] !== undefined) {
      writeEntityListByKey_(spec.key, obj[spec.key]);
    }
  }

  if (obj.saldos_iniciales !== undefined) {
    writeMapEntity_(TAB_SALDOS_INICIALES, obj.saldos_iniciales);
  }
}

function writeEntityListByKey_(key, value) {
  const spec = getEntitySpecByKey_(key);
  if (!spec) return;
  const list = Array.isArray(value) ? value : [];
  writeEntityList_(spec.tab, list, spec.fields);
}

function getEntitySpecByKey_(key) {
  for (let i = 0; i < ENTITY_LIST_SPECS.length; i++) {
    if (ENTITY_LIST_SPECS[i].key === key) return ENTITY_LIST_SPECS[i];
  }
  return null;
}

// Writes an entity list into a sheet with one column per field.
// An extra '_extra' column captures any fields not declared in the schema.
function writeEntityList_(tabName, list, fields) {
  const sh = getSheetByName_(tabName);
  const last = sh.getLastRow();
  const existingCount = last - 1; // rows minus header

  // SAFETY GUARD: never overwrite existing data with an empty list.
  // An empty list usually means a bug in loading data from LocalStorage, not a real deletion.
  if (list.length === 0) {
    if (existingCount > 0) {
      syncLog_('SKIP_EMPTY_WRITE', tabName, 0, existingCount);
    }
    return;
  }

  // Backup before mass rewrite (only when there's meaningful existing data)
  if (existingCount > 0) backupSheet_(sh, tabName);

  if (last > 1) sh.deleteRows(2, last - 1);

  const colCount = fields.length + 2; // fields + _extra + updatedAt
  const nowIso = new Date().toISOString();
  const rows = [];

  for (let i = 0; i < list.length; i++) {
    const item = list[i] || {};
    const row = [];
    const extra = {};

    for (let f = 0; f < fields.length; f++) {
      const val = item[fields[f]];
      if (val === undefined || val === null) {
        row.push('');
      } else if (typeof val === 'object') {
        row.push(JSON.stringify(val));
      } else {
        row.push(val);
      }
    }

    // Collect any fields not in schema into _extra
    const fieldSet = {};
    for (let f = 0; f < fields.length; f++) fieldSet[fields[f]] = true;
    const itemKeys = Object.keys(item);
    for (let k = 0; k < itemKeys.length; k++) {
      if (!fieldSet[itemKeys[k]]) extra[itemKeys[k]] = item[itemKeys[k]];
    }

    row.push(Object.keys(extra).length ? JSON.stringify(extra) : '');
    row.push(nowIso);
    rows.push(row);
  }

  sh.getRange(2, 1, rows.length, colCount).setValues(rows);
  syncLog_('WRITE_OK', tabName, list.length, existingCount);
}

// Reads an entity list from a columnar sheet, reconstructing full objects.
function readEntityList_(tabName, fields) {
  const sh = getSheetByName_(tabName);
  const last = sh.getLastRow();
  if (last <= 1) return [];

  // Read actual headers from the sheet (row 1)
  const numCols = sh.getLastColumn();
  const headers = sh.getRange(1, 1, 1, numCols).getValues()[0].map(String);

  // Detect old format (id, json, updatedAt) and fall back
  if (headers.length === 3 && headers[0] === 'id' && headers[1] === 'json' && headers[2] === 'updatedAt') {
    return readEntityListOldFormat_(tabName);
  }

  const rows = sh.getRange(2, 1, last - 1, numCols).getValues();
  const out = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const item = {};
    let hasData = false;

    for (let c = 0; c < headers.length; c++) {
      const h = headers[c];
      if (h === 'updatedAt') continue;
      const cell = row[c];
      if (h === '_extra') {
        if (cell && String(cell).trim()) {
          try {
            const extra = JSON.parse(String(cell));
            if (extra && typeof extra === 'object') Object.assign(item, extra);
          } catch (_e) {}
        }
        continue;
      }
      if (cell !== '' && cell !== null && cell !== undefined) {
        item[h] = cell;
        hasData = true;
      }
    }

    if (hasData) out.push(item);
  }
  return out;
}

// Reads from old 3-column format (id, json, updatedAt)
function readEntityListOldFormat_(tabName) {
  const sh = getSheetByName_(tabName);
  const last = sh.getLastRow();
  if (last <= 1) return [];
  const rows = sh.getRange(2, 1, last - 1, 3).getValues();
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const json = rows[i][1];
    if (!json) continue;
    try { out.push(JSON.parse(String(json))); } catch (_e) {}
  }
  return out;
}

// Migrates a sheet from old (id, json, updatedAt) format to columnar format.
function upgradeEntitySheetColumns_(spec) {
  const sh = getSheetByName_(spec.tab);
  if (!sh || sh.getLastRow() === 0) return;
  const numCols = sh.getLastColumn();
  const headers = sh.getRange(1, 1, 1, numCols).getValues()[0].map(String);

  // Already in new format
  if (headers.length !== 3 || headers[1] !== 'json') return;

  // Read existing data using old method before rewriting
  const existingData = readEntityListOldFormat_(spec.tab);
  if (!existingData.length) {
    // Just rewrite the header row to new columns
    sh.clearContents();
    sh.appendRow(spec.fields.concat(['_extra', 'updatedAt']));
    return;
  }

  // Rewrite sheet with new column structure
  sh.clearContents();
  sh.appendRow(spec.fields.concat(['_extra', 'updatedAt']));
  writeEntityList_(spec.tab, existingData, spec.fields);
}

function writeMapEntity_(tabName, mapObj) {
  const sh = getSheetByName_(tabName);
  const obj = mapObj && typeof mapObj === 'object' && !Array.isArray(mapObj) ? mapObj : {};
  const keys = Object.keys(obj);
  const last = sh.getLastRow();

  // SAFETY GUARD: never overwrite existing data with an empty map.
  if (keys.length === 0) {
    if (last > 1) syncLog_('SKIP_EMPTY_WRITE', tabName, 0, last - 1);
    return;
  }

  if (last > 1) sh.deleteRows(2, last - 1);


  const nowIso = new Date().toISOString();
  const rows = keys.map(function (k) {
    return [String(k), JSON.stringify(obj[k]), nowIso];
  });
  sh.getRange(2, 1, rows.length, 3).setValues(rows);
}

function readMapEntity_(tabName) {
  const sh = getSheetByName_(tabName);
  const last = sh.getLastRow();
  const out = {};
  if (last <= 1) return out;

  const rows = sh.getRange(2, 1, last - 1, 3).getValues();
  for (let i = 0; i < rows.length; i++) {
    const key = String(rows[i][0] || '');
    if (!key) continue;
    try {
      out[key] = JSON.parse(String(rows[i][1] || 'null'));
    } catch (_e) {
      out[key] = rows[i][1];
    }
  }
  return out;
}

function asArray_(v) {
  return Array.isArray(v) ? v : [];
}

function asObject_(v) {
  return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
}

function readDeletedIds_() {
  const cfg = readConfigMap_();
  const raw = asArray_(cfg[CFG_MOVS_DELETED_KEY]);
  const out = [];
  const seen = {};
  for (let i = 0; i < raw.length; i++) {
    const id = String(raw[i] && raw[i].id || '');
    if (!id || seen[id]) continue;
    seen[id] = true;
    out.push({ id: id, tsMs: Number(raw[i] && raw[i].tsMs) || 0 });
  }
  return out;
}

function markDeletedIds_(ids) {
  const list = Array.isArray(ids) ? ids.map(function (v) { return String(v || ''); }).filter(Boolean) : [];
  if (!list.length) return;
  const map = {};
  const current = readDeletedIds_();
  for (let i = 0; i < current.length; i++) {
    map[current[i].id] = current[i].tsMs || 0;
  }
  const now = Date.now();
  for (let j = 0; j < list.length; j++) {
    map[list[j]] = now;
  }
  const next = Object.keys(map).map(function (id) { return { id: id, tsMs: map[id] || now }; });
  saveConfigValue_(CFG_MOVS_DELETED_KEY, next);
}

function clearDeletedIds_(ids) {
  const list = Array.isArray(ids) ? ids.map(function (v) { return String(v || ''); }).filter(Boolean) : [];
  if (!list.length) return;
  const rm = {};
  for (let i = 0; i < list.length; i++) rm[list[i]] = true;
  const current = readDeletedIds_();
  const next = current.filter(function (r) { return !rm[String(r.id || '')]; });
  saveConfigValue_(CFG_MOVS_DELETED_KEY, next);
}

function getAllPayload_() {
  const cfg = readConfigMap_();

  const planSheet = readPlan_();
  const plan = planSheet !== null ? planSheet : (cfg.plan || null);

  const deleted = asArray_(cfg[CFG_MOVS_DELETED_KEY]).map(function (r) { return String(r && r.id || ''); }).filter(Boolean);

  const out = {
    movimientos: readMovs_(),
    movimientos_eliminados: deleted,
    plan: plan,
    personas: readEntityOrFallbackList_('personas', cfg),
    servicios: readEntityOrFallbackList_('servicios', cfg),
    capillas: readEntityOrFallbackList_('capillas', cfg),
    capellanias: readEntityOrFallbackList_('capellanias', cfg),
    fondos: readEntityOrFallbackList_('fondos', cfg),
    proyectos: readEntityOrFallbackList_('proyectos', cfg),
    colectas: readEntityOrFallbackList_('colectas', cfg),
    recordatorios: readEntityOrFallbackList_('recordatorios', cfg),
    cuentas_extra: readEntityOrFallbackList_('cuentas_extra', cfg),
    cuentas_del: readEntityOrFallbackList_('cuentas_del', cfg),
    cierres: readEntityOrFallbackList_('cierres', cfg),
    vehiculos: readEntityOrFallbackList_('vehiculos', cfg),
    saldos_iniciales: readSaldosOrFallback_(cfg),
    ts: new Date().toISOString()
  };

  return out;
}

function readEntityOrFallbackList_(key, cfg) {
  const spec = getEntitySpecByKey_(key);
  if (!spec) return asArray_(cfg[key]);
  const sheetData = readEntityList_(spec.tab, spec.fields);
  if (sheetData.length) return sheetData;
  return asArray_(cfg[key]);
}

function readSaldosOrFallback_(cfg) {
  const map = readMapEntity_(TAB_SALDOS_INICIALES);
  if (Object.keys(map).length) return map;
  return asObject_(cfg.saldos_iniciales);
}

function migrateLegacyConfigToEntitySheets_() {
  const cfg = readConfigMap_();

  for (let i = 0; i < ENTITY_LIST_SPECS.length; i++) {
    const spec = ENTITY_LIST_SPECS[i];
    const current = readEntityList_(spec.tab, spec.fields);
    if (current.length) continue;
    if (cfg[spec.key] === undefined) continue;
    writeEntityList_(spec.tab, asArray_(cfg[spec.key]), spec.fields);
  }

  const plan = readPlan_();
  if (plan === null && cfg.plan !== undefined) {
    savePlan_(cfg.plan);
  }

  const saldos = readMapEntity_(TAB_SALDOS_INICIALES);
  if (!Object.keys(saldos).length && cfg.saldos_iniciales !== undefined) {
    writeMapEntity_(TAB_SALDOS_INICIALES, asObject_(cfg.saldos_iniciales));
  }
}

// ─── SAFETY: Backup & Log functions ─────────────────────────────────────────

// Creates or overwrites a backup sheet (_bak_NAME) with a snapshot of 'sh'.
// Keeps only the most recent snapshot to avoid filling the spreadsheet.
function backupSheet_(sh, tabName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const bakName = '_bak_' + tabName;
    let bak = ss.getSheetByName(bakName);
    if (bak) {
      bak.clearContents();
    } else {
      bak = ss.insertSheet(bakName);
      // Move backup sheet to the end so it doesn't clutter the main view
      ss.setActiveSheet(sh); // restore focus
    }
    const lastRow = sh.getLastRow();
    const lastCol = sh.getLastColumn();
    if (lastRow > 0 && lastCol > 0) {
      const data = sh.getRange(1, lastRow > 0 ? 1 : 1, lastRow, lastCol).getValues();
      bak.getRange(1, 1, lastRow, lastCol).setValues(data);
    }
    // Hide backup sheets from casual view
    bak.hideSheet();
  } catch (e) {
    // Backup failure must never interrupt the main write
    console.error('backupSheet_ failed for ' + tabName + ': ' + String(e));
  }
}

// Appends one row to the _SyncLog sheet. Trims old rows if over limit.
function syncLog_(accion, hoja, entrantes, existentes) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSh = ss.getSheetByName(TAB_SYNC_LOG);
    if (!logSh) return;
    const resultado = (entrantes === 0 && existentes > 0) ? 'ADVERTENCIA' : 'OK';
    logSh.appendRow([new Date().toISOString(), accion, hoja, entrantes, existentes, resultado]);
    // Trim to keep only last SYNC_LOG_MAX_ROWS rows
    const last = logSh.getLastRow();
    if (last > SYNC_LOG_MAX_ROWS + 1) {
      logSh.deleteRows(2, last - SYNC_LOG_MAX_ROWS - 1);
    }
  } catch (e) {
    console.error('syncLog_ failed: ' + String(e));
  }
}

function genId_() {
  return 'row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function genCodigo_(tipo, fecha) {
  const f = String(fecha || '');
  const mes = f.slice(0, 7).replace(/-/g, '');
  const tipoPfx = tipo === 'ingreso' ? 'I' : (tipo === 'egreso' ? 'E' : 'T');
  const seq = (Math.random() * 10000 | 0).toString().padStart(5, '0');
  return tipoPfx + mes + seq;
}

function procesarMovimientosInput_() {
  const sh = getSheetByName_(TAB_MOVS_ENTRADA);
  if (!sh) return;
  
  const lastRow = sh.getLastRow();
  if (lastRow <= 1) return;
  
  const plan = readPlan_() || {};
  const allMovs = readMovs_();
  const nuevos = [];
  const rowsToDelete = [];
  
  try {
    const rows = sh.getRange(2, 1, lastRow - 1, 11).getValues();
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      
      const fecha = String(row[0] || '').trim();
      const tipo = String(row[1] || '').trim().toLowerCase();
      const montoStr = String(row[2] || '').trim();
      const desc = String(row[3] || '').trim();
      const grupoNombre = String(row[4] || '').trim();
      const cuentaNombre = String(row[5] || '').trim();
      const subcuentaNombre = String(row[6] || '').trim();
      const cuentaPago = String(row[7] || '').trim();
      const boleta = String(row[8] || '').trim() || null;
      const canal = String(row[9] || '').trim() || 'general';
      const procesado = String(row[10] || '').trim();
      
      if (procesado === 'SI' || procesado === '✓') {
        rowsToDelete.push(rowNum);
        continue;
      }
      
      if (!fecha || !tipo || !montoStr) continue;
      
      if (!['ingreso', 'egreso', 'transferencia'].includes(tipo)) continue;
      
      const monto = parseFloat(montoStr.replace(/[^0-9.-]/g, '')) || 0;
      if (monto <= 0) continue;
      
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) continue;
      
      let gCode = '', cCode = '', sCode = '';
      let grupo = grupoNombre, cuenta = cuentaNombre, sub = subcuentaNombre;
      
      const tipoPlan = plan[tipo] || [];
      if (grupoNombre) {
        const g = tipoPlan.find(x => String(x.name || '').toLowerCase() === grupoNombre.toLowerCase());
        if (g) {
          gCode = g.code;
          grupo = g.name;
          if (cuentaNombre) {
            const c = (g.cuentas || []).find(x => String(x.name || '').toLowerCase() === cuentaNombre.toLowerCase());
            if (c) {
              cCode = c.code;
              cuenta = c.name;
              if (subcuentaNombre) {
                const s = (c.subs || []).find(x => String(x.name || '').toLowerCase() === subcuentaNombre.toLowerCase());
                if (s) {
                  sCode = s.code;
                  sub = s.name;
                }
              }
            }
          }
        }
      }
      
      const movimiento = {
        id: genId_(),
        tipo: tipo,
        fecha: fecha,
        monto: monto,
        moneda: 'PEN',
        desc: desc,
        gCode: gCode,
        grupo: grupo,
        cCode: cCode,
        cuenta: cuenta,
        sCode: sCode,
        sub: sub,
        cuentaPago: cuentaPago,
        boleta: boleta,
        curia: false,
        isPend: false,
        canal: canal,
        codigo: genCodigo_(tipo, fecha),
        ts: new Date().toISOString(),
        tsMs: Date.now(),
        _importadoDesdeSheets: true
      };
      
      upsertMov_(movimiento);
      nuevos.push(movimiento);
      rowsToDelete.push(rowNum);
    }
    
    if (rowsToDelete.length) {
      rowsToDelete.sort((a, b) => b - a);
      for (let i = 0; i < rowsToDelete.length; i++) {
        sh.deleteRow(rowsToDelete[i]);
      }
    }
    
  } catch (e) {
    console.error('Error procesando entrada de movimientos:', e);
  }
}
