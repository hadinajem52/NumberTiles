import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Tile from './Tile';

// Get the screen width to create a responsive but square board
const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 24, 450); // Max size of 450
const SWIPE_THRESHOLD = 50; // Minimum distance to recognize as swipe
const GRID_SIZE = 5; // 5x5 grid
const CELL_SIZE = (BOARD_SIZE - 12) / GRID_SIZE;
const CELL_MARGIN = 3;
const CELL_INNER_SIZE = CELL_SIZE - (CELL_MARGIN * 2); // Exact size of cells

const Board = ({ tiles, tileList, previousPositions, onSwipe }) => {
    // Touch handling state
    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
    
    // Create PanResponder for swipe detection
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const { pageX, pageY } = evt.nativeEvent;
                setTouchStart({ x: pageX, y: pageY });
            },
            onPanResponderRelease: (evt, gestureState) => {
                const { dx, dy } = gestureState;
                
                // Determine direction based on the distance moved
                if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
                    return; // Not a significant swipe
                }
                
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal swipe
                    onSwipe(dx > 0 ? 'right' : 'left');
                } else {
                    // Vertical swipe
                    onSwipe(dy > 0 ? 'down' : 'up');
                }
            }
        })
    ).current;

    // Add this before renderTiles function
    const prepareAnimations = useRef(false);

    // Render the 5x5 grid background with precise positioning
    const renderGridBackground = () => {
        const rows = [];
        
        for (let row = 0; row < GRID_SIZE; row++) {
            const cols = [];
            
            for (let col = 0; col < GRID_SIZE; col++) {
                cols.push(
                    <View 
                        key={`bg-cell-${row}-${col}`} 
                        style={[
                            styles.backgroundCell,
                            {
                                width: CELL_INNER_SIZE,
                                height: CELL_INNER_SIZE,
                                marginHorizontal: CELL_MARGIN,
                                marginVertical: CELL_MARGIN,
                            }
                        ]} 
                    />
                );
            }
            
            rows.push(
                <View key={`bg-row-${row}`} style={styles.row}>
                    {cols}
                </View>
            );
        }
        
        return rows;
    };
    
    // Modify renderTiles to handle batched animations
    const renderTiles = () => {
        if (!tileList) return null;
        
        // On first render after movement, prepare animations but don't start them yet
        const shouldPrepare = prepareAnimations.current;
        
        setTimeout(() => {
            prepareAnimations.current = false;
        }, 20);
        
        return tileList.map((tile, index) => {
            // Find previous position for animation
            const previousPosition = previousPositions ? 
                previousPositions.find(prev => prev.id === tile.id) : null;
                
            return (
                <Tile 
                    key={`tile-${tile.id}`}
                    tile={tile}
                    previousPosition={previousPosition}
                    animationIndex={index}
                    batchSize={tileList.length}
                    delayStart={shouldPrepare}
                />
            );
        });
    };

    return (
        <View 
            style={styles.board}
            {...panResponder.panHandlers}
        >
            <View style={styles.background}>
                {renderGridBackground()}
            </View>
            
            <View style={styles.tilesContainer}>
                {renderTiles()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    board: {
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        borderRadius: 8,
        backgroundColor: '#bbada0',
        padding: 6, // Less padding for larger grid
        position: 'relative',
    },
    background: {
        position: 'absolute',
        top: 6,
        left: 6,
        right: 6,
        bottom: 6,
    },
    tilesContainer: {
        position: 'absolute',
        top: 6,
        left: 6,
        right: 6,
        bottom: 6,
    },
    row: {
        flexDirection: 'row',
        height: CELL_SIZE, // Exact height instead of percentage
        justifyContent: 'center',
    },
    backgroundCell: {
        // No flex, using exact sizes instead
        backgroundColor: 'rgba(238, 228, 218, 0.35)', 
        borderRadius: 4,
    }
});

export default Board;