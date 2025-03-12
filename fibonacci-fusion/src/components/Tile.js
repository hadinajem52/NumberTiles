import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

// Get the screen width for calculations
const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 24, 450);
const GRID_SIZE = 6;
const CELL_SIZE = (BOARD_SIZE - 12) / GRID_SIZE;
const CELL_PADDING = 3;
const TILE_SIZE = CELL_SIZE - (CELL_PADDING * 2);

const Tile = ({ tile, previousPosition }) => {
    // Ensure value is valid to prevent errors
    const tileValue = tile.value || 0;
    const isFirstRender = useRef(true);
    
    // Animation values
    const animatedValue = useRef(new Animated.Value(tile.isNew ? 0 : 1)).current;
    const animatedX = useRef(new Animated.Value(tile.col * CELL_SIZE)).current;
    const animatedY = useRef(new Animated.Value(tile.row * CELL_SIZE)).current;
    
    // Handle animations when tile properties change
    useEffect(() => {
        // Only animate position if this isn't the first render and there's a previous position
        if (!isFirstRender.current && previousPosition) {
            if (previousPosition.row !== tile.row || previousPosition.col !== tile.col) {
                // First set to previous position without animation (if moving from a previous position)
                animatedX.setValue(previousPosition.col * CELL_SIZE);
                animatedY.setValue(previousPosition.row * CELL_SIZE);
                
                // Then animate to new position
                Animated.timing(animatedX, {
                    toValue: tile.col * CELL_SIZE,
                    duration: 150,
                    useNativeDriver: true,
                }).start();
                
                Animated.timing(animatedY, {
                    toValue: tile.row * CELL_SIZE,
                    duration: 150,
                    useNativeDriver: true,
                }).start();
            }
        } else {
            // For first render, just set the position without animation
            animatedX.setValue(tile.col * CELL_SIZE);
            animatedY.setValue(tile.row * CELL_SIZE);
            isFirstRender.current = false;
        }
        
        // Handle appearance animations
        const animations = [];
        
        // New tile appearance animation
        if (tile.isNew) {
            // Delay the appearance animation slightly to prevent glitches
            setTimeout(() => {
                Animated.spring(animatedValue, {
                    toValue: 1,
                    friction: 5,
                    tension: 100,
                    useNativeDriver: true,
                }).start();
            }, 50);
        }
        
        // Merge animation (for merged tiles)
        if (tile.mergedFrom) {
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1.2,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [tile, previousPosition]);
    
    // Get appropriate background color based on tile value (2048 colors)
    const getBackgroundColor = () => {
        // Color map for 2048-style game
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
        return colors[tileValue] || '#6d597a'; // Default purple for very large numbers
    };
    
    // Get text color (white for darker tiles, dark for lighter tiles)
    const getTextColor = () => {
        return tileValue >= 8 ? '#ffffff' : '#776e65';
    };
    
    // Adjust font size based on value length
    const getFontSize = () => {
        if (tileValue >= 10000) return 18;
        if (tileValue >= 1000) return 20;
        if (tileValue >= 100) return 24;
        if (tileValue >= 10) return 28;
        return 32;
    };

    return (
        <Animated.View 
            style={[
                styles.tile,
                { 
                    backgroundColor: getBackgroundColor(),
                    transform: [
                        { translateX: animatedX },
                        { translateY: animatedY },
                        { scale: animatedValue }
                    ]
                }
            ]}
        >
            <Text style={[
                styles.value, 
                { 
                    color: getTextColor(),
                    fontSize: getFontSize()
                }
            ]}>
                {tileValue}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    tile: {
        position: 'absolute',
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        // Shadow for Android
        elevation: 3,
    },
    value: {
        fontWeight: 'bold',
    },
});

export default Tile;