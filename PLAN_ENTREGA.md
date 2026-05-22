# 🎯 Plan de entrega - EconomiaCap

**Estado:** ✅ Código completado y validado  
**Fecha:** 24 de abril de 2026  
**Versión:** 2.33

---

## 📦 Archivos incluidos

```
/ContaCap/
├── EconomiaCap_v2-33.html          ← APP PRINCIPAL (única carpeta de código)
├── manifest.json                   ← Configuración PWA
├── sw.js                           ← Service Worker (offline)
├── GOOGLE_APPS_SCRIPT.gs           ← Google Sheets Sync (nuevo)
├── DEPLOY_NETLIFY.md               ← Instrucciones deploy (nuevo)
├── CONFIGURAR_GAS.md               ← Setup Google Apps Script (nuevo)
├── INSTALAR_IPHONE.md              ← Instalar en iPhone (nuevo)
├── assets/
│   └── logos/
└── [otros archivos de documentación]
```

---

## 🚀 Plan paso a paso

### **FASE 1: Preparación (~5 min)**

- [ ] Revisa que todos los archivos estén listos
- [ ] Lee `DEPLOY_NETLIFY.md` - elige tu método (GitHub, CLI, o drag&drop)
- [ ] Lee `CONFIGURAR_GAS.md` - prepárate para Google Sheets

### **FASE 2: Deploy en Netlify (~10 min)**

