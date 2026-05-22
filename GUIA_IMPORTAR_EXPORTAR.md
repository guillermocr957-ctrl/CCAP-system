# 📊 Guía de Importar/Exportar Movimientos - EconomiaCap

## 🔄 Funcionalidades

### 1. **Exportar Movimientos** 📥
- Descarga todos tus movimientos registrados en formato Excel
- Incluye: Código, Fecha, Tipo, Moneda, Monto, Plan Contable, Descripción, etc.
- Ideal para: Auditoría, análisis, backups, integración con otros sistemas

### 2. **Importar Movimientos** 📤
- Sube un archivo Excel con nuevos movimientos
- Válida automáticamente cada fila
- Crea registro de éxito/errores
- Máximo: 5MB por archivo

### 3. **Descargar Plantilla** 📋
- Obtén la plantilla oficial con estructura correcta
- Incluye ejemplo con datos reales
- Garantiza compatibilidad 100%

---

## 📋 Estructura de la Plantilla

| Campo | Tipo | Obligatorio | Ejemplo |
|-------|------|-------------|---------|
| **Código** | Texto | No | ABC-2026-001 |
| **Fecha** | Fecha (YYYY-MM-DD) | ✅ Sí | 2026-04-23 |
| **Tipo** | ingreso/egreso/transferencia | ✅ Sí | ingreso |
| **Moneda** | PEN/USD/EUR | No | PEN |
| **Monto** | Número decimal | ✅ Sí | 5000.50 |
| **Grupo** | Código del grupo | No | 01 |
| **Cuenta** | Código de cuenta | No | 0101 |
| **Subcuenta** | Código de subcuenta | No | 010101 |
| **Descripción** | Texto | No | Ofrenda del domingo |
| **Cuenta pago** | ID de cuenta | No | cuenta_principal |
| **Boleta** | si/no | No | si |
| **Curia** | Sí/No | No | No |
| **Pendiente cuentas** | Sí/No | No | No |

---

## ✅ Ejemplo de Importación Correcta

```excel
Código | Fecha      | Tipo      | Moneda | Monto  | Grupo | Cuenta | Descripción
       | 2026-04-23 | ingreso   | PEN    | 5000   | 01    | 0101   | Ofrenda
       | 2026-04-22 | egreso    | PEN    | 1500   | 02    | 0205   | Servicios
```

---

## ⚠️ Validaciones Importantes

✅ **Se aceptan:**
- Fechas en formato YYYY-MM-DD
- Números con decimales (usa . como separador)
- Espacios en blanco al inicio/final (se eliminan automáticamente)
- Tipo en minúsculas o mayúsculas
- Monedas: PEN, USD, EUR (en mayúsculas)

❌ **Se rechazan:**
- Filas sin Fecha
- Filas sin Tipo
- Filas sin Monto
- Valores de Moneda inválidos
- Caracteres especiales en códigos

---

## 🚀 Pasos para Importar

1. **Abre EconomiaCap**
2. **Ve a Gestión → Importar/Exportar**
3. **Haz clic en "Seleccionar archivo"**
4. **Elige tu archivo Excel (.xlsx)**
5. **Espera a que se procese**
6. **Verifica el resultado en el historial**

---

## 💡 Consejos

- 📁 **Haz backup antes**: Usa el botón "Exportar movimientos" para guardar tus datos
- ✏️ **Revisa tu Excel**: Verifica que todas las fechas y montos sean correctos
- 📊 **Plan Contable**: Asegúrate que los códigos de grupo/cuenta existan en tu sistema
- ⏱️ **Importa regularmente**: Mantén tu información actualizada
- 🔍 **Valida después**: Revisa el panel "Últimas operaciones" para confirmar

---

## ❌ Si Algo Falla

**Error: "Archivo vacío"**
- Verifica que tu Excel tenga datos en la primera hoja
- La plantilla debe tener al menos 1 fila de datos

**Error: "No se pudo importar ningún movimiento"**
- Revisa que Fecha, Tipo y Monto estén presentes en TODAS las filas
- Usa la plantilla descargada como referencia

**Error: "Algunas filas con errores fueron ignoradas"**
- Esto es normal si hay filas incompletas
- Los movimientos válidos se importaron de todas formas
- Revisa el archivo y intenta de nuevo

---

**Versión**: 2.0 | **Última actualización**: Abril 2026
