# Flujo Completo del Viaje - Rapi Fletes

## Estados del Viaje

### 1. `pending` - Esperando Chofer
- Cliente crea el viaje
- Aparece en marketplace para choferes

### 2. `accepted` - Chofer Aceptó
- Chofer acepta el viaje
- **BOTONES:**
  - 🗺️ ABRIR NAVEGACIÓN (horizontal, verde)
  - 📍 ARRIBÉ AL ORIGEN (horizontal, amarillo)
  - 📞 LLAMAR CLIENTE (horizontal, gris)

### 3. `arrived_pickup` - Llegó al Origen
- Chofer marca llegada
- **INICIA CRONÓMETRO** (cuenta tiempo de espera/carga)
- Cliente debe confirmar si viaja con la carga o solo es paquetería
- **BOTONES:**
  - ⏱️ CRONÓMETRO (muestra tiempo transcurrido)
  - ✅ INICIAR VIAJE (con confirmación)
  - 📞 LLAMAR CLIENTE

### 4. `in_transit` - En Camino
- Viaje iniciado, cronómetro sigue corriendo
- **BOTONES:**
  - 🗺️ ABRIR NAVEGACIÓN
  - 🎯 LLEGAMOS A DESTINO
  - 📞 LLAMAR CLIENTE

### 5. `arrived_dropoff` - Llegó al Destino
- Chofer marca llegada a destino
- **BOTONES:**
  - ✅ FINALIZAR VIAJE
  - 📞 LLAMAR CLIENTE

### 6. `completed` - Viaje Completado
- Se abre modal de calificación
- **CHOFER califica:**
  - ⭐ Puntuación (1-5 estrellas)
  - 📝 Novedades/Comentarios (opcional)
- **CLIENTE califica:**
  - ⭐ Puntuación del chofer
  - 📝 Comentarios (opcional)

## Cambios en Base de Datos

### Tabla `fletes` - Nuevas columnas:
```sql
ALTER TABLE fletes 
ADD COLUMN IF NOT EXISTS trip_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trip_end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS waiting_time_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS passenger_travels BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
ADD COLUMN IF NOT EXISTS driver_notes TEXT,
ADD COLUMN IF NOT EXISTS client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
ADD COLUMN IF NOT EXISTS client_notes TEXT;
```

## Componentes a Crear/Modificar

### 1. `TripTimer.jsx` - Componente de Cronómetro
- Muestra tiempo transcurrido desde inicio
- Se actualiza cada segundo
- Formato: HH:MM:SS

### 2. `RatingModal.jsx` - Modal de Calificación
- Estrellas interactivas
- Campo de texto para comentarios
- Botón de enviar

### 3. `DriverDashboard.jsx` - Modificaciones
- Agregar estados del cronómetro
- Reorganizar botones horizontalmente
- Agregar modales de confirmación
- Integrar sistema de calificaciones

## Layout de Botones (Horizontal)

```
┌─────────────────────────────────────┐
│  🗺️ NAVEGACIÓN  │  📍 ARRIBÉ  │ 📞  │
└─────────────────────────────────────┘
```

Cada botón ocupa espacio proporcional, el de teléfono es más pequeño (icono solo).
