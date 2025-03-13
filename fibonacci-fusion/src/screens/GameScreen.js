import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Board from '../components/Board';
import ScoreBoard from '../components/ScoreBoard';
import { GameEngine } from '../game/engine';
import { useGameLogic } from '../game/logic';

const GameScreen = ({ navigation }) => {
    const [gameState, setGameState] = useState(GameEngine.initialize('classic'));
    const { handleSwipe, resetGame, isGameOver } = useGameLogic(gameState, setGameState);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [highestTile, setHighestTile] = useState(1);
    
    // Calculate highest tile whenever gameState changes
    useEffect(() => {
        // Find highest value in the tiles array
        const highest = gameState.tileList.reduce((max, tile) => {
            return tile.value > max ? tile.value : max;
        }, 0);
        
        if (highest > highestTile) {
            setHighestTile(highest);
        }
    }, [gameState.tileList]);
    
    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);
    
    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };
    
    // Reset timer and highest tile when starting new game
    const handleReset = () => {
        setElapsedTime(0);
        setHighestTile(1);
        resetGame();
    };
    
    // Get appropriate background color based on tile value (using same colors from Tile.js)
    const getHighestTileColor = useMemo(() => {
        // Color map for 2048-style game (matching exactly with Tile.js)
        const colors = {
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e',
            4096: '#3c3a32',
            8192: '#121212',
            16384: '#0a0a0a',
        };
        return colors[highestTile] || '#6d597a'; // Default purple for very large numbers (matching Tile.js)
    }, [highestTile]);
    
    // Get text color for highest tile (matching Tile.js logic)
    const getHighestTileTextColor = useMemo(() => {
        return highestTile >= 8 ? '#ffffff' : '#776e65';
    }, [highestTile]);
    
    // Adjust font size based on value length (matching Tile.js logic)
    const getHighestTileFontSize = useMemo(() => {
        if (highestTile >= 10000) return 18;
        if (highestTile >= 1000) return 20;
        if (highestTile >= 100) return 24;
        if (highestTile >= 10) return 28;
        return 32;
    }, [highestTile]);
    
    // Check for game over
    useEffect(() => {
        if (isGameOver(gameState)) {
            Alert.alert(
                "Game Over",
                `Your final score: ${gameState.score}\nHighest tile: ${highestTile}\nTime: ${formatTime(elapsedTime)}`,
                [
                    { text: "Try Again", onPress: () => handleReset() },
                    { text: "Return to Menu", onPress: () => navigation.navigate('Home') }
                ]
            );
        }
    }, [gameState, isGameOver, resetGame, navigation, elapsedTime, highestTile]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.modeText}>CLASSIC GAME</Text>
                    <Text style={styles.timeText}>Time: {formatTime(elapsedTime)}</Text>
                </View>
                <ScoreBoard score={gameState.score} />
            </View>
            
            <View style={styles.statsContainer}>
                <View style={styles.highestTileContainer}>
                    <Text style={styles.statLabel}>Highest Tile</Text>
                    <View style={[styles.highestTileBox, { backgroundColor: getHighestTileColor }]}>
                        <Text style={[
                            styles.highestTileText, 
                            { 
                                color: getHighestTileTextColor,
                                fontSize: getHighestTileFontSize 
                            }
                        ]}>
                            {highestTile}
                        </Text>
                    </View>
                </View>
            </View>
            
            <Board 
                tiles={gameState.tiles} 
                tileList={gameState.tileList}
                previousPositions={gameState.previousPositions}
                onSwipe={handleSwipe} 
            />
            
            <View style={styles.controls}>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleReset}>
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
        marginBottom: 10,
    },
    modeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
    },
    timeText: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    statsContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    highestTileContainer: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    highestTileBox: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    highestTileText: {
        fontWeight: 'bold',
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