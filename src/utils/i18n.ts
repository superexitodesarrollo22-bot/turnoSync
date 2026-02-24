// ─── i18n placeholder ─────────────────────────────────
// Ready for full i18n integration (e.g., expo-localization + i18next)
// For Phase 0 we use a simple key-value map.

const es = {
    common: {
        loading: 'Cargando...',
        error: 'Ocurrió un error',
        retry: 'Reintentar',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        save: 'Guardar',
        delete: 'Eliminar',
        search: 'Buscar',
        noResults: 'Sin resultados',
    },
    auth: {
        welcome: 'Bienvenido a TurnoSync',
        subtitle: 'Reserva tu turno en segundos',
        loginGoogle: 'Continuar con Google',
        logout: 'Cerrar sesión',
    },
    home: {
        title: 'Explorar',
        greeting: 'Hola',
        searchPlaceholder: 'Buscar barberías...',
        nearYou: 'Cerca de ti',
        popular: 'Populares',
    },
    booking: {
        selectService: 'Elige un servicio',
        selectStaff: 'Elige un profesional',
        selectDateTime: 'Fecha y hora',
        confirm: 'Confirmar reserva',
        success: '¡Reserva confirmada!',
        myBookings: 'Mis Reservas',
        cancelBooking: 'Cancelar reserva',
        noBookings: 'No tienes reservas aún',
    },
    admin: {
        dashboard: 'Panel de control',
        services: 'Gestionar Servicios',
        staff: 'Gestionar Equipo',
        schedules: 'Horarios de Atención',
        appointments: 'Citas Hoy',
        revenue: 'Ingresos Mensuales',
        newClients: 'Clientes Nuevos',
        topServices: 'Ranking de Servicios',
    },
};

export type TranslationKeys = typeof es;
export const t = es;
