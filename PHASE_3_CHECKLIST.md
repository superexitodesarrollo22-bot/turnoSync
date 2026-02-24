# FASE 3 — Checklist de Verificación: Booking Flow & My Bookings

## Objetivo
Flujo de reserva completo desde el descubrimiento hasta la confirmación y gestión.

---

## ✅ Entregables

### Descubrimiento
- [x] `src/screens/Home/HomeScreen.tsx` — Lista de negocios real con búsqueda.
- [x] `src/screens/BusinessProfileScreen.tsx` — Detalle de negocio, servicios y staff.

### Booking Flow
- [x] `src/screens/BookingFlow/SelectService.tsx` — Selección de servicio real.
- [x] `src/screens/BookingFlow/SelectStaff.tsx` — Selección de profesional (o cualquiera).
- [x] `src/screens/BookingFlow/SelectDateTime.tsx` — Calendario (14 días) y slots dinámicos.
- [x] `src/screens/BookingFlow/Confirm.tsx` — Resumen y llamada a RPC `create_appointment`.

### Gestión
- [x] `src/screens/MyBookingsScreen.tsx` — Lista de citas con estados y cancelación funcional.

### Navegación
- [x] Integración de `BookingFlow` stack en `AppNavigator`.
- [x] Tipado mejorado en `src/types/index.ts`.

---

## 🧪 Pasos para Verificar

### 1. Probar el flujo de reserva
1. Abrir la App -> Iniciar sesión.
2. Home -> Seleccionar una barbería (ej: "Barbería Demo").
3. Perfil -> Presionar "Reservar Cita".
4. Seleccionar un servicio -> Seleccionar un barbero.
5. Seleccionar un día y una hora disponible.
6. Confirmar -> "Confirmar y Agendar".
7. Resultado: Debe aparecer un mensaje de éxito y redirigir a "Mis Reservas".

### 2. Verificar en Base de Datos
```sql
SELECT * FROM appointments ORDER BY created_at DESC LIMIT 1;
-- Verificar que los campos business_id, client_user_id, service_id, staff_id y start_at coincidan.
```

### 3. Probar Cancelación
1. En "Mis Reservas", buscar la cita recién creada.
2. Presionar "Cancelar Reserva".
3. Confirmar el diálogo.
4. Resultado: El estado de la cita debe cambiar a "Cancelada" (fondo rojo).

---

## ✅ Criterios de Aceptación

| Criterio | Verificación |
|---|---|
| Negocios reales en Home | Se ven los datos del `seed.sql` |
| Slots dinámicos | Cambian según el día seleccionado (horarios de seed) |
| Cita creada en backend | El Edge Function devuelve 201 y el registro existe en DB |
| Cancelación segura | Solo el cliente o admin pueden cancelar (vía RPC) |

---

## ⏭️ Siguiente: Fase 4
- Dashboard de Admin con KPIs reales (vía `get_admin_analytics`).
- Gestión de Horarios y Servicios para dueños.
- Mejoras de UI/UX (animaciones Lottie, skeletons).
