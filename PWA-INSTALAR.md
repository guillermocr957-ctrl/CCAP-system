# 📱 EconomiaCap PWA - Guía de Instalación

## ✨ ¿Qué es una PWA?

Una **Progressive Web App** es una aplicación web que funciona como una app nativa:
- ✅ Se instala en el dispositivo (teléfono, tablet, laptop)
- ✅ Acceso desde el menú de inicio (como cualquier app)
- ✅ Funciona **sin internet** (offline)
- ✅ Notificaciones nativas del SO
- ✅ Acceso rápido con shortcuts

---

## 📲 INSTALAR EN DIFERENTES DISPOSITIVOS

### **iPhone & iPad (iOS 16.4+)**

1. Abre Safari y ve a tu app (o server local)
2. Toca el botón **Compartir** (esquina inferior)
3. Desplázate y toca **"Añadir a Pantalla de Inicio"**
4. Dale un nombre y toca **"Añadir"**

✅ La app aparecerá en tu pantalla de inicio como cualquier app

---

### **Android (Chrome)**

1. Abre Chrome en tu teléfono
2. Ve a tu app
3. Toca el **menú** (⋮) en la esquina superior derecha
4. Selecciona **"Instalar app"** o **"Descargar"**
5. Confirma

✅ La app se instalará en tu menú de aplicaciones

---

### **Windows 10/11 (Edge o Chrome)**

1. Abre Edge o Chrome
2. Ve a tu app
3. Haz clic en el **icono de instalación** (esquina superior derecha)
   - Edge: 📥 junto a la barra de direcciones
   - Chrome: Menú → "Instalar EconomiaCap"
4. Haz clic en **"Instalar"**

✅ La app aparecerá en tu Menú Inicio y escritorio

---

### **Mac (Chrome o Safari)**

**Chrome:**
1. Chrome → Menú → "Instalar EconomiaCap"
2. Confirma

**Safari:**
1. Safari → Archivo → "Añadir a la bandeja de aplicaciones"

✅ Acceso rápido desde el dock o Finder

---

## 🔔 SISTEMA DE NOTIFICACIONES

### Características:
- ✅ Notificaciones en hora exacta del recordatorio
- ✅ Sonido de alerta (para recordatorios urgentes)
- ✅ Vibración en móviles
- ✅ Click en notificación → abre la app
- ✅ Funciona incluso si la app está cerrada

### Permisos:
- Al usar la app la primera vez, te pedirá permiso para notificaciones
- **Acepta** para recibir alertas de tus recordatorios

---

## 🌐 FUNCIONAMIENTO OFFLINE

- 📡 La app caché automáticamente contenido
- 🛑 Sin internet: puedes ver datos descargados
- ✅ Cambios se guardan localmente
- 🔄 Se sincronizan cuando vuelve la conexión

---

## 📦 ARCHIVOS PWA

Tu app ahora tiene:

```
EconomiaCap_v2-33.html    ← App principal (modificada)
manifest.json             ← Configuración PWA
sw.js                     ← Service Worker (caché + notificaciones)
```

---

## 🔧 CARACTERÍSTICAS TÉCNICAS

✅ **Caché inteligente** - Network First, Offline Fallback
✅ **Service Worker** - Sincronización en background
✅ **Web Notifications API** - Notificaciones nativas del SO
✅ **LocalStorage** - Datos persistentes
✅ **Responsive Design** - Funciona en cualquier pantalla
✅ **Dark/Light Mode** - Tema automático

---

## 🎯 PRÓXIMAS MEJORAS POSIBLES

- Sincronización en la nube
- Recordatorios periódicos automáticos
- Widget en el escritorio (Windows 11)
- Sincronización entre dispositivos
- Copias de seguridad automáticas

---

## ❓ SOLUCIÓN DE PROBLEMAS

**No me deja instalar:**
- Asegúrate de usar HTTPS (en servidor) o localhost
- Algunos navegadores viejos no soportan PWA

**No recibo notificaciones:**
- Verifica que diste permiso cuando pidió
- Recuerda: notificaciones a la hora exacta (no antes)

**Se ve diferente offline:**
- Es normal, muestra caché disponible
- Cambios se guardan y sincronizan cuando hay internet

---

**¡Tu app está lista para ser una app profesional!** 🚀
