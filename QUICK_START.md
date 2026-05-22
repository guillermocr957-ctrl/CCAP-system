# ⚡ Quick Start - Los 3 pasos en 10 minutos

## 🔥 Opción rápida: Deploy sin complicaciones

---

## **PASO 1: Deploy en Netlify (5 min)**

### Sin Git (más fácil aún):
1. Descarga [Netlify CLI](https://cli.netlify.com/):
   ```bash
   npm install -g netlify-cli
   ```

2. En terminal:
   ```bash
   cd /Users/guillermo/Downloads/ContaCap
   netlify deploy --prod
   ```

3. Sigue las instrucciones interactivas - ¡listo! Te dará una URL.

### O más fácil aún - Drag & Drop:
- Ve a [netlify.com/drop](https://netlify.com/drop)
- Arrastra la carpeta `/ContaCap`
- Espera → URL automática

**Resultado:** `https://xxx.netlify.app` ✅

---

## **PASO 2: Google Sheets (3 min)**

### Si NO necesitas sincronización:
**Sáltate este paso.** La app funciona sin Sheets.

### Si SÍ necesitas sincronización:
1. Abre [sheets.google.com](https://sheets.google.com)
2. Nueva hoja → Nombre: "EconomiaCap"
3. Extensiones → Apps Script
4. Borra el código por defecto
5. Copia todo de `GOOGLE_APPS_SCRIPT.gs` del proyecto
6. Ctrl+S → Nuevo despliegue → Aplicación web
7. Copia la URL de despliegue

**Resultado:** URL como `https://script.google.com/macros/s/...` ✅

---

## **PASO 3: iPhone (2 min)**

1. Abre Safari en iPhone
2. Teclado: `https://xxx.netlify.app` (tu URL)
3. Botón compartir (↗) → Agregar pantalla inicio
4. Nombre: "EconomiaCap" → Agregar

**Resultado:** App nativa en home screen ✅

---

## **LISTO PARA USAR**

```
Abre EconomiaCap desde home → Registra movimientos
Si sincronización: Menú → Sincronizar → Revisa Google Sheets
```

---

## 📚 Documentación completa

Si necesitas más detalles:
- [Plan detallado](./PLAN_ENTREGA.md)
- [Deploy en Netlify](./DEPLOY_NETLIFY.md)
- [Google Apps Script](./CONFIGURAR_GAS.md)
- [Instalar en iPhone](./INSTALAR_IPHONE.md)

---

**¿Preguntas? Revisa los logs en Netlify o Google Apps Script**
