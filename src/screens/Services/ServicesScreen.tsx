import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ServicesScreenSkeleton } from '../../components/ui/SkeletonLoader';

const SERVICES = [
    { id: '1', name: 'Corte Clásico', icon: 'scissors', duration: '30min', price: '$15' },
    { id: '2', name: 'Barba', icon: 'feather', duration: '20min', price: '$10' },
    { id: '3', name: 'Corte y Barba', icon: 'star', duration: '45min', price: '$22' },
    { id: '4', name: 'Afeitado', icon: 'wind', duration: '25min', price: '$18' },
    { id: '5', name: 'Diseño', icon: 'edit', duration: '15min', price: '$8' },
    { id: '6', name: 'Tratamiento', icon: 'droplet', duration: '40min', price: '$25' },
];

const COLORS = {
    background: '#0D0D1A',
    surface: '#1A1A2E',
    gold: '#C9A84C',
    goldDim: '#C9A84C20',
    white: '#FFFFFF',
    textSecondary: '#A0A0B0',
};

export default function ServicesScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('BusinessList')} // Navigate to flow
        >
            <View style={styles.iconCircle}>
                <Feather name={item.icon as any} size={22} color={COLORS.gold} />
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.duration}>{item.duration}</Text>
            <Text style={styles.price}>{item.price}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Servicios</Text>
            </View>

            {loading ? (
                <ServicesScreenSkeleton />
            ) : (
                <FlatList
                    data={SERVICES}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    columnWrapperStyle={styles.columnWrapper}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: 20, marginBottom: 10 },
    headerTitle: { color: COLORS.white, fontSize: 28, fontWeight: 'bold' },
    list: { padding: 15 },
    columnWrapper: { justifyContent: 'space-between', marginBottom: 15 },
    card: {
        width: '48%',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.goldDim,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
    duration: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 8 },
    price: { color: COLORS.gold, fontSize: 15, fontWeight: 'bold' },
});
