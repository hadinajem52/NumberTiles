import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, AppState } from 'react-native';
import Board from '../components/Board';
import ScoreBoard from '../components/ScoreBoard';
import { GameEngine } from '../game/engine';
import { useGameLogic } from '../game/logic';
import { saveGameState, loadGameState, clearGameState } from '../utils/storage';

const GameScreen = ({ navigation }) => {
    const [gameState, setGameState] = useState(GameEngine.initialize('classic'));
    const { handleSwipe, resetGame, isGameOver } = useGameLogic(gameState, setGameState);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [highestTile, setHighestTile] = useState(1);
    const [appState, setAppState] = useState(AppState.currentState);
    const [highScore, setHighScore] = useState(0); // Track all-time high score
    
    // Load saved game and high score on initial mount
    useEffect(() => {
        const loadSavedGame = async () => {
            const savedData = await loadGameState();
            if (savedData) {
                if (savedData.gameState) setGameState(savedData.gameState);
                if (savedData.elapsedTime) setElapsedTime(savedData.elapsedTime);
                if (savedData.highestTile) setHighestTile(savedData.highestTile);
                if (savedData.highScore !== undefined) setHighScore(savedData.highScore);
            }
        };
        
        loadSavedGame();
    }, []);
    
    // Update high score when current score exceeds it
    useEffect(() => {
        if (gameState.score > highScore) {
            setHighScore(gameState.score);
        }
    }, [gameState.score, highScore]);
    
    // Save game state when app goes to background
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (appState.match(/active/) && nextAppState.match(/inactive|background/)) {
                // App is going to background, save game state
                saveGameSession();
            }
            setAppState(nextAppState);
        };
        
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        
        return () => {
            subscription.remove();
        };
    }, [appState, gameState, elapsedTime, highestTile, highScore]);
    
    // Save game state periodically and on unmount
    useEffect(() => {
        const saveInterval = setInterval(() => {
            saveGameSession();
        }, 10000); // Save every 10 seconds
        
        return () => {
            clearInterval(saveInterval);
            saveGameSession(); // Save on component unmount
        };
    }, [gameState, elapsedTime, highestTile, highScore]);
    
    // Function to save all game session data
    const saveGameSession = async () => {
        if (isGameOver(gameState)) return; // Don't save if game is over
        
        const sessionData = {
            gameState,
            elapsedTime,
            highestTile,
            highScore // Include high score in saved data
        };
        
        await saveGameState(sessionData);
    };

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
    
    // Reset timer, highest tile, and clear saved state when starting new game
    // But preserve the high score
    const handleReset = async () => {
        const currentHighScore = highScore; // Save current high score
        
        setElapsedTime(0);
        setHighestTile(1);
        resetGame();
        
        await clearGameState(); // Clear saved game state
        
        // Save back just the high score
        await saveGameState({ highScore: currentHighScore });
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
            <View style={styles.headerCompact}>
                <View style={styles.topRow}>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.statLabel}>SCORE</Text>
                        <Text style={styles.scoreValue}>{gameState.score}</Text>
                    </View>
                    
                    <View style={styles.highScoreContainer}>
                        <Text style={styles.highScoreLabel}>BEST</Text>
                        <Text style={styles.highScoreValue}>{highScore}</Text>
                    </View>
                </View>
                
                <View style={styles.bottomRow}>
                    <View style={styles.timeContainer}>
                        <Text style={styles.statLabel}>TIME</Text>
                        <Text style={styles.timeValue}>{formatTime(elapsedTime)}</Text>
                    </View>
                    
                    <View style={styles.highestTileWrapper}>
                        <Text style={styles.statLabel}>HIGHEST TILE</Text>
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
            </View>
            
            <View style={styles.boardWrapper}>
                <Board 
                    tiles={gameState.tiles} 
                    tileList={gameState.tileList}
                    previousPositions={gameState.previousPositions}
                    onSwipe={handleSwipe} 
                />
            </View>
            
            <View style={styles.controls}>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleReset}>
                    <Text style={styles.buttonText}>New Game</Text>
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
        backgroundColor: '#f8f4e8', // Warm cream background for cozy feel
        padding: 16,
        paddingTop: 10, // Reduced top padding
    },
    headerCompact: {
        width: '100%',
        backgroundColor: '#f0e6d2',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#d0c0a0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scoreContainer: {
        backgroundColor: '#c8a165',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#8d6e63',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        flex: 1,
        marginRight: 10,
        minHeight: 65,
        justifyContent: 'center',
    },
    scoreValue: {
        fontSize: 22,
        color: 'white',
        fontWeight: 'bold',
    },
    timeContainer: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(161, 136, 127, 0.15)',
        borderRadius: 10,
        flex: 1,
        marginRight: 10,
        minHeight: 65,
        justifyContent: 'center',
    },
    timeValue: {
        fontSize: 20,
        color: '#6d4c41',
        fontWeight: 'bold',
    },
    highestTileWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#8d6e63',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    highestTileBox: {
        width: 65,
        height: 65,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        shadowColor: '#a1887f',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: Platform.OS === 'android' ? 2 : 0,
    },
    highestTileText: {
        fontWeight: 'bold',
    },
    boardWrapper: {
        shadowColor: '#d0c0a0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        borderRadius: 6,
        marginVertical: 5, // Reduced margin
    },
    controls: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12, // Reduced margin
        padding: 10,
        backgroundColor: '#f0e6d2',
        borderRadius: 15,
        shadowColor: '#d0c0a0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
    },
    button: {
        backgroundColor: '#c8a165',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 12,
        minWidth: 130,
        alignItems: 'center',
        shadowColor: '#8d6e63',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: Platform.OS === 'android' ? 3 : 0,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    highScoreContainer: {
        backgroundColor: '#a1887f',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#8d6e63',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
        flex: 1,
        marginLeft: 10,
        minHeight: 65,
        justifyContent: 'center',
    },
    highScoreLabel: {
        fontSize: 12,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    highScoreValue: {
        fontSize: 22,
        color: 'white',
        fontWeight: 'bold',
    },
});

export default GameScreen;