#### Opción A: GitHub (Recomendado - más fácil después)
```bash
cd /Users/guillermo/Downloads/ContaCap
git init
git add .
git commit -m "EconomiaCap v2.33"
git remote add origin https://github.com/tu-usuario/ContaCap.git
git push -u origin main
```
Luego en [netlify.com](https://netlify.com):
- "Add new site" → "Import from GitHub"
- Selecciona tu repo
- Deploy automático ✨

#### Opción B: CLI (Más rápido ahora)
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=/Users/guillermo/Downloads/ContaCap
```

#### Opción C: Drag & Drop (Más fácil pero manual)
- Ve a [netlify.com/drop](https://netlify.com/drop)
- Arrastra la carpeta

**Resultado:** URL como `https://economiacap.netlify.app`

### **FASE 3: Configurar Google Sheets Sync (~15 min)**

1. Crea nueva Google Sheet: [sheets.google.com](https://sheets.google.com)
2. En la Sheet → **Extensiones** → **Apps Script**
3. Copia todo el contenido de `GOOGLE_APPS_SCRIPT.gs`
4. Pégalo en el editor (borra el código por defecto)
5. Presiona **Ctrl+S**
6. Click **"Nuevo despliegue"** → **"Aplicación web"** → **"Implementar"**
7. Copia la URL de despliegue

**Resultado:** URL como `https://script.google.com/macros/s/.../usercache/guid=`

### **FASE 4: Pruebas en web (~5 min)**

1. Abre tu app en Netlify: `https://economiacap.netlify.app`
2. ¿Carga correctamente? ✓
3. Pega la URL de Google Apps Script en **Configuración** → **Google Sheets**
4. Click **"Probar conexión"** - debería mostrar ✓
5. Click **"Sincronizar ahora"** - debería decir "0 movimientos cargados" (primera vez)

### **FASE 5: Instalar en iPhone (~5 min)**

1. Abre Safari en tu iPhone
2. Ve a `https://economiacap.netlify.app`
3. Presiona el botón **Compartir** (↗)
4. Desplázate y presiona **"Agregar a pantalla de inicio"**
5. Llámala **"EconomiaCap"** y presiona **"Agregar"**
6. ¡Listo! Aparecerá en tu home screen como app nativa

### **FASE 6: Primeros datos**

1. Abre EconomiaCap en iPhone (desde home screen)
2. **Registra un movimiento de prueba**
3. Menú → **Sincronizar ahora** - debería enviarse a Sheets
4. Abre tu Google Sheet - ¡deberías verlo allá!

---

## ✅ Checklist de validación

- [ ] App carga sin errores en web
- [ ] Responsive se ve bien en iPhone (sidebar deslizable)
- [ ] Botones tienen min 44x44px (fácil tocar)
- [ ] Funciona offline (activa airplane mode, debe seguir funcionando)
- [ ] PWA se instala en home screen sin barra de Safari
- [ ] Google Sheets sync conecta correctamente
- [ ] Se pueden registrar movimientos
- [ ] Se pueden eliminar movimientos
- [ ] Las transferencias se borran atómicamente (ambas líneas)
- [ ] Sincronización bidireccional funciona

---

## 🎯 Características ya incluidas

### ✅ Core Features
- Registro de ingresos/egresos/transferencias
- Múltiples cuentas (efectivo, bancaria, billetera, Yape/Plin)
- Múltiples monedas (PEN, USD, EUR)
- Historial ordenado (más reciente arriba)
- Búsqueda y filtrado

### ✅ Avanzadas
- Colapsado inteligente del historial (hoy/mes actual expandido)
- Registros divididos (split de gastos)
- Reconciliación bancaria
- Recordatorios configurables
- Fondos, proyectos, colectas, capillas, servicios
- Gestión de personas y vehículos

### ✅ Seguridad & Integridad
- Validación de registros divididos (deben sumar)
- Eliminar transferencias atómicamente (sin huérfanos)
- Referential integrity (no borres entidades con movimientos)
- Deduplicación en importes
- Sincronización con versionado (respeta cambios más recientes)
- Error handling visible (no pierdas datos silenciosamente)

### ✅ PWA & Offline
- Funciona completamente offline
- Service Worker con caché
- Se instala en home screen del iPhone
- Notificaciones nativas

### ✅ Import/Export
- Importar desde Excel (.xlsx)
- Importar desde Yape (CSV)
- Exportar a PDF
- Sincronización bidireccional Google Sheets

---

## 📝 Documentación para el usuario

Incluye estos archivos con la entrega:

1. **DEPLOY_NETLIFY.md** - Cómo hacer deploy
2. **CONFIGURAR_GAS.md** - Cómo configurar Google Sheets
3. **INSTALAR_IPHONE.md** - Cómo instalar en iPhone
4. **PWA-INSTALAR.md** - (ya existe) PWA genérica
5. **GUIA_IMPORTAR_EXPORTAR.md** - (ya existe) Importar/exportar

---

## 🔄 Actualizar después de la entrega

Si necesitas cambios futuros:

1. **Cambio en HTML:**
   ```bash
   # Si usas GitHub
   git add EconomiaCap_v2-33.html
   git commit -m "Cambio: descripción"
   git push
   # Netlify redeploy automático
   ```

2. **Cambio en Google Apps Script:**
   - Edita en el editor
   - Presiona Ctrl+S
   - Nuevo despliegue (cambiará la URL)
   - Actualiza la URL en la app

---

## 🎁 Bonus - Para ir más lejos

### Agregar autenticación (futuro)
- Implementar login con Google
- Sincronización con múltiples usuarios

### Agregar notificaciones push
- Ya tiene service worker, solo agregar subscripción

### Integración con otros servicios
- Integración Yape API (push automático de transactions)
- Integración contable QuickBooks

---

## 📞 Soporte

**Si algo no funciona:**

1. Revisa los logs en Netlify (Deploys section)
2. Abre console en Chrome DevTools (F12)
3. Revisa los logs del Apps Script (Apps Script → View logs)

**Si pierdes datos:**
- Si estaba sincronizado a Sheets, está ahí
- Si no estaba sincronizado, lamentablemente se perdió
- **Recomendación:** Sincroniza regularmente

---

## 🚀 RESUMEN - Próximos 3 pasos

1. **Deploy en Netlify** (elige GitHub o CLI) → `https://economiacap.netlify.app`
2. **Configurar Google Apps Script** (copia código, implementa) → obtén URL
3. **Instalar en iPhone** (abre en Safari, agregar pantalla) → ¡listo!

---

**¡Tu aplicación está lista para producción! 🎉**

Versión estable, auditada, y con todas las medidas de seguridad.  
Adelante con los datos reales.

*Última actualización: 24 de abril de 2026*
