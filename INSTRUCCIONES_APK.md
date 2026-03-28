# 📦 Instrucciones para Generar la APK y usar Firebase Push Notifications

He integrado un sistema nativo usando **Capacitor** para que la app se comunique directamente con el dispositivo, registre el token y pueda recibir notificaciones Push incluso si está en segundo plano.

## 1. Archivo google-services.json (CRÍTICO) 🔑
Para que Firebase autorice al APK a recibir notificaciones, tienes que vincular la app en tu proyecto de Firebase. 
No he podido hacerlo porque Firebase te pedirá iniciar sesión con tu cuenta de Google.

**Pasos a seguir en Firebase:**
1. Ve a tu [Consola de Firebase](https://console.firebase.google.com/).
2. Ábre tu proyecto.
3. Añade una **"App de Android"** (el botón con el ícono de Android).
4. Cuando te pida el **"Nombre del paquete de Android"**, debes poner **exactamente este**: 
   `com.horaciolidity.rapifletes`
5. Registra la app y descarga el archivo `google-services.json`.
6. Coloca ese archivo descargado `google-services.json` **adentro de la carpeta:** `android/app/` de tu proyecto.

---

## 2. Abrir en Android Studio para Compilar 🛠️

Una vez listo lo anterior, abre la carpeta generada en Android Studio:
1. Abre tu terminal en la carpeta principal `rapi fletes`.
2. Ejecuta este comando (si usas powershell, usa cmd primero):
   ```cmd
   npm run build
   npx cap sync
   npx cap open android
   ```
3. Android Studio se abrirá. Deja que termine de indexar y descargar los paquetes de Gradle requeridos (puede tardar un par de minutos).
4. En Android Studio, ve al menú arriba: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
5. Cuando termine, te aparecerá un mensaje abajo a la derecha diciendo *Build APK(s) successfully*. 
6. Presiona **"locate"** en ese aviso (o encuéntralo en `android/app/build/outputs/apk/debug/app-debug.apk`). ¡Este es el archivo `.apk` final que puedes instalar en tu teléfono!

## 3. ¿Cómo funciona el nuevo servicio Push? 🚀
- Se instaló la suite `@capacitor/push-notifications`.
- El archivo `src/services/pushNotifications.js` automáticamente pide permiso la primera vez que inicia sesión.
- Envía el `token_fcm` a la tabla `profiles` en Supabase automáticamente.
- Cuando el edge function o Supabase envía un aviso, el celular lo recibirá y vibrará/sonará a nivel de Sistema Operativo.
