import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');

// ── Slide data ───────────────────────────────────────────────────────────────
interface SlideData {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    bgAccent: string;
}

const SLIDES: SlideData[] = [
    {
        icon: 'cut-outline',
        title: 'Reserva en segundos',
        description:
            'Encuentra los mejores barberos cerca de ti y agenda tu turno sin llamadas ni esperas',
        bgAccent: 'rgba(201,168,76,0.08)',
    },
    {
        icon: 'time-outline',
        title: 'Tu tiempo es valioso',
        description:
            'Recibe recordatorios automáticos y gestiona tus citas desde la palma de tu mano',
        bgAccent: 'rgba(201,168,76,0.08)',
    },
    {
        icon: 'star-outline',
        title: 'Experiencia premium',
        description:
            'Califica a tu barbero, guarda tus favoritos y disfruta de una experiencia personalizada',
        bgAccent: 'rgba(201,168,76,0.08)',
    },
];

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
    onDone: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function OnboardingScreen({ onDone }: Props) {
    const { colors, isDark } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const goToNext = () => {
        const next = activeIndex + 1;
        if (next >= SLIDES.length) {
            onDone();
            return;
        }
        // Fade out → scroll → fade in
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {
            flatListRef.current?.scrollToIndex({ index: next, animated: false });
            setActiveIndex(next);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }).start();
        });
    };

    const isLast = activeIndex === SLIDES.length - 1;

    const renderSlide = ({ item }: { item: SlideData }) => (
        <View style={[styles.slide, { backgroundColor: colors.background }]}>
            {/* Card central */}
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.surface,
                        shadowOpacity: isDark ? 0 : 0.08,
                    },
                ]}
            >
                {/* Círculo del icono */}
                <View style={[styles.iconCircle, { backgroundColor: item.bgAccent }]}>
                    <Ionicons name={item.icon} size={48} color={colors.accent} />
                </View>

                <Text style={[styles.title, { color: colors.textPrimary }]}>
                    {item.title}
                </Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {item.description}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* ── Header con logo ── */}
            <SafeAreaView edges={['top']}>
                <View style={styles.header}>
                    {/* Logo */}
                    <View style={styles.logoRow}>
                        <Feather name="scissors" size={18} color={colors.accent} style={{ marginRight: 6 }} />
                        <Text style={[styles.logoText, { color: colors.accent }]}>TurnoSync</Text>
                    </View>

                    {/* Botón Saltar */}
                    {!isLast && (
                        <TouchableOpacity onPress={onDone} style={styles.skipBtn}>
                            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                                Saltar
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            {/* ── Slides ── */}
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    renderItem={renderSlide}
                    keyExtractor={(_, i) => String(i)}
                    horizontal
                    pagingEnabled
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                />
            </Animated.View>

            {/* ── Footer ── */}
            <SafeAreaView edges={['bottom']}>
                <View style={styles.footer}>
                    {/* Dots */}
                    <View style={styles.dots}>
                        {SLIDES.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor:
                                            i === activeIndex ? colors.accent : colors.divider,
                                        width: i === activeIndex ? 20 : 7,
                                    },
                                ]}
                            />
                        ))}
                    </View>

                    {/* Botón principal */}
                    <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
                        onPress={isLast ? onDone : goToNext}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryBtnText}>
                            {isLast ? 'Comenzar' : 'Siguiente'}
                        </Text>
                        <Ionicons
                            name={isLast ? 'checkmark' : 'arrow-forward'}
                            size={18}
                            color="#FFFFFF"
                            style={{ marginLeft: 8 }}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    skipBtn: {
        paddingHorizontal: 4,
        paddingVertical: 6,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '500',
    },

    // Slide
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    // Card
    card: {
        width: '100%',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        // sombra iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 16,
        elevation: 4,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 14,
        letterSpacing: 0.2,
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },

    // Footer
    footer: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginBottom: 24,
    },
    dot: {
        height: 7,
        borderRadius: 4,
    },

    // Botón
    primaryBtn: {
        height: 52,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
