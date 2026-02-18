# 🚀 PLAN DE MEJORAS Y OPTIMIZACIÓN - VERSIÓN 2.0

## 📋 RESUMEN DE FUNCIONALIDADES SOLICITADAS

### 1. PANEL DEL CLIENTE
- ✅ Botón "Cancelar Viaje"
- ✅ Información del chofer asignado (vehículo + calificación promedio)
- ✅ Chatbot IA para soporte y guía de reclamos

### 2. PANEL DEL CHOFER
- ✅ Componente "Billetera" (saldo + recargar)
- ✅ Integración con Mercado Pago para recargas
- ✅ Chatbot IA para soporte

### 3. PANEL ADMIN
- ✅ Registro de actividad de la app (logs)
- ✅ Acceso a reclamos de clientes y choferes
- ✅ Datos de contacto de usuarios
- ✅ Sistema de moderación (advertir/expulsar usuarios)

---

## 🎯 PRIORIZACIÓN Y FASES

### FASE 1: FUNCIONALIDADES CRÍTICAS (Semana 1)
**Objetivo**: Mejorar experiencia del cliente y chofer

#### 1.1 Panel del Cliente - Información del Chofer
- [ ] Mostrar datos del chofer asignado
- [ ] Mostrar vehículo (marca, modelo, patente)
- [ ] Calcular y mostrar calificación promedio del chofer
- [ ] Botón "Cancelar Viaje" con confirmación

#### 1.2 Panel Admin - Básico
- [ ] Vista de todos los viajes (activos + histórico)
- [ ] Vista de usuarios (clientes + choferes)
- [ ] Datos de contacto accesibles

**Tiempo estimado**: 2-3 días

---

### FASE 2: SISTEMA DE BILLETERA (Semana 2)
**Objetivo**: Implementar sistema de pagos para choferes

#### 2.1 Base de Datos
- [ ] Tabla `wallets` (saldo por chofer)
- [ ] Tabla `transactions` (historial de movimientos)
- [ ] Tabla `recharge_requests` (solicitudes de recarga)

#### 2.2 Frontend - Componente Billetera
- [ ] Vista de saldo actual
- [ ] Historial de movimientos
- [ ] Botón "Recargar Saldo"

#### 2.3 Integración Mercado Pago
- [ ] Configurar SDK de Mercado Pago
- [ ] Crear preferencia de pago
- [ ] Webhook para confirmar pagos
- [ ] Actualizar saldo tras pago exitoso

**Tiempo estimado**: 4-5 días

---

### FASE 3: SISTEMA DE RECLAMOS Y MODERACIÓN (Semana 3)
**Objetivo**: Gestión de incidencias y moderación

#### 3.1 Base de Datos
- [ ] Tabla `complaints` (reclamos)
- [ ] Tabla `user_warnings` (advertencias)
- [ ] Tabla `user_bans` (expulsiones)
- [ ] Tabla `activity_logs` (registro de actividad)

#### 3.2 Panel Admin - Reclamos
- [ ] Vista de todos los reclamos
- [ ] Filtros (pendiente, resuelto, tipo)
- [ ] Detalle de reclamo con contexto del viaje
- [ ] Acciones: resolver, escalar, contactar usuario

#### 3.3 Panel Admin - Moderación
- [ ] Advertir usuario (con motivo)
- [ ] Expulsar usuario (temporal o permanente)
- [ ] Historial de sanciones por usuario
- [ ] Notificaciones automáticas

**Tiempo estimado**: 5-6 días

---

### FASE 4: CHATBOT IA (Semana 4)
**Objetivo**: Soporte automatizado 24/7

#### 4.1 Configuración
- [ ] Elegir proveedor IA (OpenAI, Gemini, etc.)
- [ ] Crear base de conocimiento (FAQs, políticas)
- [ ] Configurar prompts del sistema

