# 📋 Configurar Google Apps Script para sincronización

## 🎯 Objetivo
Crear un "middleware" en Google Sheets que permita sincronizar datos entre EconomiaCap y una hoja de cálculo compartida.

---

## 📝 Paso 1: Crear Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com)
2. Clic en **"+ Nueva hoja de cálculo"**
3. Nombra: **"EconomiaCap"**
4. El documento se abre automáticamente

---

## ⚙️ Paso 2: Crear el Apps Script

### 2.1 Acceder al editor de Scripts

1. En tu Google Sheet abierta
2. Menú: **Extensiones** → **Apps Script**
3. Se abre una nueva pestaña con el editor

### 2.2 Copiar el código

1. En el archivo `GOOGLE_APPS_SCRIPT.gs` que creamos, **copia todo el contenido**
2. En el editor de Apps Script, **borra** el código por defecto (`function myFunction()...`)
3. **Pega** todo el código de `GOOGLE_APPS_SCRIPT.gs`
4. Presiona **Ctrl+S** (o Cmd+S) para guardar

---

## 🚀 Paso 3: Hacer deploy como aplicación web

### 3.1 Crear despliegue

1. En el editor de Apps Script, click en **"Nuevo despliegue"** (esquina superior derecha)
2. En el menú desplegable, selecciona **"Aplicación web"**
3. Configura:
   - **Ejecutar como:** Tu email (o la cuenta que usa Sheets)
   - **Quién tiene acceso:** "Cualquiera"
4. Click en **"Implementar"**

### 3.2 Copiar la URL

1. Se abre un popup con la URL de despliegue
2. **Copia la URL completa** (comienza con `https://script.google.com/macros/s/...`)
3. **Guárdala en un lugar seguro** - la necesitarás en la app

---

## ✅ Paso 4: Verificar que funciona

### 4.1 Test rápido desde el Apps Script

1. En el editor, click en la función **`onOpen`**
2. Click en el botón **▶ Ejecutar**
3. Se pedirán permisos - **autoriza**
4. Regresa a tu Google Sheet, refresca la página (F5)
5. Debería aparecer un nuevo menú: **"EconomiaCap"** en la barra superior

### 4.2 Verificar estructura

1. En el Google Sheet, click en **"EconomiaCap"** menú
2. Selecciona **"Mostrar URL de sincronización"**
3. Se abre una ventana con la URL - **cópiala**

---

## 📱 Paso 5: Configurar en la app

1. Abre EconomiaCap (en web o iPhone)
2. Menú → **Configuración** (o Tools en sidebar izquierda)
3. Busca sección **"Google Sheets"**
4. Pega la URL del Apps Script en el campo
5. Click en **"Probar conexión"**
6. Si sale ✓, ¡está listo!

---

## 🔄 Paso 6: Primera sincronización

### Desde la app:

1. Menú → **Herramientas** → **Sincronizar ahora**
2. Debería decir: "X movimientos cargados desde Sheets ✓"
3. Ahora tus datos están en ambos lados

### Para empujar nuevos datos:

1. Crea algunos movimientos en la app
2. Menú → **Herramientas** → **Sincronizar ahora**
3. En tu Google Sheet verás los nuevos movimientos

---

## ✍️ Agregar movimientos directamente en Sheets (Entrada Manual)

Ahora puedes agregar movimientos directamente en Google Sheets y aparecerán en la app automáticamente.

### Cómo funciona:

1. En tu Google Sheet de EconomiaCap, verás una pestaña llamada **"Movimientos_Entrada"**
2. En esa pestaña, completa una fila con:
   - **Fecha**: YYYY-MM-DD (ej: 2026-05-06)
   - **Tipo**: `ingreso`, `egreso`, o `transferencia`
   - **Monto**: número (ej: 150.50)
   - **Descripción**: texto libre
   - **Grupo**: nombre del grupo contable (opcional, ej: "Gastos de Convento")
   - **Cuenta**: nombre de la subcuenta (opcional, ej: "Luz")
   - **Subcuenta**: subdetalle (opcional)
   - **Cuenta_Pago**: de dónde sale (ej: "BCP", "Efectivo", etc.)
   - **Boleta**: número de comprobante (opcional)
   - **Canal**: forma de pago (ej: "transferencia", "efectivo")

### Ejemplo de fila:

| Fecha | Tipo | Monto | Descripción | Grupo | Cuenta | Subcuenta | Cuenta_Pago | Boleta | Canal |
|-------|------|-------|-------------|-------|--------|-----------|-------------|--------|-------|
| 2026-05-06 | egreso | 250.00 | Pago de servicios | Gastos de Convento | Luz | | BCP | | transferencia |

### Qué sucede:

