# 💰 FASE 2: BILLETERA DEL CHOFER - GUÍA DE IMPLEMENTACIÓN

## 📋 RESUMEN

Sistema completo de billetera para choferes con:
- ✅ Gestión de saldo
- ✅ Historial de transacciones
- ✅ Recargas vía Mercado Pago
- ✅ Sistema de comisiones
- ✅ Retiros (futuro)

---

## 🗄️ BASE DE DATOS

### Paso 1: Ejecutar Script SQL

**Archivo**: `database_wallet_system.sql`

**Tablas creadas**:
1. `wallets` - Billetera de cada chofer
2. `transactions` - Historial de movimientos
3. `recharge_requests` - Solicitudes de recarga (Mercado Pago)
4. `withdrawals` - Solicitudes de retiro

**Funciones creadas**:
- `create_wallet_for_driver()` - Crea billetera automáticamente
- `update_wallet_balance()` - Actualiza saldo de forma segura
- `process_approved_recharge()` - Procesa recarga aprobada

**⚠️ IMPORTANTE**: Ejecutar este script en Supabase SQL Editor ANTES de continuar.

---

## 📦 DEPENDENCIAS

### Instalar Mercado Pago SDK

```bash
npm install @mercadopago/sdk-react
npm install mercadopago
```

### Variables de Entorno

Agregar en `.env`:

```env
VITE_MERCADOPAGO_PUBLIC_KEY=tu_public_key_aqui
```

Agregar en Vercel (Settings → Environment Variables):

```env
VITE_MERCADOPAGO_PUBLIC_KEY=tu_public_key_aqui
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_aqui
```

**¿Cómo obtener las keys?**
1. Ir a https://www.mercadopago.com.ar/developers
2. Crear una aplicación
3. Copiar Public Key y Access Token
4. Usar las de TEST primero, luego las de PRODUCCIÓN

---

## 📁 ARCHIVOS CREADOS

### 1. Backend / Store

#### `src/store/useWalletStore.js`
Store de Zustand para gestionar:
- Billetera del chofer
- Transacciones
- Solicitudes de recarga
- Actualización de saldo

**Funciones principales**:
```javascript
fetchWallet(driverId)           // Obtener billetera
fetchTransactions(walletId)     // Obtener movimientos
createRechargeRequest(...)      // Crear solicitud de recarga
processApprovedRecharge(...)    // Procesar pago aprobado
addTripEarning(...)             // Agregar ganancia de viaje
deductCommission(...)           // Descontar comisión
```

### 2. Frontend / Páginas

#### `src/pages/DriverWallet.jsx`
Página principal de la billetera:
- Card de saldo con diseño premium
- Estadísticas (ingresos/egresos)
- Lista de transacciones
- Botón de recarga

### 3. Componentes (A CREAR)

Necesitamos crear estos componentes:

#### `src/components/wallet/RechargeModal.jsx`
Modal para seleccionar monto y pagar con Mercado Pago

#### `src/components/wallet/MercadoPagoButton.jsx`
Botón de pago de Mercado Pago

---

## 🎨 DISEÑO DE LA BILLETERA

### Vista Principal

