# FLUJO COMPLETO DEL VIAJE - PANEL DEL CHOFER

## Estados del Viaje

El viaje pasa por los siguientes estados en orden:

1. **`pending`** - Cliente creó el pedido (visible en marketplace)
2. **`accepted`** - Chofer aceptó el viaje
3. **`arrived_pickup`** - Chofer arribó al origen (tiempo de espera para carga)
4. **`in_transit`** - Viaje en curso hacia destino (cronómetro activo)
5. **`arrived_dropoff`** - Chofer arribó al destino (tiempo de espera para descarga)
6. **`completed`** - Viaje finalizado (se activa modal de calificación)
7. **`cancelled`** - Viaje cancelado (estado terminal)

---

## Flujo Detallado con Acciones del Chofer

### 1️⃣ ESTADO: `accepted`
**Descripción**: El chofer aceptó el viaje y debe dirigirse al origen.

**Botones visibles**:
- 🗺️ **NAVEGAR AL ORIGEN** (botón superior, abre Google Maps)
- 📍 **ARRIBÉ AL ORIGEN** (botón principal de acción)
- 📞 **LLAMAR CLIENTE** (botón secundario)

**Acción**: Al presionar "ARRIBÉ AL ORIGEN"
- Se muestra modal: "¿El cliente viaja?"
  - Opción 1: 👤 SÍ, VIAJA → `passenger_travels = true`
  - Opción 2: 📦 SOLO CARGA → `passenger_travels = false`
- Cambia estado a `arrived_pickup`

---

### 2️⃣ ESTADO: `arrived_pickup`
**Descripción**: El chofer está en el origen esperando que se cargue el vehículo.

**Botones visibles**:
- 🗺️ **NAVEGAR AL DESTINO** (botón superior, abre Google Maps)
- 🚀 **INICIAR VIAJE** (botón principal de acción, verde)
- 📞 **LLAMAR CLIENTE** (botón secundario)

**Acción**: Al presionar "INICIAR VIAJE"
- Se establece `trip_start_time = NOW()`
- Cambia estado a `in_transit`
- **Inicia el cronómetro del viaje**

---

### 3️⃣ ESTADO: `in_transit`
**Descripción**: El viaje está en curso hacia el destino. El cronómetro está corriendo.

**Elementos visibles**:
- ⏱️ **CRONÓMETRO** (muestra tiempo transcurrido desde `trip_start_time`)
- 🗺️ **NAVEGAR AL DESTINO** (botón superior, abre Google Maps)

**Botones visibles**:
- 🎯 **LLEGAMOS A DESTINO** (botón principal de acción)
- 📞 **LLAMAR CLIENTE** (botón secundario)

**Acción**: Al presionar "LLEGAMOS A DESTINO"
- Cambia estado a `arrived_dropoff`
- El cronómetro se detiene (pero sigue mostrando tiempo total)

---

### 4️⃣ ESTADO: `arrived_dropoff`
**Descripción**: El chofer arribó al destino y está esperando que se descargue el vehículo.

**Botones visibles**:
- ✅ **FINALIZAR VIAJE** (botón principal de acción, verde)
- 📞 **LLAMAR CLIENTE** (botón secundario)

**Acción**: Al presionar "FINALIZAR VIAJE"
- Se establece `trip_end_time = NOW()`
- Cambia estado a `completed`
- Se muestra **modal de calificación** para que el chofer califique al cliente

---

### 5️⃣ ESTADO: `completed`
**Descripción**: El viaje finalizó exitosamente.

**Acciones automáticas**:
- Se muestra modal de calificación
- El chofer califica al cliente (1-5 estrellas + comentarios opcionales)
- Los datos se guardan en:
  - `driver_rating` (calificación del chofer al cliente)
  - `driver_notes` (comentarios del chofer)
- El viaje pasa al historial
- El chofer vuelve al marketplace para aceptar nuevos viajes

---

## Campos de Base de Datos

### Timestamps
- `created_at` - Cuando el cliente creó el pedido
- `updated_at` - Última actualización del registro
- `trip_start_time` - Cuando el chofer presionó "INICIAR VIAJE" (estado `in_transit`)
- `trip_end_time` - Cuando el chofer presionó "FINALIZAR VIAJE" (estado `completed`)

### Estado del Pasajero
- `passenger_travels` (boolean) - Si el cliente viaja con la carga

### Calificaciones
- `driver_rating` (1-5) - Calificación del chofer al cliente
- `driver_notes` (text) - Comentarios del chofer
- `client_rating` (1-5) - Calificación del cliente al chofer
- `client_notes` (text) - Comentarios del cliente

---

## Componentes Clave

### `DriverDashboard.jsx`
- Maneja la UI y el flujo de estados
- Muestra botones según el estado actual
- Controla los modales (confirmación de pasajero, calificación)

### `useDriverStore.js`
- `updateFleteStatus()` - Actualiza el estado y timestamps automáticamente
- `updatePassengerStatus()` - Guarda si el cliente viaja o no
- `submitDriverRating()` - Guarda la calificación del chofer

### `TripTimer.jsx`
- Muestra cronómetro en tiempo real
- Solo visible cuando `status === 'in_transit'`

### `RatingModal.jsx`
- Modal para calificar al cliente
- Se muestra cuando `status === 'completed'`

---

## Errores Comunes y Soluciones

### ❌ Error: "WebSocket connection failed"
**Causa**: Problemas de conexión con Supabase Realtime
**Solución**: No afecta la funcionalidad principal, solo las actualizaciones en tiempo real

### ❌ Error: "PATCH 400 Bad Request"
**Causa**: Intentar actualizar a un estado que no existe en el constraint de la BD
**Solución**: Ejecutar el script SQL actualizado (`database_updates_trip_flow.sql`)

### ❌ Error: "GET router.project-osrm.org timeout"
**Causa**: Servicio de rutas OSRM no disponible
**Solución**: Usar Google Maps como alternativa (botón de navegación)

---

## Checklist de Implementación

- [x] Actualizar estados en `useDriverStore.js`
- [x] Agregar estado `in_transit` y `arrived_dropoff`
- [x] Mover `trip_start_time` a estado `in_transit`
- [x] Actualizar cronómetro para mostrar en `in_transit`
- [x] Actualizar botones en `DriverDashboard.jsx`
- [ ] Ejecutar script SQL en Supabase
- [ ] Probar flujo completo en la app
- [ ] Verificar que las calificaciones se guarden correctamente

---

## Próximos Pasos

1. **Ejecutar el script SQL** en Supabase SQL Editor
2. **Probar el flujo completo** desde aceptar viaje hasta finalizar
3. **Verificar que el cronómetro funcione** correctamente
4. **Implementar panel del cliente** con estados sincronizados
5. **Agregar notificaciones push** para cambios de estado
