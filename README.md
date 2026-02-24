# 🚀
## 🔧 Workflow de Build — Android Local

Este proyecto usa **Android Studio local** para generar builds de producción.
NO usar EAS Cloud Build ni `expo prebuild --clean`.

### Para cambios en JS/TS:
```bash
npx expo start --clear
```

### Para cambios en app.json o dependencias nativas:
```bash
# En Windows (PowerShell):
.\scripts\sync-android.ps1

# En Linux/macOS/Git Bash:
bash scripts/sync-android.sh
```
Luego en Android Studio: **File → Sync Project with Gradle Files**

### Para generar APK/AAB de producción:
Android Studio → **Build → Generate Signed Bundle/APK**

### ⚠️ Reglas que NO romper:
- NUNCA: `npx expo prebuild --clean`
- NUNCA: `eas build`
- NUNCA: `rm -rf android/`

---

> Micro-SaaS de reservas. Primer vertical: **barberías**. Escalable a clínicas, peluquerías, talleres y más.

---

## 📱 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend Móvil | React Native — Expo Managed Workflow (TypeScript) |
| Backend / Infra | Supabase (Auth, Postgres, Storage, Realtime, Edge Functions, RLS) |
| Builds / OTA | Expo EAS |
| Publicación | Google Play (AAB) + Apple App Store (IPA) |
| CI | GitHub Actions |

---

## 🏗️ Arquitectura

- **Una sola app móvil**: cliente + admin condicional por rol (mismo binario)
- **Multi-tenant**: una instancia de DB; `business_id` aísla datos; RLS en todas las tablas
- **Auth**: Google OAuth vía Supabase Auth
- **Timezone**: almacena en UTC, presenta según `business.timezone`

---

## 📁 Estructura del Proyecto

```
TurnoSync/
├── App.tsx                          # Entry point
├── app.json                         # Expo config
├── eas.json                         # EAS Build profiles
├── .env.example                     # Environment variables template
├── src/
│   ├── config/
│   │   ├── constants.ts             # Colors, spacing, enums
│   │   └── supabase.ts              # Supabase client singleton
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   ├── hooks/
│   │   └── useAuth.tsx              # Auth context + provider
│   ├── components/
│   │   ├── Button.tsx               # Reusable button component
│   │   └── LoadingScreen.tsx        # Full-screen loader
│   ├── screens/
│   │   ├── Auth/LoginScreen.tsx     # Google OAuth login
│   │   ├── Home/HomeScreen.tsx      # Business discovery
│   │   ├── BusinessListScreen.tsx   # Search results
│   │   ├── BusinessProfileScreen.tsx
│   │   ├── BookingFlow/             # 4-step booking wizard
│   │   ├── MyBookingsScreen.tsx     # User's appointments
│   │   └── Admin/                   # Admin panel (role-gated)
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Stack + Tab navigation
│   ├── services/                    # Supabase RPC wrappers
│   └── utils/
│       ├── formatters.ts            # Timezone, price, duration
│       └── i18n.ts                  # i18n-ready translations
├── supabase/
│   ├── migrations/                  # SQL schema migrations
│   ├── policies/                    # RLS policy scripts
│   └── seed.sql                     # Demo data
└── .github/workflows/               # CI/CD pipelines
```

---

## 🚀 Setup Local — Paso a Paso

### Prerrequisitos
- Node.js >= 18
- npm >= 9
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Cuenta de Supabase (crear proyecto en [supabase.com](https://supabase.com))
- Expo Go app en tu dispositivo (iOS/Android)

### 1. Clonar e instalar
```bash
git clone https://github.com/your-org/TurnoSync.git
cd TurnoSync
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### 3. Configurar Supabase
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar `Project URL` y `anon key` a tu `.env`
3. Ejecutar migraciones:
   ```bash
   # Opción A: Supabase CLI
   npx supabase db push

   # Opción B: Copiar SQL manualmente al SQL Editor de Supabase
   # 1. supabase/migrations/00001_initial_schema.sql
   # 2. supabase/policies/00001_rls_policies.sql
   # 3. supabase/seed.sql
   ```

### 4. Configurar Google OAuth
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear credenciales OAuth 2.0 (Web Application)
3. Agregar redirect URI de Supabase
4. Copiar Web Client ID a `.env`
5. Configurar provider Google en Supabase Dashboard → Auth → Providers

### 5. Iniciar la app
```bash
npx expo start
```
Escanear QR con Expo Go o presionar `a` para emulador Android.

---

## 📚 Fases de Desarrollo

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Kickoff & Setup | ✅ Completado |
| 1 | Infra & Auth | ⏳ Pendiente |
| 2 | Core Booking RPCs | ⏳ Pendiente |
| 3 | Mobile Booking Flow | ⏳ Pendiente |
| 4 | Panel Admin | ⏳ Pendiente |
| 5 | QA, Seguridad & Builds | ⏳ Pendiente |
| 6 | Launch Support | ⏳ Pendiente |

---

## 🔐 Seguridad

- **`service_role` key**: SOLO en Edge Functions y CI. Jamás en el cliente.
- Todos los secretos van en GitHub Secrets y env vars de Supabase/Expo.
- RLS habilitado en todas las tablas sensibles.
- JWT validación en cada Edge Function.

---

## 💰 Costos Estimados de Infraestructura

| Componente | Plan | Costo/mes |
|---|---|---|
| Supabase (Dev) | Free tier | $0 |
| Supabase (Prod) | Pro | $25 |
| Expo EAS | Free tier (30 builds/mes) | $0 |
| Google Play | One-time | $25 |
| Apple Developer | Annual | $99/año |

---

## 📄 Licencia

Privado — © 2026 TurnoSync
