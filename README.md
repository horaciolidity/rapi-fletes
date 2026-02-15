# Rapi Fletes - Uber de Fletes

Una aplicación premium para la gestión de fletes y mudanzas, construida con React, Vite y Tailwind CSS v4.

## 🚀 Características

- **Diseño Premium**: Interfaz moderna con glassmorphism y animaciones fluidas.
- **Categorías de Fletes**: Diferentes tipos de vehículos según la necesidad del usuario.
- **Mapa Interactivo**: Previsualización de rutas y estados del viaje.
- **Gestión de Estado**: Uso de Zustand para un flujo de reserva y autenticación eficiente.
- **Supabase Core**: Integración lista para autenticación y base de datos en tiempo real.
- **Pagos**: Estructura lista para integrar múltiples métodos de pago.

## 🛠️ Tecnologías

- **Frontend**: React 19 + Vite
- **Estilos**: Tailwind CSS v4 + Framer Motion
- **Iconos**: Lucide React
- **Estado**: Zustand
- **Backend**: Supabase (Auth + DB)
- **Deployment**: Vercel

## ⚙️ Configuración

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Variables de Entorno**:
   Crea un archivo `.env` en la raíz con las siguientes variables:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

4. **Despliegue**:
   - Pushea el código a GitHub.
   - Conecta el repositorio en Vercel.
   - Agrega las variables de entorno en el panel de Vercel.

## 📂 Estructura de Archivos

- `src/api`: Clientes de servicios externos.
- `src/components`: UI atómica y componentes de diseño.
- `src/features`: Lógica de negocio dividida por dominios (Auth, Booking, Payments).
- `src/store`: Almacenes de estado global (Zustand).
- `src/pages`: Páginas principales de la aplicación.
- `src/hooks`: Hooks personalizados para lógica reutilizable.
# rapi-fletes