#### 4.2 Componente Chatbot
- [ ] Widget flotante en todas las páginas
- [ ] Historial de conversación
- [ ] Opción "Hablar con humano" (crear ticket)

#### 4.3 Funcionalidades del Bot
- [ ] Responder preguntas frecuentes
- [ ] Guiar proceso de reclamo
- [ ] Explicar cómo funciona la app
- [ ] Ayudar con problemas técnicos

**Tiempo estimado**: 4-5 días

---

## 🗄️ CAMBIOS EN BASE DE DATOS

### Nuevas Tablas

```sql
-- BILLETERA
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES profiles(id) UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id),
    type VARCHAR(50), -- 'recharge', 'trip_earning', 'withdrawal', 'fee'
    amount DECIMAL(10,2),
    description TEXT,
    reference_id UUID, -- ID del viaje o recarga
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recharge_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES profiles(id),
    amount DECIMAL(10,2),
    payment_method VARCHAR(50), -- 'mercadopago'
    payment_id VARCHAR(255), -- ID de Mercado Pago
    status VARCHAR(50), -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RECLAMOS Y MODERACIÓN
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flete_id UUID REFERENCES fletes(id),
    user_id UUID REFERENCES profiles(id),
    user_type VARCHAR(20), -- 'client', 'driver'
    category VARCHAR(50), -- 'service', 'payment', 'behavior', 'other'
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'closed'
    admin_notes TEXT,
    resolved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE user_warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    admin_id UUID REFERENCES profiles(id),
    reason TEXT,
    severity VARCHAR(20), -- 'low', 'medium', 'high'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_bans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    admin_id UUID REFERENCES profiles(id),
    reason TEXT,
    ban_type VARCHAR(20), -- 'temporary', 'permanent'
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(100), -- 'trip_created', 'trip_accepted', 'complaint_filed', etc.
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VEHÍCULOS (para mostrar info del chofer)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES profiles(id),
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    license_plate VARCHAR(20),
    color VARCHAR(50),
    category_id UUID REFERENCES vehicle_categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Modificaciones a Tablas Existentes

```sql
-- Agregar campo de vehículo a profiles
ALTER TABLE profiles
ADD COLUMN vehicle_id UUID REFERENCES vehicles(id);

-- Agregar campos para calcular calificación promedio
-- (ya tenemos driver_rating en fletes, solo necesitamos calcularla)
```

---

## 📁 ESTRUCTURA DE ARCHIVOS NUEVOS

```
src/
├── components/
│   ├── wallet/
│   │   ├── WalletCard.jsx
│   │   ├── TransactionHistory.jsx
│   │   ├── RechargeModal.jsx
│   │   └── MercadoPagoButton.jsx
│   ├── chatbot/
│   │   ├── ChatbotWidget.jsx
│   │   ├── ChatMessage.jsx
│   │   └── ChatInput.jsx
│   ├── admin/
│   │   ├── ComplaintsTable.jsx
│   │   ├── ComplaintDetail.jsx
│   │   ├── UserModerationPanel.jsx
│   │   ├── ActivityLogTable.jsx
│   │   └── UserDetailModal.jsx
│   └── driver/
│       └── DriverInfoCard.jsx (para mostrar en panel cliente)
├── pages/
│   ├── DriverWallet.jsx
│   └── AdminComplaints.jsx
├── store/
│   ├── useWalletStore.js
│   ├── useChatbotStore.js
│   └── useAdminStore.js
└── api/
    ├── mercadopago.js
    └── chatbot.js
