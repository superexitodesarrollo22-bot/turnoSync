# FASE 2 — Checklist de Verificación: Core Booking RPCs

## Objetivo
Lógica de reservas server-side probada y segura.

---

## ✅ Entregables

### Edge Functions
- [x] `supabase/functions/create_appointment/index.ts`
  - JWT validation
  - Blackout date check → `BLACKOUT`
  - Schedule validation → `OUT_OF_HOURS`
  - Overlap detection → `CONFLICT`
  - Transactional insert + audit_log + push notification
- [x] `supabase/functions/update_appointment_status/index.ts`
  - Role-based authorization (client vs admin)
  - State machine guards (no update on completed)
  - Audit log + push notification to client
- [x] `supabase/functions/get_admin_analytics/index.ts`
  - KPIs: citas hoy, ingresos, no-shows, clientes nuevos, top servicios
- [x] `supabase/functions/search_businesses/index.ts`
  - Búsqueda por nombre (geo-ready)

### Tests
- [x] `supabase/functions/__tests__/edge-functions.test.ts`
  - Blackout check
  - Schedule validation
  - Overlap detection
  - end_at calculation
  - Status transition guards
  - Analytics aggregations

### Documentación
- [x] `docs/TurnoSync.postman_collection.json`

---

## 🧪 Pasos para Verificar

### 1. Desplegar Edge Functions
```bash
npx supabase functions deploy create_appointment
npx supabase functions deploy update_appointment_status
npx supabase functions deploy get_admin_analytics
npx supabase functions deploy search_businesses
```

### 2. Configurar secrets en Supabase
```bash
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Correr tests unitarios
```bash
npm test
# Resultado esperado: todos los tests pasan
```

### 4. Verificar con Postman
1. Importar `docs/TurnoSync.postman_collection.json`
2. Configurar variables: `SUPABASE_URL`, `ANON_KEY`, `JWT_TOKEN`
3. Ejecutar cada request y verificar respuestas

### 5. Test E2E: cita válida
```bash
# POST /functions/v1/create_appointment
# Body: { business_id, service_id, requested_start_at: "2026-03-09T14:00:00Z" }
# Esperado: 201 Created con appointment record
```

### 6. Test E2E: CONFLICT
```bash
# Repetir el mismo request anterior
# Esperado: 409 { error: { code: "CONFLICT" } }
```

### 7. Test E2E: BLACKOUT
```bash
# requested_start_at: "2026-03-01T14:00:00Z" (fecha bloqueada en seed)
# Esperado: 409 { error: { code: "BLACKOUT" } }
```

### 8. Test E2E: OUT_OF_HOURS
```bash
# requested_start_at: "2026-03-09T23:00:00Z" (fuera de horario)
# Esperado: 409 { error: { code: "OUT_OF_HOURS" } }
```

---

## ✅ Criterios de Aceptación

| Test | Resultado Esperado |
|---|---|
| Cita válida | 201 Created |
| Cita solapada | 409 CONFLICT |
| Fecha bloqueada | 409 BLACKOUT |
| Fuera de horario | 409 OUT_OF_HOURS |
| Unit tests | Todos pasan |

---

## ⏭️ Siguiente: Fase 3
- UI de búsqueda y perfil de negocios
- Booking flow completo (4 pasos)
- Mis Reservas con cancelación
- Push notifications en dispositivo real