```
┌─────────────────────────────────────────┐
│  💰 MI BILLETERA                        │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  💰 Saldo Disponible              │ │
│  │  $ 1,250.00                       │ │
│  │                                   │ │
│  │  [➕ RECARGAR SALDO]              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │ 📈 Ingresos │  │ 📉 Egresos      │  │
│  │ $ 2,500.00  │  │ $ 1,250.00      │  │
│  └─────────────┘  └─────────────────┘  │
│                                         │
│  📊 MOVIMIENTOS RECIENTES               │
│                                         │
│  ✅ Viaje #1234        +$ 500.00       │
│  ✅ Viaje #1233        +$ 350.00       │
│  💳 Recarga           +$ 1,000.00      │
│  ⚡ Comisión           -$ 50.00        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE RECARGA CON MERCADO PAGO

### Paso a Paso:

1. **Usuario presiona "RECARGAR SALDO"**
   - Se abre modal con opciones de monto

2. **Usuario selecciona monto** (ej: $1000, $2000, $5000)
   - Se crea `recharge_request` en Supabase
   - Estado: `pending`

3. **Se genera preferencia de Mercado Pago**
   - Usando el SDK de MP
   - Se obtiene `preference_id`

4. **Usuario es redirigido a Mercado Pago**
   - Completa el pago

5. **Mercado Pago notifica via Webhook**
   - POST a `/api/mercadopago/webhook`
   - Se valida el pago

6. **Se procesa la recarga**
   - Se llama a `process_approved_recharge()`
   - Se actualiza saldo
   - Se crea transacción
   - Estado: `approved`

7. **Usuario ve saldo actualizado**
   - Refresh automático de la billetera

---

## 🔐 SEGURIDAD

### Validaciones Implementadas:

1. **Balance nunca negativo**
   ```sql
   CHECK (balance >= 0)
   ```

2. **Transacciones atómicas**
   - Uso de `FOR UPDATE` para evitar race conditions
   - Todo en una transacción SQL

3. **Validación de webhooks**
   - Verificar firma de Mercado Pago
   - Validar que el pago sea legítimo

4. **Permisos en Supabase**
   - Solo el chofer puede ver su billetera
   - Solo admin puede procesar retiros

---

## 📊 TIPOS DE TRANSACCIONES

| Tipo | Descripción | Monto | Ejemplo |
|------|-------------|-------|---------|
| `recharge` | Recarga de saldo | + | +$1000.00 |
| `trip_earning` | Ganancia de viaje | + | +$500.00 |
| `commission` | Comisión de plataforma | - | -$50.00 |
| `withdrawal` | Retiro de fondos | - | -$2000.00 |
| `refund` | Reembolso | + | +$100.00 |

---

## 💡 LÓGICA DE COMISIONES

### Ejemplo de flujo completo:

1. **Cliente paga $500 por un viaje**
2. **Chofer completa el viaje**
3. **Sistema procesa**:
   ```javascript
   // Agregar ganancia completa
   addTripEarning(walletId, 500, fleteId)
   // Balance: +$500
   
   // Descontar comisión (10%)
   deductCommission(walletId, 50, fleteId)
   // Balance: -$50
   
   // Resultado final: +$450
   ```

---

## 🚀 PRÓXIMOS PASOS

### 1. Ejecutar Script SQL ✅
```bash
# Copiar database_wallet_system.sql
# Pegar en Supabase SQL Editor
# Ejecutar
```

### 2. Instalar Dependencias
```bash
npm install @mercadopago/sdk-react mercadopago
```

### 3. Configurar Mercado Pago
- Crear cuenta de desarrollador
- Obtener credenciales
- Agregar a .env

### 4. Crear Componentes Faltantes
- RechargeModal.jsx
- MercadoPagoButton.jsx

### 5. Agregar Ruta en App.jsx
```jsx
<Route path="/driver/wallet" element={<DriverWallet />} />
```

### 6. Agregar Link en Navbar
```jsx
<Link to="/driver/wallet">💰 Billetera</Link>
```

---

## 🧪 TESTING

### Casos de Prueba:

**Test 1: Ver billetera**
- ✅ Ir a /driver/wallet
- ✅ Ver saldo en $0.00
- ✅ Ver mensaje "No hay movimientos aún"

**Test 2: Crear recarga (TEST)**
- ✅ Click en "RECARGAR SALDO"
- ✅ Seleccionar monto
- ✅ Pagar con tarjeta de prueba de MP
- ✅ Ver saldo actualizado

**Test 3: Ganancia de viaje**
- ✅ Completar un viaje
- ✅ Ver transacción "Ganancia de Viaje"
- ✅ Ver saldo aumentado

**Test 4: Comisión**
- ✅ Completar un viaje
- ✅ Ver transacción "Comisión"
- ✅ Ver saldo descontado

---

## 📱 TARJETAS DE PRUEBA (MERCADO PAGO)

Para testing en modo sandbox:

```
VISA: 4509 9535 6623 3704
CVV: 123
Vencimiento: 11/25
Nombre: APRO (aprobado) o OTHE (rechazado)
DNI: 12345678
```

---

## ⚠️ IMPORTANTE

1. **Usar modo TEST primero**
   - No usar credenciales de producción hasta estar seguro

2. **Webhook debe ser HTTPS**
   - Mercado Pago solo acepta HTTPS
   - Usar ngrok para desarrollo local

3. **Validar SIEMPRE los webhooks**
   - Verificar firma
   - Verificar monto
   - Evitar fraudes

---

## 🎯 ESTADO ACTUAL

- [x] Script SQL creado
- [x] Store creado (useWalletStore)
- [x] Página de billetera creada
- [ ] Modal de recarga (siguiente)
- [ ] Integración con Mercado Pago (siguiente)
- [ ] Webhook para notificaciones (siguiente)
- [ ] Testing completo

---

¿Continuamos con el modal de recarga y la integración de Mercado Pago? 🚀