```

---

## 🔧 TECNOLOGÍAS A USAR

### Mercado Pago
```bash
npm install @mercadopago/sdk-react
```

### Chatbot IA
```bash
npm install openai
# o
npm install @google/generative-ai
```

### Componentes UI Adicionales
```bash
npm install recharts  # Para gráficos en admin
npm install react-table  # Para tablas en admin
```

---

## 📊 MÉTRICAS Y KPIs

### Panel Admin - Dashboard
- Total de viajes (hoy, semana, mes)
- Ingresos totales
- Usuarios activos
- Reclamos pendientes
- Calificación promedio de choferes
- Tasa de cancelación

---

## 🎨 DISEÑO UI/UX

### Billetera del Chofer
```
┌─────────────────────────────────────┐
│  💰 MI BILLETERA                    │
├─────────────────────────────────────┤
│                                     │
│  Saldo Disponible                   │
│  $ 1,250.00                         │
│                                     │
│  [💳 RECARGAR SALDO]                │
│                                     │
├─────────────────────────────────────┤
│  📊 Movimientos Recientes           │
│                                     │
│  ✅ Viaje #1234      +$500.00       │
│  ✅ Viaje #1233      +$350.00       │
│  💳 Recarga          +$1000.00      │
│  ⚡ Comisión         -$50.00        │
│                                     │
└─────────────────────────────────────┘
```

### Panel Admin - Reclamos
```
┌─────────────────────────────────────┐
│  🚨 RECLAMOS                        │
├─────────────────────────────────────┤
│  [Pendientes] [En Proceso] [Todos]  │
│                                     │
│  📋 #001 - Chofer no llegó          │
│     Cliente: Juan Pérez             │
│     Viaje: #1234                    │
│     [VER DETALLE]                   │
│                                     │
│  📋 #002 - Cobro incorrecto         │
│     Chofer: María García            │
│     Viaje: #1235                    │
│     [VER DETALLE]                   │
│                                     │
└─────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Cliente + Admin Básico
- [ ] Botón cancelar viaje en MyFletes.jsx
- [ ] Componente DriverInfoCard con datos del chofer
- [ ] Calcular calificación promedio del chofer
- [ ] Página AdminDashboard mejorada
- [ ] Vista de usuarios en admin
- [ ] Vista de viajes en admin

### Fase 2: Billetera
- [ ] Script SQL para tablas de billetera
- [ ] Componente WalletCard
- [ ] Componente TransactionHistory
- [ ] Integración Mercado Pago
- [ ] Webhook para confirmar pagos
- [ ] Store useWalletStore

### Fase 3: Reclamos y Moderación
- [ ] Script SQL para tablas de reclamos
- [ ] Formulario de reclamo (cliente/chofer)
- [ ] Panel de reclamos en admin
- [ ] Sistema de advertencias
- [ ] Sistema de expulsiones
- [ ] Logs de actividad

### Fase 4: Chatbot IA
- [ ] Configurar API de IA
- [ ] Componente ChatbotWidget
- [ ] Base de conocimiento
- [ ] Integración en todas las páginas
- [ ] Sistema de tickets para soporte humano

---

## 🚀 ORDEN DE IMPLEMENTACIÓN SUGERIDO

1. **Cancelar viaje + Info del chofer** (1 día)
2. **Admin básico** (1 día)
3. **Billetera - Base de datos** (1 día)
4. **Billetera - Frontend** (2 días)
5. **Mercado Pago** (2 días)
6. **Reclamos - Base de datos** (1 día)
7. **Reclamos - Frontend** (2 días)
8. **Moderación en Admin** (2 días)
9. **Chatbot IA** (3 días)

**Total estimado**: 15-20 días de desarrollo

---

## 💡 RECOMENDACIONES

1. **Empezar por lo más simple**: Cancelar viaje e info del chofer
2. **Probar cada fase antes de continuar**
3. **Mercado Pago requiere cuenta verificada**
4. **El chatbot puede usar GPT-3.5 para reducir costos**
5. **Implementar logs desde el principio para debugging**

---

¿Por dónde quieres empezar? Te sugiero:
1. Cancelar viaje + Info del chofer (rápido y visible)
2. Billetera (funcionalidad crítica)
3. Admin + Reclamos (gestión)
4. Chatbot (mejora UX)
