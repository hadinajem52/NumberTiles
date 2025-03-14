import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Typography } from '../assets/styles/Typography';

const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f4e8" />
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Mega Merge</Text>
                    <Text style={styles.tagline}>Combine tiles, build your strategy</Text>
                </View>
                
                <View style={styles.card}>
                    <Text style={styles.subtitle}>Select Game Mode</Text>
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity 
                            style={styles.button}
                            onPress={() => navigation.navigate('Game', { mode: 'classic' })}>
                            <FontAwesome name="gamepad" size={24} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Classic Mode</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.comingSoonButton]}>
                            <FontAwesome name="clock-o" size={24} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Time Attack</Text>
                            <View style={styles.comingSoonBadge}>
                                <Text style={styles.comingSoonText}>SOON</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Your Stats</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>2048</Text>
                            <Text style={styles.statLabel}>Highest Tile</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>12,540</Text>
                            <Text style={styles.statLabel}>Best Score</Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.menuContainer}>
                    <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={() => navigation.navigate('Settings')}>
                        <FontAwesome name="cog" size={20} color="#6d4c41" />
                        <Text style={styles.menuButtonText}>Settings</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={() => navigation.navigate('Leaderboard')}>
                        <FontAwesome name="trophy" size={20} color="#6d4c41" />
                        <Text style={styles.menuButtonText}>Leaderboard</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f4e8',  // Match GameScreen background
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    title: {
        fontSize: 42,
        fontFamily: Typography.header.fontFamily,
        color: '#c8a165',  // Golden color from GameScreen
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    tagline: {
        fontSize: 16,
        fontFamily: Typography.body.fontFamily,
        color: '#8d6e63',  // Brown color from GameScreen
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#f0e6d2',  // Match GameScreen header background
        borderRadius: 15,
        padding: 20,
        width: '100%',
        shadowColor: '#d0c0a0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
        marginBottom: 20,
    },
    subtitle: {
        fontSize: Typography.subheader.fontSize,
        fontFamily: Typography.subheader.fontFamily,
        marginBottom: 20,
        color: '#6d4c41',  // Dark brown from GameScreen
        textAlign: 'center',
    },
    buttonGroup: {
        width: '100%',
    },
    button: {
        backgroundColor: '#c8a165',  // Match GameScreen button color
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#8d6e63',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    buttonIcon: {
        marginRight: 15,
    },
    comingSoonButton: {
        backgroundColor: '#a1887f',  // Muted color for unavailable mode
        position: 'relative',
    },
    comingSoonBadge: {
        position: 'absolute',
        right: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    comingSoonText: {
        color: '#a1887f',
        fontSize: 11,
        fontFamily: Typography.body.fontFamily,
           },
    buttonText: {
        color: 'white',
        fontSize: Typography.button.fontSize,
        fontFamily: Typography.button.fontFamily,
    },
    statsCard: {
        backgroundColor: '#f0e6d2',
        borderRadius: 15,
        padding: 15,
        width: '100%',
        shadowColor: '#d0c0a0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
        marginBottom: 20,
    },
    statsTitle: {
        fontSize: 18,
        fontFamily: Typography.subheader.fontFamily,
        color: '#6d4c41',
        marginBottom: 15,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontFamily: Typography.header.fontFamily,
        color: '#c8a165',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: Typography.body.fontFamily,
        color: '#8d6e63',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    menuButton: {
        backgroundColor: '#f0e6d2',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        width: '48%',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#d0c0a0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 2,
    },
    menuButtonText: {
        marginLeft: 10,
        fontSize: Typography.body.fontSize,
        fontFamily: Typography.body.fontFamily,
        color: '#6d4c41',
        fontWeight: '500',
    },
});

export default HomeScreen;