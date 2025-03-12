import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Tile from './Tile';

// Get the screen width to create a responsive but square board
const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 24, 450); // Max size of 450, with less padding for larger grid
const SWIPE_THRESHOLD = 50; // Minimum distance to recognize as swipe
const GRID_SIZE = 6; // Updated grid size to 6x6

const Board = ({ tiles, onSwipe }) => {
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

    // Render the 6x6 grid of tiles
    const renderGrid = () => {
        const rows = [];
        
        for (let row = 0; row < GRID_SIZE; row++) {
            const cols = [];
            
            for (let col = 0; col < GRID_SIZE; col++) {
                cols.push(
                    <View key={`cell-${row}-${col}`} style={styles.cell}>
                        {tiles[row][col] > 0 && (
                            <Tile 
                                value={tiles[row][col]} 
                                position={{ row, col }}
                            />
                        )}
                    </View>
                );
            }
            
            rows.push(
                <View key={`row-${row}`} style={styles.row}>
                    {cols}
                </View>
            );
        }
        
        return rows;
    };

    return (
        <View 
            style={styles.board}
            {...panResponder.panHandlers}
        >
            <View style={styles.background}>
                {/* Background grid cells */}
                {[...Array(GRID_SIZE)].map((_, row) => (
                    <View key={`bg-row-${row}`} style={styles.row}>
                        {[...Array(GRID_SIZE)].map((_, col) => (
                            <View key={`bg-cell-${row}-${col}`} style={styles.backgroundCell} />
                        ))}
                    </View>
                ))}
            </View>
            
            <View style={styles.tilesContainer}>
                {renderGrid()}
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
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 6,
        left: 6,
    },
    row: {
        flexDirection: 'row',
        height: `${100/GRID_SIZE}%`, // Evenly divided rows based on grid size
    },
    cell: {
        width: `${100/GRID_SIZE}%`, // Evenly divided columns based on grid size
        height: '100%',
        padding: 3, // Smaller padding for larger grid
        position: 'relative',
    },
    backgroundCell: {
        flex: 1,
        margin: 3,
        backgroundColor: 'rgba(238, 228, 218, 0.35)', // Light background for empty cells
        borderRadius: 4,
    }
});

export default Board;