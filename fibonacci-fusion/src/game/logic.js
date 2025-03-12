import { useCallback, useEffect, useState } from 'react';
import { GameEngine } from './engine';
import { canMergeNumbers, getNextPowerOfTwo } from '../utils/fibonacci';

class Logic {
    constructor(board) {
        this.board = board;
        this.gridSize = 6; // Updated to 6x6 grid
    }

    mergeTiles(tile1, tile2) {
        if (tile1.value === tile2.value) {
            // In 2048, merged value is double the original
            const newValue = tile1.value * 2;
            tile1.value = newValue;
            tile2.value = 0; // Mark tile2 as empty
            return newValue;
        }
        return null;
    }

    spawnNewTile() {
        const emptyTiles = this.board.getEmptyTiles();
        if (emptyTiles.length === 0) return;

        const randomIndex = Math.floor(Math.random() * emptyTiles.length);
        const newTilePosition = emptyTiles[randomIndex];
        // 90% chance for 2, 10% chance for 4
        const newValue = Math.random() < 0.9 ? 2 : 4;
        this.board.setTile(newTilePosition, newValue);
    }

    checkGameOver() {
        return this.board.getEmptyTiles().length === 0 && !this.canMerge();
    }

    canMerge() {
        const tiles = this.board.getTiles();
        for (let i = 0; i < tiles.length; i++) {
            for (let j = 0; j < tiles.length; j++) {
                if (this.canMergeWithAdjacent(tiles, i, j)) {
                    return true;
                }
            }
        }
        return false;
    }

    canMergeWithAdjacent(tiles, x, y) {
        const currentTile = tiles[x][y];
        if (currentTile.value === 0) return false;

        const directions = [
            { x: 0, y: 1 }, // right
            { x: 1, y: 0 }, // down
            { x: 0, y: -1 }, // left
            { x: -1, y: 0 } // up
        ];

        for (const direction of directions) {
            const newX = x + direction.x;
            const newY = y + direction.y;
            if (this.isInBounds(newX, newY) && tiles[newX][newY].value === currentTile.value) {
                return true;
            }
        }
        return false;
    }

    isInBounds(x, y) {
        return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
    }
}

export default Logic;

/**
 * React hook for managing game logic
 * @param {Object} initialState - Initial game state
 * @param {Function} setGameState - State setter function
 * @returns {Object} Game logic functions
 */
export const useGameLogic = (initialState, setGameState) => {
    // Create a timer for Time Attack mode
    const [timer, setTimer] = useState(null);

    /**
     * Handle directional swipe/key action
     * @param {string} direction - Direction: 'up', 'down', 'left', 'right'
     */
    const handleSwipe = useCallback((direction) => {
        setGameState(currentState => {
            // Don't allow moves if game is over
            if (currentState.gameOver) {
                return currentState;
            }

            // Process the move
            const newState = GameEngine.move(currentState, direction);
            
            // For Challenge mode, check if target is reached
            if (newState.mode === 'challenge' && hasReachedTarget(newState)) {
                return {
                    ...newState,
                    gameOver: true,
                    win: true
                };
            }
            
            // For Challenge mode, check moves limit
            if (newState.mode === 'challenge' && newState.moves >= newState.movesLimit) {
                return {
                    ...newState,
                    gameOver: true,
                    win: false
                };
            }
            
            // Check if game is over for any mode
            if (GameEngine.isGameOver(newState)) {
                return {
                    ...newState,
                    gameOver: true
                };
            }
            
            return newState;
        });
    }, [setGameState]);
    
    /**
     * Check if target Fibonacci number has been reached (Challenge Mode)
     * @param {Object} state - Current game state
     * @returns {boolean} Whether target has been reached
     */
    const hasReachedTarget = useCallback((state) => {
        if (!state.targetNumber) return false;
        
        // Check all tiles for target number
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (state.tiles[row][col] >= state.targetNumber) {
                    return true;
                }
            }
        }
        return false;
    }, []);
    
    /**
     * Reset the game to initial state
     * @param {string} mode - Optional: game mode to reset to
     */
    const resetGame = useCallback((mode = null) => {
        // Clear any existing timer
        if (timer) {
            clearInterval(timer);
        }
        
        // Initialize with current or new mode
        setGameState(currentState => {
            const newMode = mode || currentState.mode;
            let newState = GameEngine.initialize(newMode);
            
            // Add Challenge mode specific properties
            if (newMode === 'challenge') {
                // Select a target Fibonacci number based on difficulty
                // For example: aim for 21 within 20 moves
                newState = {
                    ...newState,
                    targetNumber: 21,  // Let's set 21 as target (can be adjusted)
                    movesLimit: 20,    // 20 moves to get there
                    win: false
                };
            }
            
            return newState;
        });
    }, [setGameState, timer]);
    
    /**
     * Check if the game is over
     */
    const isGameOver = useCallback((state) => {
        if (state.gameOver) return true;
        
        // Different end conditions based on mode
        switch (state.mode) {
            case 'timeAttack':
                return state.timeLeft <= 0;
            case 'challenge':
                return state.moves >= state.movesLimit || hasReachedTarget(state);
            case 'classic':
            default:
                return GameEngine.isGameOver(state);
        }
    }, [hasReachedTarget]);
    
    // Time Attack mode timer
    useEffect(() => {
        // Only start timer for Time Attack mode
        if (initialState.mode === 'timeAttack' && !initialState.gameOver && initialState.timeLeft > 0) {
            // Clear any existing timer
            if (timer) clearInterval(timer);
            
            // Create new timer that ticks every second
            const newTimer = setInterval(() => {
                setGameState(currentState => {
                    // Update time and check if game should end
                    return GameEngine.updateTimeAttack(currentState);
                });
            }, 1000); // 1 second interval
            
            setTimer(newTimer);
            
            // Cleanup timer on unmount
            return () => clearInterval(newTimer);
        }
    }, [initialState.mode, initialState.gameOver, initialState.timeLeft, timer, setGameState]);
    
    // Get game mode specific UI helper data
    const getModeInfo = useCallback((state) => {
        switch (state.mode) {
            case 'timeAttack':
                return {
                    showTimer: true,
                    timerValue: state.timeLeft,
                    timerFormat: formatTime(state.timeLeft)
                };
            case 'challenge':
                return {
                    showTarget: true,
                    targetNumber: state.targetNumber,
                    showMovesLimit: true,
                    movesLeft: state.movesLimit - state.moves,
                    progress: (state.moves / state.movesLimit) * 100
                };
            case 'classic':
            default:
                return {
                    showBestScore: true
                };
        }
    }, []);
    
    /**
     * Format seconds into MM:SS display
     */
    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);
    
    return {
        handleSwipe,
        resetGame,
        isGameOver,
        getModeInfo,
        hasReachedTarget
    };
};