1. Completas la fila en **"Movimientos_Entrada"** ✍️
2. Abres tu app y presionas **"Sincronizar ahora"** 🔄
3. El Apps Script detecta la nueva fila automáticamente
4. La convierte a movimiento JSON válido
5. La inserta en la hoja **"Movimientos"** 
6. Tu app ve el nuevo movimiento en el siguiente sync ✅
7. La fila se marca como procesada (columna `_procesado`) y se limpia

### Notas importantes:

- ✅ Todos los campos son **opcionales** excepto Fecha, Tipo y Monto
- ✅ Si no especificas Grupo/Cuenta, el movimiento queda sin clasificar (puedes ajustarlo luego desde la app)
- ✅ La app hace merge no destructivo, así que no pierdes datos
- ✅ Los nuevos movimientos llegan con timestamp actual y se ordenan automáticamente
- ❌ No edites manualmente la hoja **"Movimientos"** (eso es solo lectura/interna)

---

## 🔐 Configuración de permisos en Sheets

La opción "Quién tiene acceso: Cualquiera" es segura porque:
- ✅ Solo acepta POST requests del dominio de la app
- ✅ Los datos se envían encriptados (HTTPS)
- ✅ No contiene tokens de acceso a tu cuenta

**PERO si quieres más seguridad:**

1. Cambia a "Quién tiene acceso: Solo personas especificadas"
2. Agrega el email de quien usa la app
3. En el Apps Script, agrega validación de token:

```javascript
// Agregar al inicio de doPost:
const SECRET_TOKEN = 'TU_TOKEN_SECRETO_AQUI';
if(e.parameter.token !== SECRET_TOKEN) {
  return ContentService.createTextOutput(JSON.stringify({error: 'Unauthorized'}));
}
```

---

## 📊 Estructuras de datos

El Apps Script crea automáticamente estas pestañas:

| Pestaña | Contenido |
|---------|-----------|
| **Movimientos** | Todos los ingresos, egresos, transferencias |
| **Config** | Configuración general (metadatos) |
| **Cuentas** | Bancos, billeteras, efectivo |
| **Fondos** | Fondos registrados |
| **Proyectos** | Proyectos de capilla |
| **Colectas** | Colectas registradas |
| **Capillas** | Capillas agregadas |
| **Capellanias** | Capellanías |
| **Servicios** | Servicios/gastos |
| **Personas** | Contactos principales |
| **Vehículos** | Vehículos |

---

## 🐛 Troubleshooting

### "Error 404 al sincronizar"
- ✅ Verifica que copiaste la URL correctamente
- ✅ Recopia desde **"EconomiaCap" → "Mostrar URL de sincronización"**
- ✅ Asegúrate que sea HTTPS (no HTTP)

### "Error de permisos"
- ✅ Vuelve a ejecutar `onOpen` en el editor de Apps Script
- ✅ Da permisos cuando se pida
- ✅ Si sigue fallando, crea un nuevo despliegue (Nuevo despliegue)

### "Los datos no se sincronizan"
- ✅ Abre el Apps Script → Ver logs (Logs recientes)
- ✅ Haz una sincronización y revisa qué error sale
- ✅ Verifica que la URL sea exacta (copia-pega, no escribas)

### "Dice que no hay despliegue"
- ✅ En el Apps Script, ve a Implementaciones (izquierda)
- ✅ Click en la de "Aplicación web"
- ✅ Copia la URL de ahí

---

## 🔄 Re-desplegar después de cambios

Si modificas el código en `GOOGLE_APPS_SCRIPT.gs`:

1. Abre el editor de Apps Script
2. Modifica el código
3. Presiona **Ctrl+S** para guardar
4. Click en **"Nuevo despliegue"**
5. Selecciona **"Aplicación web"**
6. Verifica que "Quién tiene acceso" siga siendo "Cualquiera"
7. Click **"Implementar"**
8. La URL **cambiará** - actualízala en la app

---

## 🎯 Ventajas de esta sincronización

✅ **Bidireccional** - Cambios en app → Sheets y Sheets → app  
✅ **Versionada** - Respeta qué cambio fue más reciente  
✅ **Sin duplicados** - Detecta cambios vs nuevos registros  
✅ **Segura** - HTTPS encriptado  
✅ **Gratis** - Apps Script tier gratuito de Google  

---

## 🚨 Límites

- Google Apps Script: **6 minutos máximo por ejecución**
- Sheets: **2 millones de celdas máximo por hoja**
- Llamadas API: **De forma segura hasta 1000 por día** (gratis)

Para apps empresariales, contacta a Google Cloud Support.

---

**¡Tu sincronización está lista! 🎉**

Próximo paso: [Instalar en iPhone](./INSTALAR_IPHONE.md)
