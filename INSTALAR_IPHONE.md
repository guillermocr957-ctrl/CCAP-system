# 📱 Instalar EconomiaCap en iPhone como PWA

## ¿Qué es una PWA?
Una **Progressive Web App** es una app web que se comporta como app nativa en tu iPhone:
- ✅ Se abre sin barra de Safari
- ✅ Se ve en tu pantalla de inicio
- ✅ Funciona offline
- ✅ Notificaciones nativas

---

## 🚀 Instalación en iPhone (2 métodos)

### **Método 1: Botón de instalación automática** (Más fácil)

1. Abre EconomiaCap en Safari: `https://[tu-dominio].netlify.app`
2. Espera 2-3 segundos a que cargue completamente
3. Presiona el **botón compartir** (cuadro con flecha hacia arriba) en la barra inferior
4. Desplázate y presiona **"Agregar a pantalla de inicio"**
5. Dale un nombre (ej: "EconomiaCap") y toca **"Agregar"**
6. ¡Listo! La app aparece en tu home screen

---

### **Método 2: Instalación manual** (Si el botón no aparece)

1. Abre Safari y ve a `https://[tu-dominio].netlify.app`
2. Menú → **Opciones** (⋯)
3. Toca **"Agregar a pantalla de inicio"**
4. Dale un nombre personalizado
5. Toca **"Agregar"**

---

## ✅ Verificar que funciona

Después de instalar:

1. **Toca el icono en home screen** - Se abre sin barra de Safari ✓
2. **Ve a Configuración** - Debería aparecer en "Aplicaciones instaladas"
3. **Prueba offline** - Activa Airplane mode y verifica que sigue funcionando
4. **Sincronización** - Si configuraste Google Sheets, prueba sincronizar

---

## 🔧 Configuración dentro de la app

Una vez abierta en iPhone:

### 1️⃣ Moneda por defecto
Configuración → Monedas → Selecciona PEN/USD/EUR

### 2️⃣ Google Sheets Sync (opcional)
1. Abre la app → Menú de herramientas (lado izquierdo)
2. Ve a **Configuración**
3. Busca **"Google Sheets"**
4. Pega la URL del Google Apps Script:
   ```
   https://script.google.com/macros/d/DEPLOYMENT_ID/usercache/guid=
   ```
   (Obtén esto del editor de Google Sheets → "EconomiaCap" menú → "Mostrar URL")

### 3️⃣ Importar datos iniciales
- Si tienes un archivo Excel, usa Importar → Selecciona archivo
- Si vienes de Sheets, usa "Importar desde Sheets"

---

## 📊 Permuta de datos en iPhone

### Crear movimiento
1. Botón **+** en esquina inferior derecha
2. Completa: fecha, monto, tipo, cuenta
3. Toca **Registrar**

### Ver historial
- En la pestaña **"Movimientos"** ves todas las transacciones
- Por defecto ordena más reciente arriba
- Toca para editar/eliminar

### Sincronizar con Sheets
- Menú → Herramientas → **Sincronizar ahora**
- Muestra estado: "2 nuevos, 1 actualizado"

---

## 🌐 Acceso desde cualquier dispositivo

La app está en la web, así que:

- 📱 iPhone: Instalada como PWA
- 🖥️ Mac: Abre en Safari / Chrome
- 🪟 Windows/Android: Abre en Chrome/Edge
- 📊 Sheets: Se sincroniza automáticamente

**Una sola base de datos compartida** ✨

---

## 🔐 Seguridad

- Los datos se guardan **localmente en tu iPhone** (localStorage)
- Solo se sincronizan a Sheets si TÚ presionas "Sincronizar"
- No se envía a servidores externos (excepto Sheets si lo configuras)
- Cada dispositivo tiene su propia copia local

---

## 🐛 Troubleshooting

### "No me deja instalar"
- ✅ Verifica que sea HTTPS (debe empezar con https://)
- ✅ Espera 3 segundos después de cargar
- ✅ Prueba con Safari (no Chrome)

### "Se cierra de repente"
- ✅ La app ocupa espacio en localStorage. Limpia datos antiguos
- ✅ En iPhone: Configuración → Safari → Historial → Borrar datos
- ✅ Desinstala y reinstala la app

### "La sincronización falla"
- ✅ Verifica la URL de Sheets es correcta
- ✅ Abre la URL en navegador - debería devolver JSON
- ✅ Asegúrate de tener internet activo

### "Perdí mis datos"
- ✅ Si estaba sincronizada a Sheets, están allá
- ✅ Si no estaba sincronizada, lamentablemente se perdieron (sin backup)
- **CONSEJO**: Sincroniza regularmente a Sheets

---

## 📲 Compartir acceso (avanzado)

Si quieres que otra persona acceda:

### Opción A: Compartir Sheets
1. Abre tu Google Sheet
2. Botón Compartir (esquina superior derecha)
3. Dale acceso a la otra persona
4. Dale la URL de tu app Netlify
5. Ambos sincronizarán a la misma Sheets

### Opción B: Compartir solo app (datos locales)
- Comparte la URL de Netlify
- Cada uno tiene sus propios datos locales
- No se sincronizan entre dispositivos

---

## 🎯 Próximos pasos

1. ✅ Deploy en Netlify (ver DEPLOY_NETLIFY.md)
2. ✅ Crear hoja en Google Sheets + GAS (ver GOOGLE_APPS_SCRIPT.gs)
3. ✅ Instalar en iPhone
4. ✅ Configurar Sheets sync
5. ✅ Empezar a registrar movimientos

---

**¡Tu app está lista para uso en producción! 🚀**
