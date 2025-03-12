import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Board from '../components/Board';
import ScoreBoard from '../components/ScoreBoard';
import { GameEngine } from '../game/engine';
import { useGameLogic } from '../game/logic';

const GameScreen = () => {
    const [gameState, setGameState] = useState(GameEngine.initialize());
    const { handleSwipe } = useGameLogic(gameState, setGameState);

    useEffect(() => {
        const handleKeyPress = (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    handleSwipe('up');
                    break;
                case 'ArrowDown':
                    handleSwipe('down');
                    break;
                case 'ArrowLeft':
                    handleSwipe('left');
                    break;
                case 'ArrowRight':
                    handleSwipe('right');
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [gameState]);

    return (
        <View style={styles.container}>
            <ScoreBoard score={gameState.score} />
            <Board tiles={gameState.tiles} onSwipe={handleSwipe} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
});

export default GameScreen;