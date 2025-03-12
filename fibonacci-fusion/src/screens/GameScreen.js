import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Board from '../components/Board';
import ScoreBoard from '../components/ScoreBoard';
import { GameEngine } from '../game/engine';
import { useGameLogic } from '../game/logic';

const GameScreen = ({ navigation, route }) => {
    const gameMode = route.params?.mode || 'classic';
    const [gameState, setGameState] = useState(GameEngine.initialize(gameMode));
    const { handleSwipe, resetGame, isGameOver } = useGameLogic(gameState, setGameState);
    
    // Check for game over
    useEffect(() => {
        if (isGameOver(gameState)) {
            Alert.alert(
                "Game Over",
                `Your final score: ${gameState.score}`,
                [
                    { text: "Try Again", onPress: () => resetGame() },
                    { text: "Return to Menu", onPress: () => navigation.navigate('Home') }
                ]
            );
        }
    }, [gameState, isGameOver, resetGame, navigation]);

    // Removed keyboard event handling code since this is Android only

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.modeText}>{gameMode.toUpperCase()} MODE</Text>
                <ScoreBoard score={gameState.score} />
            </View>
            
            <Board tiles={gameState.tiles} onSwipe={handleSwipe} />
            
            <View style={styles.controls}>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => resetGame()}>
                    <Text style={styles.buttonText}>New Game</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.button, styles.secondaryButton]} 
                    onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.buttonText}>Menu</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 16,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
    },
    controls: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#ffa64d',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    secondaryButton: {
        backgroundColor: '#6eb5ff',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GameScreen;