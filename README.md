# Rapi Fletes 🚚

Plataforma profesional de fletes tipo "Uber", enfocada en logística de última milla con seguimiento en tiempo real.

## Stack Tecnológico
- **Frontend**: React, Vite, Tailwind CSS, Zustand, Mapbox.
- **Backend**: Node.js, Express, Socket.IO, Prisma.
- **Base de Datos**: PostgreSQL / SQLite (opcional para dev).
- **Pagos**: Mercado Pago.

## Instalación

### Backend
1. `cd backend`
2. `npm install`
3. Configurar `.env` (DATABASE_URL, JWT_SECRET, etc)
4. `npx prisma migrate dev`
5. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Configurar `.env` (VITE_API_URL)
4. `npm run dev`

## Roles de Usuario
- **Usuario (Cliente)**: Solicita fletes, cotiza en tiempo real, paga con MP.
- **Fletero**: Acepta pedidos, navega en el mapa, reporta estado.
- **Administrador**: Gestión de usuarios, comisiones y reportes.

## Características Principales
- 📍 Mapa interactivo con cálculo de ruta.
- 💬 Chat en tiempo real entre cliente y fletero.
- 💳 Integración con Checkout Pro de Mercado Pago.
- 🎁 Sistema de referidos por códigos únicos.
- 📱 Diseño Mobile First de alta fidelidad.
# rapi-fletes
