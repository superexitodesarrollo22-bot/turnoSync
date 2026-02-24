# FASE 4 — Checklist de Verificación: Admin & Gestión

## Objetivo
Dotar a los dueños de negocios de herramientas para monitorear y gestionar su local.

---

## ✅ Entregables

### Dashboard de Analíticas
- [x] `src/services/admin.service.ts` — Integración con Edge Function `get_admin_analytics`.
- [x] `src/screens/Admin/Dashboard.tsx` — Vista de KPIs (Citas, Ingresos, No-shows).
- [x] Selector de negocio (para dueños de múltiples locales).

### Gestión de Configuración
- [x] `src/screens/Admin/Schedules.tsx` — Visualización de horarios semanales.
- [ ] Edición de horarios (Interfaz UI).
- [ ] Gestión de servicios (CRUD).
- [ ] Gestión de staff (CRUD).

### Navegación Admin
- [x] `AdminFlowStack` para separar la navegación de gestión de la de reserva.
- [x] Tipado de rutas admin en `src/types/index.ts`.

---

## 🧪 Pasos para Verificar

### 1. Verificar Dashboard
1. Asegurarse de que el usuario logueado en la app sea el mismo que creamos como admin en `seed.sql`.
2. Ir a la pestaña "Admin".
3. Resultado: Se deben ver las tarjetas con números (ej: Ingresos: $115.00).
4. El ranking de servicios debe mostrar "Corte de Cabello" como #1 (según seed).

### 2. Verificar Horarios
1. En el Dashboard, presionar "Gestionar Horarios".
2. Resultado: Se debe ver la lista de Lunes a Domingo con los horarios del seed.

---

## ✅ Criterios de Aceptación

| Criterio | Verificación |
|---|---|
| Seguridad RLS | Un usuario NORMAL no puede ver la pestaña Admin o recibe "Acceso Denegado". |
| Datos Reales | Los KPIs coinciden con los datos agregados de la tabla `appointments`. |
| UX Premium | Uso de skeletons/loading states mientras se calculan las analíticas. |

---

## ⏭️ Siguiente: Fase 5 (Finalización)
- Mejora de UI/UX (Skeletons, Lottie animations).
- Notificaciones Push reales (Expo Push SDK).
- Preparación para producción (EAS Build).
