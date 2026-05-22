# 🚀 Deploy en Netlify - EconomiaCap

## Opción A: Deploy desde GitHub (Recomendado)

### 1️⃣ Subir a GitHub
```bash
# Crear repositorio en GitHub (sin .git aún)
cd /Users/guillermo/Downloads/ContaCap

# Inicializar git
git init
git add .
git commit -m "Initial commit: EconomiaCap v2.33"

# Agregar remote (reemplaza USER y REPO)
git remote add origin https://github.com/USER/REPO.git
git branch -M main
git push -u origin main
```

### 2️⃣ Conectar Netlify a GitHub
1. Ve a [netlify.com](https://netlify.com) y crea cuenta (gratis)
2. Haz login
3. Click en **"Add new site"** → **"Import an existing project"**
4. Elige **GitHub**
5. Autoriza Netlify y selecciona tu repositorio
6. **Build settings:**
   - Build command: `# (dejar vacío)`
   - Publish directory: `.` (root)
7. Click **"Deploy"**

### 3️⃣ Configurar dominio personalizado (opcional)
- En Netlify dashboard, ve a "Site settings" → "Domain management"
- Agrega tu dominio propio o usa el subdomain autogenerado

---

## Opción B: Deploy Manual (Drag & Drop)

### 1️⃣ Preparar archivos
```bash
# Solo necesitas estos archivos:
EconomiaCap_v2-33.html
manifest.json
sw.js
assets/logos/* (opcional)
```

### 2️⃣ Subir a Netlify
1. Ve a [netlify.com/drop](https://netlify.com/drop)
2. Arrastra la carpeta del proyecto
3. ¡Listo! Netlify te da una URL automática

---

## Opción C: Deploy con CLI (Línea de comandos)

### 1️⃣ Instalar Netlify CLI
```bash
npm install -g netlify-cli
# o con brew
brew install netlify-cli
```

### 2️⃣ Login
```bash
netlify login
```

### 3️⃣ Deploy
```bash
cd /Users/guillermo/Downloads/ContaCap
netlify deploy --prod --dir=.
```

---

## ✅ Verificar que todo está bien

Después del deploy:

1. ✅ Abre tu app en la URL de Netlify
2. ✅ Verifica que se instale en home del iPhone (agregar a pantalla de inicio)
3. ✅ Prueba que funcione offline
4. ✅ Verifica que los formularios funcionen
5. ✅ Testa el sync con Sheets (si configuraste GAS)

---

## 🔗 Variables de entorno (si usas GAS Sync)

En **Netlify Dashboard** → **Site settings** → **Build & deploy** → **Environment**:

No necesitas variables si guardas la URL de Sheets directo en la app. Pero si quieres por seguridad:

```
GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/usercache/guid=
```

Luego en el HTML (línea ~3213), cambia:
```html
<!-- De: -->
<input type="url" id="sync-url" placeholder="https://script.google.com/macros/s/...">

<!-- A: -->
<input type="url" id="sync-url" value="${process.env.GOOGLE_SHEETS_URL || ''}" placeholder="https://script.google.com/macros/s/...">
```

---

## 🚨 Troubleshooting

### "Error 404 - No encontrado"
- Revisa que `EconomiaCap_v2-33.html` esté en el root del repo
- En Netlify, publish directory debe ser `.`

### "La PWA no se instala"
- Asegúrate de que `manifest.json` esté en el mismo directorio
- El HTML debe tener `<link rel="manifest" href="./manifest.json">`

### "No sincroniza con Sheets"
- Copia la URL desde Google Apps Script (menú "EconomiaCap" → "Mostrar URL")
- Pégala en la app → Configuración → Google Sheets
- Verifica que el GAS esté publicado con "Nuevo despliegue"

---

## 📱 URL después del deploy

Tu app estará disponible en:
```
https://[nombreapp].netlify.app
```

Cópiala en el navegador del iPhone y agrega a pantalla de inicio.

---

## 🔄 Actualizar después de cambios

Si usas GitHub:
```bash
git add .
git commit -m "Update: [descripción del cambio]"
git push
```
Netlify redeploy automático ✨

Si usas drag & drop en netlify/drop:
- Simplemente arrastra la carpeta nuevamente

---

**¿Necesitas ayuda? Revisa los logs en Netlify Dashboard → Deploys**
