/**
 * 2048-Style Game Engine with Larger Grid
 * Handles core game logic, board state, and calculations
 */

// Import the new utility functions
import { isPowerOfTwo, getNextPowerOfTwo, getRandomStartingValue } from '../utils/fibonacci';

// Constants
const GRID_SIZE = 6; // Larger 6x6 grid
const GOAL_TILE = 8192; // Higher goal tile value

export class GameEngine {
    /**
     * Initialize a new game state
     * @param {string} mode - Game mode: 'classic', 'timeAttack', or 'challenge'
     * @returns {Object} Initial game state
     */
    static initialize(mode = 'classic') {
        // Create empty 6x6 grid
        const tiles = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
        
        // Add initial tiles
        const initialState = {
            tiles,
            score: 0,
            moves: 0,
            gameOver: false,
            mode,
            timeLeft: mode === 'timeAttack' ? 180 : null, // 3 minutes for time attack (longer for larger grid)
            goalReached: false,
            gridSize: GRID_SIZE,
            goalValue: GOAL_TILE
        };
        
        // Add two initial tiles
        return GameEngine.addRandomTile(GameEngine.addRandomTile(initialState));
    }
    
    /**
     * Add a random tile to the board (2 or 4)
     * @param {Object} state - Current game state
     * @returns {Object} Updated game state
     */
    static addRandomTile(state) {
        const { tiles } = state;
        const emptyPositions = [];
        
        // Find all empty positions
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (tiles[row][col] === 0) {
                    emptyPositions.push({ row, col });
                }
            }
        }
        
        // No empty spots, no new tile
        if (emptyPositions.length === 0) {
            return state;
        }
        
        // Select random empty position
        const { row, col } = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        
        // 90% chance of 2, 10% chance of 4
        const value = getRandomStartingValue();
        
        // Create a new tiles array with the added random tile
        const newTiles = tiles.map((rowArray, r) => 
            rowArray.map((cell, c) => 
                (r === row && c === col) ? value : cell
            )
        );
        
        // Check if we've reached the goal
        const goalReached = this.hasReachedGoal(newTiles);
        
        return { 
            ...state,
            tiles: newTiles,
            goalReached: goalReached || state.goalReached
        };
    }
    
    /**
     * Move tiles in the specified direction and merge when possible
     * @param {Object} state - Current game state
     * @param {string} direction - Direction to move: 'up', 'down', 'left', 'right'
     * @returns {Object} Updated game state
     */
    static move(state, direction) {
        const { tiles, score } = state;
        let newScore = score;
        let moved = false;
        
        // Create a deep copy of the tiles
        const newTiles = JSON.parse(JSON.stringify(tiles));
        
        // Process the move based on direction
        if (direction === 'up' || direction === 'down') {
            // Process each column
            for (let col = 0; col < GRID_SIZE; col++) {
                const column = [];
                for (let row = 0; row < GRID_SIZE; row++) {
                    column.push(newTiles[row][col]);
                }
                
                const result = this.processLine(column, direction === 'up');
                
                if (result.moved) {
                    moved = true;
                    newScore += result.scoreGain;
                    
                    // Update the column with processed values
                    for (let row = 0; row < GRID_SIZE; row++) {
                        newTiles[row][col] = result.line[row];
                    }
                }
            }
        } else {
            // Process each row
            for (let row = 0; row < GRID_SIZE; row++) {
                const result = this.processLine(newTiles[row], direction === 'left');
                
                if (result.moved) {
                    moved = true;
                    newScore += result.scoreGain;
                    newTiles[row] = result.line;
                }
            }
        }
        
        // If no tiles moved, return the original state
        if (!moved) {
            return state;
        }
        
        // Add a new random tile and update the state
        const newState = {
            ...state,
            tiles: newTiles,
            score: newScore,
            moves: state.moves + 1
        };
        
        // Check if goal has been reached
        const goalReached = this.hasReachedGoal(newTiles);
        
        // Add a random tile to the board
        return {
            ...GameEngine.addRandomTile(newState),
            goalReached: goalReached || state.goalReached
        };
    }
    
    /**
     * Process a line (row or column) for movement and merging
     * @param {Array} line - Line of tiles to process
     * @param {boolean} forward - Direction (true = left/up, false = right/down)
     * @returns {Object} Processed line, whether it moved, and score gain
     */
    static processLine(line, forward) {
        // Create a copy of the line to process
        const originalLine = [...line];
        
        // Remove zeros and compact the line
        let nonZeros = line.filter(cell => cell !== 0);
        let newLine = Array(GRID_SIZE).fill(0);
        let scoreGain = 0;
        let merged = []; // Track which tiles have been merged in this move
        
        if (forward) {
            // Process from left to right (or top to bottom)
            let outputIndex = 0;
            for (let i = 0; i < nonZeros.length; i++) {
                // If this value matches the next one and hasn't been merged yet
                if (i < nonZeros.length - 1 && nonZeros[i] === nonZeros[i+1] && !merged.includes(i)) {
                    // Merge - double the value
                    const doubledValue = nonZeros[i] * 2;
                    newLine[outputIndex] = doubledValue;
                    scoreGain += doubledValue; // Score from this merge
                    merged.push(i+1); // Mark the next index as merged
                    outputIndex++;
                    i++; // Skip the next tile since it's merged
                } else if (!merged.includes(i)) {
                    // Just move
                    newLine[outputIndex] = nonZeros[i];
                    outputIndex++;
                }
            }
        } else {
            // Process from right to left (or bottom to top)
            nonZeros = nonZeros.reverse();
            let outputIndex = GRID_SIZE - 1;
            
            for (let i = 0; i < nonZeros.length; i++) {
                // If this value matches the next one and hasn't been merged yet
                if (i < nonZeros.length - 1 && nonZeros[i] === nonZeros[i+1] && !merged.includes(i)) {
                    // Merge - double the value
                    const doubledValue = nonZeros[i] * 2;
                    newLine[outputIndex] = doubledValue;
                    scoreGain += doubledValue; // Score from this merge
                    merged.push(i+1); // Mark the next index as merged
                    outputIndex--;
                    i++; // Skip the next tile since it's merged
                } else if (!merged.includes(i)) {
                    // Just move
                    newLine[outputIndex] = nonZeros[i];
                    outputIndex--;
                }
            }
        }
        
        // Check if the line has changed
        const moved = !originalLine.every((val, idx) => val === newLine[idx]);
        
        return { line: newLine, moved, scoreGain };
    }
    
    /**
     * Check if the goal tile has been reached
     * @param {Array} tiles - The game board
     * @returns {boolean} Whether the goal tile has been reached
     */
    static hasReachedGoal(tiles) {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (tiles[row][col] >= GOAL_TILE) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Check if the game is over (no possible moves)
     * @param {Object} state - Current game state
     * @returns {boolean} Whether the game is over
     */
    static isGameOver(state) {
        const { tiles } = state;
        
        // Check for empty cells
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (tiles[row][col] === 0) {
                    return false; // There's still an empty cell
                }
            }
        }
        
        // Check for possible merges horizontally
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE - 1; col++) {
                if (tiles[row][col] === tiles[row][col+1]) {
                    return false; // There's a possible horizontal merge
                }
            }
        }
        
        // Check for possible merges vertically
        for (let row = 0; row < GRID_SIZE - 1; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (tiles[row][col] === tiles[row+1][col]) {
                    return false; // There's a possible vertical merge
                }
            }
        }
        
        // No empty cells and no possible merges
        return true;
    }
    
    /**
     * Get possible moves from current state
     * @param {Object} state - Current game state
     * @returns {Array} List of valid directions
     */
    static getPossibleMoves(state) {
        const directions = ['up', 'down', 'left', 'right'];
        return directions.filter(direction => {
            // Try the move and see if anything changes
            const nextState = this.move({...state}, direction);
            return !this.areTilesEqual(state.tiles, nextState.tiles);
        });
    }
    
    /**
     * Compare two tile grids for equality
     * @param {Array} tilesA - First tile grid
     * @param {Array} tilesB - Second tile grid
     * @returns {boolean} Whether the grids are equal
     */
    static areTilesEqual(tilesA, tilesB) {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (tilesA[row][col] !== tilesB[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    /**
     * Handle time attack mode tick
     * @param {Object} state - Current game state
     * @returns {Object} Updated game state
     */
    static updateTimeAttack(state) {
        if (state.mode !== 'timeAttack' || state.gameOver) {
            return state;
        }
        
        const newTimeLeft = state.timeLeft - 1;
        const gameOver = newTimeLeft <= 0;
        
        return {
            ...state,
            timeLeft: Math.max(0, newTimeLeft),
            gameOver
        };
    }
}