# 👨‍💼 FASE 4: PANEL ADMIN - DOCUMENTACIÓN COMPLETA

## ✅ RESUMEN

Sistema completo de administración y moderación:
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de reclamos (asignar, resolver, cerrar)
- ✅ Gestión de usuarios (advertir, banear, levantar ban)
- ✅ Logs de actividad
- ✅ Sistema de permisos (solo admins)

---

## 📁 ARCHIVOS CREADOS

### 1. Base de Datos

#### `database_admin_system.sql`
Schema completo con:
- **Tablas**:
  - `complaints` - Reclamos de usuarios
  - `user_warnings` - Advertencias a usuarios
  - `user_bans` - Baneos temporales/permanentes
  - `activity_logs` - Registro de acciones

- **Funciones**:
  - `is_user_banned()` - Verifica si un usuario está baneado
  - `log_activity()` - Registra una acción
  - `update_updated_at_column()` - Actualiza timestamp

- **Triggers**:
  - Actualizar `updated_at` en complaints
  - Registrar creación de reclamos
  - Registrar baneos

- **Vista**:
  - `admin_stats` - Estadísticas del dashboard

### 2. Store

#### `src/store/useAdminStore.js`
Gestión del estado admin:
- Estadísticas del dashboard
- Reclamos (fetch, update, assign, resolve, close)
- Usuarios (fetch, warn, ban, lift ban)
- Logs de actividad

### 3. Páginas

#### `src/pages/AdminDashboard.jsx`
Dashboard principal:
- Cards de estadísticas
- Usuarios (total, clientes, choferes)
- Viajes (completados, cancelados, hoy, ingresos)
- Reclamos (pendientes, en progreso, resueltos, hoy)
- Moderación (baneados, acciones)
- Acciones rápidas

#### `src/pages/AdminComplaints.jsx`
Gestión de reclamos:
- Lista de reclamos con filtros
- Estados: pending, in_progress, resolved, closed
- Prioridades: low, medium, high, urgent
- Asignar reclamo a admin
- Resolver con descripción
- Modal de detalles

---

## 🗄️ ESTRUCTURA DE DATOS

### Complaint (Reclamo)

```javascript
{
    id: "uuid",
    flete_id: "uuid",
    user_id: "uuid",
    user_type: "client" | "driver",
    category: "service" | "payment" | "behavior" | "safety" | "other",
    title: "El chofer no llegó",
    description: "Esperé 30 minutos...",
    status: "pending" | "in_progress" | "resolved" | "closed",
    priority: "low" | "medium" | "high" | "urgent",
    assigned_to: "admin_uuid",
    admin_notes: "...",
    resolution: "Se contactó al chofer...",
    created_at: "2024-01-01T10:00:00Z",
    resolved_at: "2024-01-01T12:00:00Z"
}
```

### User Warning (Advertencia)

```javascript
{
    id: "uuid",
    user_id: "uuid",
    admin_id: "uuid",
    reason: "Comportamiento inapropiado",
    severity: "low" | "medium" | "high",
    complaint_id: "uuid",
    created_at: "2024-01-01T10:00:00Z"
}
```

### User Ban (Baneo)

```javascript
{
    id: "uuid",
    user_id: "uuid",
    admin_id: "uuid",
    reason: "Múltiples infracciones",
    ban_type: "temporary" | "permanent",
    expires_at: "2024-02-01T10:00:00Z", // null si es permanent
    is_active: true,
    created_at: "2024-01-01T10:00:00Z",
    lifted_at: null,
    lifted_by: null
}
```

### Activity Log

```javascript
{
    id: "uuid",
    user_id: "uuid",
    action: "complaint_created" | "user_banned" | "trip_created" | ...,
    entity_type: "complaint" | "user" | "flete",
    entity_id: "uuid",
    details: { ... },
    created_at: "2024-01-01T10:00:00Z"
}
```

---

## 🔄 FLUJOS DE TRABAJO

### Flujo 1: Gestión de Reclamo

```
1. Usuario reporta problema
   ↓
2. Se crea complaint con status "pending"
   ↓
3. Admin ve en dashboard (Pendientes: +1)
   ↓
4. Admin entra a /admin/complaints
   ↓
5. Admin presiona "ASIGNARME"
   ↓
6. Status cambia a "in_progress"
   ↓
7. Admin investiga y escribe resolución
   ↓
8. Admin presiona "MARCAR RESUELTO"
   ↓
9. Status cambia a "resolved"
   ↓
10. Se registra en activity_logs
```

