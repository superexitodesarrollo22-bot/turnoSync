# FASE 1 — Checklist de Verificación: Infra & Auth

## Objetivo
Auth con Google funcional end-to-end, DB schema aplicado.

---

## ✅ Entregables

### Base de Datos
- [x] `/supabase/migrations/00001_initial_schema.sql` — Schema completo con todas las tablas
- [x] `/supabase/migrations/00002_helpers_and_indexes.sql` — Funciones helper + índices compuestos
- [x] `/supabase/policies/00001_rls_policies.sql` — RLS en todas las tablas sensibles
- [x] `/supabase/seed.sql` — 2 barberías demo, 2 usuarios, servicios, staff, horarios
- [x] `/supabase/tests/rls_vectors.sql` — Test vectors documentados

### Auth
- [x] `src/services/auth.service.ts` — Google OAuth via expo-auth-session + Supabase
- [x] `src/hooks/useAuth.tsx` — AuthProvider con upsert post-login + push token
- [x] `src/screens/Auth/LoginScreen.tsx` — UI conectada al hook real

### Servicios
- [x] `src/services/businesses.service.ts` — CRUD de negocios
- [x] `src/services/appointments.service.ts` — Citas + wrappers RPC

---

## 🧪 Pasos para Verificar

### 1. Aplicar migraciones en Supabase
```bash
# Opción A: Supabase CLI
npx supabase link --project-ref YOUR_PROJECT_ID
npx supabase db push

# Opción B: SQL Editor en Supabase Dashboard
# Ejecutar en orden:
# 1. supabase/migrations/00001_initial_schema.sql
# 2. supabase/migrations/00002_helpers_and_indexes.sql
# 3. supabase/policies/00001_rls_policies.sql
# 4. supabase/seed.sql
```

### 2. Configurar Google OAuth en Supabase
1. Dashboard → Authentication → Providers → Google → Enable
2. Agregar `Web Client ID` y `Web Client Secret` de Google Cloud Console
3. Redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### 3. Configurar .env
```bash
cp .env.example .env
# Editar con tus valores reales:
# EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
```

### 4. Verificar login end-to-end
```bash
npx expo start
# Abrir en Expo Go → presionar "Continuar con Google"
# Resultado esperado: redirige a Google, vuelve a la app, muestra tabs de Home
```

### 5. Verificar upsert en tabla users
```sql
-- En Supabase SQL Editor:
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
-- Debe aparecer el usuario que acaba de iniciar sesión
```

### 6. Verificar RLS
```sql
-- Ejecutar supabase/tests/rls_vectors.sql
-- Verificar que todas las tablas tienen RLS habilitado:
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

### 7. TypeScript
```bash
npx tsc --noEmit
# Resultado esperado: 0 errores
```

---

## ✅ Criterios de Aceptación

| Criterio | Verificación |
|---|---|
| Usuario inicia sesión con Google | Aparece en tabla `users` |
| RLS bloquea acceso cruzado | Test vectors pasan |
| Build preview compila | `npx expo start` sin errores |
| Push token se registra | Aparece en `user_devices` |

---

## ⏭️ Siguiente: Fase 2
- Edge Functions desplegadas en Supabase
- Tests unitarios corriendo con Jest
- Colección Postman verificada
