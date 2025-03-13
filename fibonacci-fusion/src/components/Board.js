import React, { useState, useRef, useEffect, useMemo } from 'react';
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

const Board = React.memo(({ tiles, tileList, previousPositions, onSwipe }) => {
    // Touch handling state
    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
    const prevTileListRef = useRef([]);
    
    // Memoize sorted tile list to prevent unnecessary resorting
    const sortedTileList = useMemo(() => {
        if (!tileList) return [];
        
        // Skip sorting if the tile list hasn't actually changed
        if (tileList === prevTileListRef.current) {
            return prevTileListRef.current;
        }
        
        // Create a copy of the tile list for sorting
        const sorted = [...tileList].sort((a, b) => {
            // First priority: tiles that will disappear should be rendered below
            if (a.willDisappear && !b.willDisappear) return -1;
            if (!a.willDisappear && b.willDisappear) return 1;
            
            // Second priority: freshly merged tiles should be on top
            if (a.justMerged && !b.justMerged) return 1;
            if (!a.justMerged && b.justMerged) return -1;
            
            // Final priority: higher value tiles should be on top (for consistent layering)
            return b.value - a.value;
        });
        
        prevTileListRef.current = sorted;
        return sorted;
    }, [tileList]);
    
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

    // Prepare animations flag with invalidation tracking
    const prepareAnimations = useRef(false);
    const animationsScheduled = useRef(false);
    
    // Track if this is the first render after receiving new tiles
    useEffect(() => {
        if (tileList && !animationsScheduled.current) {
            prepareAnimations.current = true;
            animationsScheduled.current = true;
            
            // Reset the animation scheduling flag after animations complete
            setTimeout(() => {
                animationsScheduled.current = false;
            }, 300); // Duration slightly longer than animations
        }
    }, [tileList]);

    // Memoize the grid background so it doesn't re-render unnecessarily
    const gridBackground = useMemo(() => {
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
    }, []);
    
    // Optimize tile rendering with memo
    const renderTiles = useMemo(() => {
        if (!sortedTileList.length) return null;
        
        const shouldPrepare = prepareAnimations.current;
        if (shouldPrepare) {
            setTimeout(() => {
                prepareAnimations.current = false;
            }, 20);
        }
        
        return sortedTileList.map((tile, index) => {
            const previousPosition = previousPositions ? 
                previousPositions.find(prev => prev.id === tile.id) : null;
                
            return (
                <Tile 
                    key={`tile-${tile.id}`}
                    tile={tile}
                    previousPosition={previousPosition}
                    animationIndex={index}
                    batchSize={sortedTileList.length}
                    delayStart={shouldPrepare}
                />
            );
        });
    }, [sortedTileList, previousPositions]);

    return (
        <View 
            style={styles.board}
            {...panResponder.panHandlers}
        >
            <View style={styles.background}>
                {gridBackground}
            </View>
            
            <View style={styles.tilesContainer}>
                {renderTiles}
            </View>
        </View>
    );
});

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