### Flujo 2: Advertir Usuario

```
1. Admin detecta comportamiento inadecuado
   ↓
2. Admin va a /admin/users
   ↓
3. Admin busca al usuario
   ↓
4. Admin presiona "ADVERTIR"
   ↓
5. Escribe razón y selecciona severidad
   ↓
6. Se crea user_warning
   ↓
7. Usuario ve advertencia en su perfil
   ↓
8. Se registra en activity_logs
```

### Flujo 3: Banear Usuario

```
1. Usuario acumula múltiples advertencias
   ↓
2. Admin decide banear
   ↓
3. Admin presiona "BANEAR"
   ↓
4. Selecciona tipo (temporal/permanente)
   ↓
5. Si temporal, selecciona duración
   ↓
6. Escribe razón
   ↓
7. Se crea user_ban con is_active=true
   ↓
8. Usuario no puede usar la app
   ↓
9. Se registra en activity_logs
```

---

## 🎨 DISEÑO DEL PANEL ADMIN

### Dashboard

```
┌─────────────────────────────────────────┐
│  🛡️ PANEL ADMIN                         │
│  Centro de control y moderación         │
├─────────────────────────────────────────┤
│                                         │
│  👥 USUARIOS                            │
│  ┌─────┐ ┌─────┐ ┌─────┐               │
│  │1,234│ │ 890 │ │ 344 │               │
│  │Total│ │Clie.│ │Chof.│               │
│  └─────┘ └─────┘ └─────┘               │
│                                         │
│  🚛 VIAJES                              │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │2,567│ │ 123 │ │  45 │ │$125K│       │
│  │Compl│ │Canc.│ │ Hoy │ │Ingr.│       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│                                         │
│  🚨 RECLAMOS                            │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │  12 │ │  8  │ │ 156 │ │  3  │       │
│  │Pend.│ │Prog.│ │Resol│ │ Hoy │       │
│  └─────┘ └─────┘ └─────┘ └─────┘       │
│                                         │
│  ⚡ ACCIONES RÁPIDAS                    │
│  [VER TODOS LOS RECLAMOS]              │
│  [GESTIONAR USUARIOS]                  │
│                                         │
└─────────────────────────────────────────┘
```

### Página de Reclamos

```
┌─────────────────────────────────────────┐
│  🚨 RECLAMOS                            │
│  Gestión de problemas reportados        │
├─────────────────────────────────────────┤
│  [Todos(23)] [Pendientes(12)]          │
│  [En Progreso(8)] [Resueltos(156)]     │
├─────────────────────────────────────────┤
│                                         │
│  🚛 El chofer no llegó      [URGENT]   │
│     Esperé 30 minutos en el punto...   │
│     👤 Juan Pérez (client)             │
│     📅 Hace 2 horas                    │
│     [PENDING] [ASIGNARME] [VER]        │
│                                         │
│  💰 No me pagó el viaje     [HIGH]     │
│     El cliente se fue sin pagar...     │
│     👤 Carlos López (driver)           │
│     📅 Hace 5 horas                    │
│     [IN_PROGRESS] [VER]                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔐 PERMISOS Y SEGURIDAD

### Row Level Security (RLS)

Agregar en Supabase:

```sql
-- Solo admins pueden ver complaints
CREATE POLICY "Admins can view all complaints"
ON complaints FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Solo admins pueden actualizar complaints
CREATE POLICY "Admins can update complaints"
ON complaints FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Similar para user_warnings, user_bans, activity_logs
```

### Protección de Rutas en Frontend

```jsx
// En App.jsx
import { Navigate } from 'react-router-dom'

const AdminRoute = ({ children }) => {
    const { profile } = useAuthStore()
    
    if (profile?.role !== 'admin') {
        return <Navigate to="/" replace />
    }
    
    return children
}

