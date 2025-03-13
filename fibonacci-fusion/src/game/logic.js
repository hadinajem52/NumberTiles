import { useCallback, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native'; // Add this import
import { GameEngine } from './engine';
import { canMergeNumbers, getNextPowerOfTwo } from '../utils/fibonacci';
import config from '../config';

class Logic {
    constructor(board) {
        this.board = board;
        this.gridSize = 5; // Updated to 5x5 grid
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

    // Add method to check if a specific tile can be merged with adjacent tiles
    canTileMerge(tiles, tileId, tileList) {
        const tile = tileList.find(t => t.id === tileId);
        if (!tile || tile.value === 0) return false;
        
        const { row, col, value } = tile;
        
        // Check adjacent cells
        const directions = [
            { row: -1, col: 0 }, // up
            { row: 1, col: 0 },  // down
            { row: 0, col: -1 }, // left
            { row: 0, col: 1 }   // right
        ];
        
        for (const dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;
            
            if (this.isInBounds(newRow, newCol)) {
                const adjacentTile = tileList.find(t => t.row === newRow && t.col === newCol);
                if (adjacentTile && adjacentTile.value === value) {
                    return true;
                }
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
    const [animating, setAnimating] = useState(false);
    const [animationDuration, setAnimationDuration] = useState(config.animations?.tile?.moveSpeed || 150);
    const animationsInProgress = useRef(0); // Track animations in progress

    /**
     * Handle directional swipe/key action
     * @param {string} direction - Direction: 'up', 'down', 'left', 'right'
     */
    const handleSwipe = useCallback((direction) => {
        // Don't process input during animations
        if (animating) return;
        
        setGameState(currentState => {
            // Don't allow moves if game is over
            if (currentState.gameOver) {
                return currentState;
            }

            // Process the move
            const newState = GameEngine.move(currentState, direction);
            
            // Do a deeper comparison to avoid unnecessary updates
            if (currentState.score === newState.score && 
                currentState.moves === newState.moves &&
                JSON.stringify(currentState.tileList) === JSON.stringify(newState.tileList)) {
                return currentState;
            }
            
            // Set animating flag to prevent rapid moves during animations
            setAnimating(true);
            
            // Calculate animation stats for better performance
            const movingTiles = newState.tileList.filter(t => 
                currentState.tileList.some(old => 
                    old.id === t.id && 
                    (old.row !== t.row || old.col !== t.col)
                )
            );
            const movingTileCount = movingTiles.length;
            const maxDistance = movingTiles.reduce((max, tile) => {
                const oldTile = currentState.tileList.find(t => t.id === tile.id);
                if (oldTile) {
                    const distance = Math.sqrt(
                        Math.pow(oldTile.row - tile.row, 2) + 
                        Math.pow(oldTile.col - tile.col, 2)
                    );
                    return Math.max(max, distance);
                }
                return max;
            }, 0);
            
            // Enrich animation timing calculation
            const baseDuration = config.animations?.tile?.moveSpeed || 150;
            const scaleFactor = maxDistance > 3 ? 1.3 : (maxDistance > 2 ? 1.2 : 1);
            const batchAdjustment = Math.min(Math.floor(movingTileCount * 3.5), 35);
            const totalDuration = Math.round((baseDuration * scaleFactor) + batchAdjustment);
            
            // Add batch info to moving tiles
            newState.animationBatch = {
                size: movingTileCount,
                duration: totalDuration,
                maxDistance: maxDistance
            };
            
            // Schedule animation lock removal with a small buffer
            const unlockBuffer = 25; // ms buffer to ensure animations complete
            setTimeout(() => setAnimating(false), totalDuration + unlockBuffer);
            
            return newState;
        });
    }, [setGameState, animating]);

    /**
     * Reset the game to initial state
     */
    const resetGame = useCallback(() => {
        setGameState(() => {
            return GameEngine.initialize('classic');
        });
    }, [setGameState]);
    
    /**
     * Check if the game is over
     */
    const isGameOver = useCallback((state) => {
        if (state.gameOver) return true;
        return GameEngine.isGameOver(state);
    }, []);
    
    /**
     * Load animation settings from config and optimize for device
     */
    useEffect(() => {
        if (config.animations) {
            // Start with base animation duration
            let baseDuration = config.animations.tile.moveSpeed;
            
            try {
                // Safely check platform
                if (Platform && Platform.OS === 'android') {
                    // Android devices might need more time between animations
                    setAnimationDuration(baseDuration * 1.2);
                } else {
                    setAnimationDuration(baseDuration);
                }
            } catch (e) {
                // If Platform is undefined or any other error, use default duration
                setAnimationDuration(baseDuration);
                console.log('Using default animation timing');
            }
        }
    }, []);
    
    return {
        handleSwipe,
        resetGame,
        isGameOver,
        isAnimating: animating
    };
};