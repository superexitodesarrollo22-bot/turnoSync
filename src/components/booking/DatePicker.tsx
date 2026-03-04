import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useTheme } from '../../hooks/useTheme';

// Configurar calendario en español
LocaleConfig.locales['es'] = {
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

interface DatePickerProps {
    minDate: string;
    maxDate: string;
    onDateSelect: (date: any) => void;
    selectedDate?: string;
    disabledDates?: string[];
    workingDays?: number[]; // [1,2,3,4,5]
}

export const DatePicker = ({ minDate, maxDate, onDateSelect, selectedDate, disabledDates = [], workingDays = [] }: DatePickerProps) => {
    const { colors, isDark } = useTheme();

    // Generar marcadores y deshabilitar días
    const markedDates: any = {};

    // 1. Días deshabilitados explícitos (blackout)
    disabledDates.forEach(d => {
        markedDates[d] = { disabled: true, disableTouchEvent: true, inactive: true };
    });

    // 2. Día seleccionado
    if (selectedDate) {
        markedDates[selectedDate] = {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: colors.accent,
            selectedTextColor: isDark ? '#0D0D1A' : '#FFFFFF'
        };
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Calendar
                theme={{
                    backgroundColor: colors.surface,
                    calendarBackground: colors.surface,
                    textSectionTitleColor: colors.textSecondary,
                    selectedDayBackgroundColor: colors.accent,
                    selectedDayTextColor: isDark ? '#0D0D1A' : '#FFFFFF',
                    todayTextColor: colors.accent,
                    dayTextColor: colors.textPrimary,
                    textDisabledColor: colors.textMuted,
                    dotColor: colors.accent,
                    selectedDotColor: isDark ? '#0D0D1A' : '#FFFFFF',
                    arrowColor: colors.accent,
                    disabledArrowColor: colors.border,
                    monthTextColor: colors.textPrimary,
                    indicatorColor: colors.accent,
                    textDayFontWeight: '600',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '600',
                    textDayFontSize: 15,
                    textMonthFontSize: 17,
                    textDayHeaderFontSize: 14,
                }}
                minDate={minDate}
                maxDate={maxDate}
                onDayPress={(day: any) => {
                    const date = day.dateString;
                    const dateObj = new Date(date);
                    // Validar si es día laboral
                    const dayOfWeek = (dateObj.getDay() + 1) % 7; // Ajuste por timezone
                    // En realidad Calendars ya deshabilita fuera de min/max, solo falta blackout y laborales
                    onDateSelect(day);
                }}
                markedDates={markedDates}
                firstDay={1} // Lunes
                enableSwipeMonths={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        padding: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    }
});
