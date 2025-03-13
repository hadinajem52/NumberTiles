/**
 * 2048-Style Game Engine with Larger Grid
 * Handles core game logic, board state, and calculations
 */

// Import the new utility functions
import { isPowerOfTwo, getNextPowerOfTwo, getRandomStartingValue } from '../utils/fibonacci';

// Constants
const GRID_SIZE = 5; // 5x5 grid
const GOAL_TILE = 8192; // Higher goal tile value

export class GameEngine {
    static nextTileId = 1;
    
    static initialize(mode = 'classic') {
        // Create empty 5x5 grid
        const tiles = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
        
        // Add initial tiles
        const initialState = {
            tiles,
            tileList: [], // List of tile objects for animation tracking
            score: 0,
            moves: 0,
            gameOver: false,
            mode,
            timeLeft: mode === 'timeAttack' ? 180 : null, // 3 minutes for time attack
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
     * @param {boolean} afterMove - Whether this is following a move animation
     * @returns {Object} Updated game state
     */
    static addRandomTile(state, afterMove = false) {
        const { tiles, tileList } = state;
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
        
        // Reset all existing tiles' animation flags
        const updatedTileList = tileList.map(tile => ({
            ...tile,
            isNew: false,
            mergedFrom: null,
            animationActive: false
        }));
        
        // Create a new tile object with unique ID for tracking animations
        const newTile = {
            id: GameEngine.nextTileId++,
            value,
            row,
            col,
            isNew: true,
            mergedFrom: null,
            animationActive: true,
            delayAppearance: afterMove // Added flag for delayed appearance
        };
        
        // Add the new tile to the tile list
        const newTileList = [...updatedTileList, newTile];
        
        // Check if we've reached the goal
        const goalReached = this.hasReachedGoal(newTiles);
        
        return { 
            ...state,
            tiles: newTiles,
            tileList: newTileList,
            goalReached: goalReached || state.goalReached,
            lastActionTime: Date.now() // Track when the last action occurred
        };
    }
    
    static move(state, direction) {
        const { tiles, tileList, score } = state;
        let newScore = score;
        let moved = false;
        
        // Save previous tile positions for animations
        const previousPositions = tileList.map(tile => ({...tile}));
        
        // Create a deep copy of the tiles
        const newTiles = JSON.parse(JSON.stringify(tiles));
        
        // Prepare a 2D array to track merges
        const mergedTiles = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
        
        // Track which tiles have been processed in this move
        const processedTiles = new Set();
        
        // Process the move based on direction
        if (direction === 'up' || direction === 'down') {
            // Process each column
            for (let col = 0; col < GRID_SIZE; col++) {
                const column = [];
                for (let row = 0; row < GRID_SIZE; row++) {
                    column.push(newTiles[row][col]);
                }
                
                const result = this.processLine(column, direction === 'up', tileList, col, mergedTiles, processedTiles);
                
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
                const result = this.processLine(newTiles[row], direction === 'left', tileList, row, mergedTiles, processedTiles, true);
                
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
        
        // Create updated tile list with new positions and merge information
        const updatedTileList = [];
        
        // First add non-merged tiles with their new positions
        for (const tile of tileList) {
            if (!processedTiles.has(tile.id)) {
                updatedTileList.push(tile);
            }
        }
        
        // Add merged tiles (with updated values)
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (mergedTiles[row][col]) {
                    updatedTileList.push(mergedTiles[row][col]);
                }
            }
        }
        
        // Add a new random tile and update the state
        const newState = {
            ...state,
            tiles: newTiles,
            tileList: updatedTileList,
            score: newScore,
            moves: state.moves + 1,
            previousPositions // Store previous positions for animations
        };
        
        // Check if goal has been reached
        const goalReached = this.hasReachedGoal(newTiles);
        
        // Add a random tile to the board with delayed appearance after movement
        return {
            ...GameEngine.addRandomTile(newState, true), // Pass true to indicate it follows a move
            goalReached: goalReached || state.goalReached
        };
    }
    

    static processLine(line, forward, tileList, lineIndex, mergedTiles, processedTiles, isRow = false) {
        // Create a copy of the line to process
        const originalLine = [...line];
        
        // Step 1: Extract non-zero values
        const values = line.filter(val => val !== 0);
        if (!forward) values.reverse();
        
        // Step 2: Process merges on the values
        const processed = [];
        let scoreGain = 0;
        let i = 0;
        
        while (i < values.length) {
            // If this value matches the next and we can merge them
            if (i < values.length - 1 && values[i] === values[i+1]) {
                // Merge - double the value
                const mergedValue = values[i] * 2;
                processed.push(mergedValue);
                scoreGain += mergedValue;
                i += 2; // Skip the next value since it's merged
            } else {
                // Just add the value
                processed.push(values[i]);
                i++;
            }
        }
        
        // Step 3: Create the new line with merged values
        let newLine = Array(GRID_SIZE).fill(0);
        for (let i = 0; i < processed.length; i++) {
            const index = forward ? i : GRID_SIZE - 1 - i;
            newLine[index] = processed[i];
        }
        
        // Step 4: Update tile positions and handle merges
        // Get tiles in this line
        const tilesInLine = tileList.filter(tile => 
            isRow ? tile.row === lineIndex : tile.col === lineIndex
        ).filter(tile => tile.value > 0);
        
        // Sort tiles based on position
        if (forward) {
            tilesInLine.sort((a, b) => (isRow ? a.col - b.col : a.row - b.row));
        } else {
            tilesInLine.sort((a, b) => (isRow ? b.col - a.col : b.row - a.row));
        }
        
        // Track which tiles need to be merged
        const tilesToMerge = [];
        let outputIndex = forward ? 0 : GRID_SIZE - 1;
        const indexChange = forward ? 1 : -1;
        
        // Loop through the original tiles and update their positions
        for (let i = 0; i < tilesInLine.length; i++) {
            if (processedTiles.has(tilesInLine[i].id)) continue;
            
            const tile = tilesInLine[i];
            
            // Check if this tile is going to merge with the next one
            if (i < tilesInLine.length - 1 && 
                tile.value === tilesInLine[i+1].value &&
                !processedTiles.has(tilesInLine[i+1].id)) {
                
                // Create a merged tile with more detailed merge info
                const mergedValue = tile.value * 2;
                const mergedTileRow = isRow ? lineIndex : outputIndex;
                const mergedTileCol = isRow ? outputIndex : lineIndex;
                
                const mergedTile = {
                    id: GameEngine.nextTileId++,
                    value: mergedValue,
                    row: mergedTileRow,
                    col: mergedTileCol,
                    mergedFrom: [tile.id, tilesInLine[i+1].id],
                    // Add properties to track which tiles were merged
                    mergedFromValues: [tile.value, tilesInLine[i+1].value],
                    justMerged: true  // Flag to indicate this is a fresh merge
                };
                
                // Add to merged tiles array
                mergedTiles[mergedTileRow][mergedTileCol] = mergedTile;
                
                // Mark these tiles as "will disappear" for smooth animation
                tile.willDisappear = true;
                tilesInLine[i+1].willDisappear = true;
                tile.targetTileId = mergedTile.id;
                tilesInLine[i+1].targetTileId = mergedTile.id;
                // Add these lines to store target position
                tile.targetRow = mergedTileRow;
                tile.targetCol = mergedTileCol;
                tilesInLine[i+1].targetRow = mergedTileRow;
                tilesInLine[i+1].targetCol = mergedTileCol;
                
                // Mark both tiles as processed
                processedTiles.add(tile.id);
                processedTiles.add(tilesInLine[i+1].id);
                
                // Skip the next tile
                i++;
            } else {
                // Just update this tile's position
                if (isRow) {
                    tile.col = outputIndex;
                } else {
                    tile.row = outputIndex;
                }
            }
            
            outputIndex += indexChange;
        }
        
        // Check if the line has changed
        const moved = !originalLine.every((val, idx) => val === newLine[idx]);
        
        return { line: newLine, moved, scoreGain };
    }
    
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

    static getPossibleMoves(state) {
        const directions = ['up', 'down', 'left', 'right'];
        return directions.filter(direction => {
            // Try the move and see if anything changes
            const nextState = this.move({...state}, direction);
            return !this.areTilesEqual(state.tiles, nextState.tiles);
        });
    }
    
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