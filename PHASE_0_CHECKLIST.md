# FASE 0 — Checklist de Verificación

## Objetivo
Base técnica 100% lista y compilable.

---

## ✅ Entregables

### 1. Estructura de carpetas completa
- [x] `/src/config/` — Supabase client + constantes
- [x] `/src/types/` — TypeScript types para DB y navegación
- [x] `/src/hooks/` — AuthProvider + useAuth hook
- [x] `/src/components/` — Button, LoadingScreen
- [x] `/src/screens/Auth/` — LoginScreen
- [x] `/src/screens/Home/` — HomeScreen
- [x] `/src/screens/BookingFlow/` — SelectService, SelectStaff, SelectDateTime, Confirm
- [x] `/src/screens/Admin/` — Dashboard, Calendar, Services, Staff, Schedules
- [x] `/src/screens/` — MyBookings, BusinessList, BusinessProfile
- [x] `/src/navigation/` — AppNavigator (Stack + Tabs)
- [x] `/src/services/` — Supabase client wrapper
- [x] `/src/utils/` — Formatters, i18n

### 2. Infraestructura Backend (referencia)
- [x] `/supabase/migrations/00001_initial_schema.sql` — Schema completo
- [x] `/supabase/policies/00001_rls_policies.sql` — RLS policies
- [x] `/supabase/seed.sql` — Datos demo
- [x] `/supabase/config.toml` — Config placeholder

### 3. Configuración de Builds
- [x] `app.json` — Scheme, plugins, bundleIdentifier, package
- [x] `eas.json` — Profiles: development, preview, production
- [x] `.env.example` — Template de variables de entorno

### 4. CI/CD
- [x] `.github/workflows/ci.yml` — PR lint + test
- [x] `.github/workflows/deploy-supabase.yml` — Deploy migrations
- [x] `.github/workflows/build-production.yml` — EAS build

### 5. Documentación
- [x] `README.md` — Setup completo paso a paso

---

## 🧪 Pasos para Verificar

### Compilación
```bash
cd TurnoSync
npm install
npx expo start
```
**Resultado esperado:** App inicia sin errores. Se ve pantalla de Login con botón "Continuar con Google".

### TypeScript
```bash
npx tsc --noEmit
```
**Resultado esperado:** Sin errores de tipos.

### Navegación
1. Al abrir la app → se muestra LoginScreen (no hay sesión activa)
2. Los tabs de navegación están configurados (Home, Reservas, Admin)
3. Todas las pantallas placeholder renderizan sin crashes

---

## 📏 Estimación de Tiempos por Fase

| Fase | Días Estimados | Descripción |
|---|---|---|
| 0 — Kickoff & Setup | 3 | ✅ Completado |
| 1 — Infra & Auth | 5 | Google OAuth + DB + RLS |
| 2 — Core Booking RPCs | 7 | Edge Functions + tests |
| 3 — Mobile Booking Flow | 10 | UI completa de reservas |
| 4 — Panel Admin | 10 | CRUD + Realtime + KPIs |
| 5 — QA & Builds | 7 | Tests + seguridad + stores |
| 6 — Launch Support | 30 | OTA + monitoring |
| **Total** | **~72 días** | |

---

## 💰 Costo de Infraestructura (Fase 0-1)

| Servicio | Tier | Costo |
|---|---|---|
| Supabase Dev | Free | $0/mes |
| Expo EAS | Free (30 builds) | $0/mes |
| **Total Fase 0-1** | | **$0/mes** |

---

## ⏭️ Siguiente: Fase 1
- Aplicar migraciones SQL en Supabase
- Configurar Google OAuth
- Implementar login funcional end-to-end
- Seed data + test vectors RLS