// Uso:
<Route path="/admin/*" element={
    <AdminRoute>
        <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="users" element={<AdminUsers />} />
        </Routes>
    </AdminRoute>
} />
```

---

## 📊 ESTADÍSTICAS DEL DASHBOARD

### Cálculos en Tiempo Real

La vista `admin_stats` calcula:

1. **Usuarios**:
   - Total de usuarios
   - Total de clientes
   - Total de choferes

2. **Viajes**:
   - Completados (status='completed')
   - Cancelados (status='cancelled')
   - Hoy (created_at >= NOW() - 24 hours)
   - Ingresos totales (SUM de estimated_price)

3. **Reclamos**:
   - Pendientes (status='pending')
   - En progreso (status='in_progress')
   - Resueltos (status='resolved')
   - Hoy (created_at >= NOW() - 24 hours)

4. **Moderación**:
   - Baneos activos (is_active=true)

---

## 🧪 TESTING

### Test 1: Ver Dashboard

```
1. Login como admin
2. Ir a /admin/dashboard
3. Verificar que se muestran todas las estadísticas
4. Verificar que los números son correctos
```

### Test 2: Gestionar Reclamo

```
1. Crear reclamo como cliente
2. Login como admin
3. Ir a /admin/complaints
4. Ver reclamo en lista
5. Presionar "ASIGNARME"
6. Verificar que status cambió a "in_progress"
7. Presionar "VER"
8. Escribir resolución
9. Presionar "MARCAR RESUELTO"
10. Verificar que status cambió a "resolved"
```

### Test 3: Advertir Usuario

```
1. Login como admin
2. Ir a /admin/users
3. Buscar usuario
4. Presionar "ADVERTIR"
5. Escribir razón
6. Seleccionar severidad
7. Confirmar
8. Verificar que se creó la advertencia
9. Verificar que aparece en el perfil del usuario
```

### Test 4: Banear Usuario

```
1. Login como admin
2. Ir a /admin/users
3. Buscar usuario
4. Presionar "BANEAR"
5. Seleccionar tipo (temporal)
6. Seleccionar duración (7 días)
7. Escribir razón
8. Confirmar
9. Verificar que is_active=true
10. Logout
11. Intentar login como usuario baneado
12. Verificar que no puede acceder
```

---

## 🚀 PRÓXIMOS PASOS

### 1. Ejecutar Script SQL

```bash
# Copiar database_admin_system.sql
# Pegar en Supabase SQL Editor
# Ejecutar
```

### 2. Configurar RLS en Supabase

```sql
# Habilitar RLS en las tablas
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

# Crear policies (ver sección de Permisos)
```

### 3. Agregar Rutas en App.jsx

```jsx
import AdminDashboard from './pages/AdminDashboard'
import AdminComplaints from './pages/AdminComplaints'

// ...

<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/admin/complaints" element={<AdminComplaints />} />
```

### 4. Crear Usuario Admin

```sql
-- En Supabase SQL Editor
UPDATE profiles
SET role = 'admin'
WHERE id = 'tu_user_id_aqui';
```

### 5. Probar en Desarrollo

```bash
npm run dev
# Ir a http://localhost:5173/admin/dashboard
```

---

## 📝 COMPONENTES FALTANTES (OPCIONALES)

### AdminUsers.jsx
Página para gestionar usuarios:
- Lista de todos los usuarios
- Filtros (rol, baneados, etc.)
- Ver detalles del usuario
- Advertir usuario
- Banear/desbanear usuario
- Ver historial de advertencias y baneos

### AdminActivityLogs.jsx
Página para ver logs de actividad:
- Lista de todas las acciones
- Filtros (usuario, acción, fecha)
- Detalles de cada acción
- Exportar logs

---

## ⚠️ IMPORTANTE

### Categorías de Reclamos

- `service` - Problemas con el servicio
- `payment` - Problemas de pago
- `behavior` - Comportamiento inadecuado
- `safety` - Problemas de seguridad
- `other` - Otros

### Prioridades

- `urgent` - Requiere atención inmediata
- `high` - Alta prioridad
- `medium` - Prioridad media
- `low` - Baja prioridad

### Estados de Reclamo

- `pending` - Pendiente de asignación
- `in_progress` - Asignado a un admin
- `resolved` - Resuelto con solución
- `closed` - Cerrado (sin más acciones)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Script SQL creado
- [x] Store useAdminStore creado
- [x] AdminDashboard creado
- [x] AdminComplaints creado
- [x] Documentación completa
- [ ] Ejecutar script SQL en Supabase
- [ ] Configurar RLS
- [ ] Agregar rutas en App.jsx
- [ ] Crear usuario admin
- [ ] Testing completo
- [ ] Deploy a producción

---

¡Panel Admin completado! 🎉

**Estado del proyecto**:
- ✅ Fase 1: Info Chofer + Cancelar
- ⏸️ Fase 2: Billetera (base creada)
- ✅ Fase 3: Chatbot IA
- ✅ Fase 4: Panel Admin

**Siguiente**: Integrar todo y hacer testing completo 🚀
