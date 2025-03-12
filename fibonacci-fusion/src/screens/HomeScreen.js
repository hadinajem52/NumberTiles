import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Fibonacci Fusion</Text>
            
            <Text style={styles.subtitle}>Game Modes</Text>
            <View style={styles.buttonGroup}>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={() => navigation.navigate('Game', { mode: 'classic' })}>
                    <Text style={styles.buttonText}>Classic Mode</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.button, styles.timeAttackButton]}
                    onPress={() => navigation.navigate('Game', { mode: 'timeAttack' })}>
                    <Text style={styles.buttonText}>Time Attack</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.button, styles.challengeButton]}
                    onPress={() => navigation.navigate('Game', { mode: 'challenge' })}>
                    <Text style={styles.buttonText}>Challenge</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.menuButtons}>
                <Button
                    title="Settings"
                    onPress={() => navigation.navigate('Settings')}
                />
                <Button
                    title="Leaderboard"
                    onPress={() => navigation.navigate('Leaderboard')}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 15,
        color: '#555',
    },
    buttonGroup: {
        width: '100%',
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
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
        fontWeight: 'bold',
    },
    menuButtons: {
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
});

export default HomeScreen;