import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f4f0" />
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Fibonacci Fusion</Text>
                    <Text style={styles.tagline}>Puzzle your way through numbers</Text>
                </View>
                
                <View style={styles.card}>
                    <Text style={styles.subtitle}>Game Modes</Text>
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity 
                            style={styles.button}
                            onPress={() => navigation.navigate('Game', { mode: 'classic' })}>
                            <FontAwesome name="gamepad" size={20} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Classic Mode</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.timeAttackButton]}
                            onPress={() => navigation.navigate('Game', { mode: 'timeAttack' })}>
                            <FontAwesome name="clock-o" size={20} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Time Attack</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.challengeButton]}
                            onPress={() => navigation.navigate('Game', { mode: 'challenge' })}>
                            <FontAwesome name="trophy" size={20} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.buttonText}>Challenge</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.menuContainer}>
                    <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={() => navigation.navigate('Settings')}>
                        <FontAwesome name="cog" size={18} color="#555" />
                        <Text style={styles.menuButtonText}>Settings</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={() => navigation.navigate('Leaderboard')}>
                        <FontAwesome name="list-ol" size={18} color="#555" />
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
        backgroundColor: '#f8f4f0',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#3a6351',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#777',
        fontStyle: 'italic',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        marginBottom: 25,
    },
    subtitle: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
        color: '#3a6351',
        textAlign: 'center',
    },
    buttonGroup: {
        width: '100%',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    buttonIcon: {
        marginRight: 10,
    },
    timeAttackButton: {
        backgroundColor: '#FF9800',
    },
    challengeButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    menuContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
    },
    menuButton: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '45%',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    menuButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#555',
        fontWeight: '500',
    },
});

export default HomeScreen;