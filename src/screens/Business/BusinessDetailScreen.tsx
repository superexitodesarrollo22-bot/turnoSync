import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useBusinessDetail } from '../../hooks/useBusinessDetail';
import { SkeletonBox } from '../../components/ui/SkeletonBox';
import { GradientButton } from '../../components/ui/GradientButton';

export default function BusinessDetailScreen({ route, navigation }: any) {
    const { businessId } = route.params;
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { business, loading } = useBusinessDetail(businessId);

    if (loading) return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={{ padding: 20 }}>
                <SkeletonBox width="10%" height={30} style={{ marginBottom: 20 }} />
                <SkeletonBox width="100%" height={200} borderRadius={24} style={{ marginBottom: 20 }} />
                <SkeletonBox width="60%" height={28} style={{ marginBottom: 12 }} />
                <SkeletonBox width="100%" height={16} style={{ marginBottom: 8 }} />
                <SkeletonBox width="80%" height={16} />
            </View>
        </SafeAreaView>
    );

    const handleBooking = () => {
        if (!business) return;
        navigation.navigate('BookingSelectService', {
            businessId: business.id,
            businessName: business.name
        });
    };

    if (!loading && !business) return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
            <Feather name="alert-circle" size={48} color={colors.error} />
            <Text style={{ color: colors.textPrimary, marginTop: 16, fontSize: 18, fontWeight: '700' }}>Error al cargar el negocio</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
                Asegúrate de haber ejecutado el script SQL de corrección en Supabase para resolver la recursión de RLS.
            </Text>
            <TouchableOpacity 
                style={{ marginTop: 24, padding: 12, backgroundColor: colors.accent, borderRadius: 12 }}
                onPress={() => navigation.goBack()}
            >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Volver atrás</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: business?.logo_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000' }}
                        style={styles.heroImage}
                    />
                    <View style={styles.overlay} />
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.backButton, { top: insets.top + 10 }]}
                    >
                        <Feather name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.content, { marginTop: -30, backgroundColor: colors.background }]}>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.bizName, { color: colors.textPrimary }]}>{business?.name}</Text>
                        <View style={styles.ratingRow}>
                            <Feather name="star" size={14} color={colors.accent} fill={colors.accent} />
                            <Text style={[styles.ratingText, { color: colors.textPrimary }]}>4.9 · 128 Calificaciones</Text>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.infoItem}>
                            <View style={[styles.iconBox, { backgroundColor: colors.accentDim }]}>
                                <Feather name="map-pin" size={18} color={colors.accent} />
                            </View>
                            <View style={styles.infoTextCol}>
                                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>DIRECCIÓN</Text>
                                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{business?.address}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={[styles.iconBox, { backgroundColor: colors.accentDim }]}>
                                <Feather name="phone" size={18} color={colors.accent} />
                            </View>
                            <View style={styles.infoTextCol}>
                                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>TELÉFONO</Text>
                                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{business?.phone || 'No disponible'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={[styles.iconBox, { backgroundColor: colors.accentDim }]}>
                                <Feather name="clock" size={18} color={colors.accent} />
                            </View>
                            <View style={styles.infoTextCol}>
                                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>HORARIO</Text>
                                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>Disponible</Text>
                            </View>
                        </View>
                    </View>

                    {business?.description && (
                        <View style={styles.descriptionSection}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Sobre nosotros</Text>
                            <Text style={[styles.bizDesc, { color: colors.textSecondary }]}>{business?.description}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: colors.surface }]}>
                <GradientButton
                    label="RESERVAR TURNO"
                    onPress={handleBooking}
                    icon="calendar-outline"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        height: 300,
        width: '100%',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 24,
        paddingTop: 30,
    },
    headerInfo: {
        marginBottom: 25,
    },
    bizName: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoSection: {
        gap: 20,
        marginBottom: 30,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoTextCol: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    descriptionSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
    },
    bizDesc: {
        fontSize: 15,
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    bookBtn: {
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    bookBtnText: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
