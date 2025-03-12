import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

// Get the screen width for calculations
const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 24, 450);
const GRID_SIZE = 5;
const CELL_SIZE = (BOARD_SIZE - 12) / GRID_SIZE;
const CELL_PADDING = 3;
const TILE_SIZE = CELL_SIZE - (CELL_PADDING * 2);

const Tile = ({ tile, previousPosition, animationIndex = 0, batchSize = 1, delayStart = false }) => {
    // Ensure value is valid to prevent errors
    const tileValue = tile.value || 0;
    const isFirstRender = useRef(true);
    
    // Animation values
    const animatedValue = useRef(new Animated.Value(tile.isNew ? 0 : 1)).current;
    const animatedX = useRef(new Animated.Value(tile.col * CELL_SIZE)).current;
    const animatedY = useRef(new Animated.Value(tile.row * CELL_SIZE)).current;
    const animatedRotation = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(1)).current;
    const flashOpacity = useRef(new Animated.Value(0)).current;
    
    // Animation refs for cleanup
    const animTimers = useRef([]);
    
    // Handle animations when tile properties change
    useEffect(() => {
        // Clean up any pending timers
        animTimers.current.forEach(timer => clearTimeout(timer));
        animTimers.current = [];
        
        // Only animate position if this isn't the first render and there's a previous position
        if (!isFirstRender.current && previousPosition) {
            if (previousPosition.row !== tile.row || previousPosition.col !== tile.col) {
                // Calculate movement distance (helps determine animation timing)
                const rowDistance = Math.abs(previousPosition.row - tile.row);
                const colDistance = Math.abs(previousPosition.col - tile.col);
                const maxDistance = Math.max(rowDistance, colDistance);
                
                // First set to previous position instantly
                animatedX.setValue(previousPosition.col * CELL_SIZE);
                animatedY.setValue(previousPosition.row * CELL_SIZE);
                
                // Small stagger for large batch movements (1-5ms between tiles)
                const batchStagger = batchSize > 5 ? 
                    Math.min(animationIndex * 2, 10) : 0;
                
                // Calculate duration based on distance moved
                const baseDuration = 150;
                const distanceFactor = maxDistance > 2 ? 1.2 : 1;
                const finalDuration = baseDuration * distanceFactor;
                
                // Use requestAnimationFrame to avoid jank
                const timer = setTimeout(() => {
                    requestAnimationFrame(() => {
                        Animated.parallel([
                            Animated.timing(animatedX, {
                                toValue: tile.col * CELL_SIZE,
                                duration: finalDuration,
                                easing: Easing.out(Easing.cubic),
                                useNativeDriver: true,
                            }),
                            Animated.timing(animatedY, {
                                toValue: tile.row * CELL_SIZE,
                                duration: finalDuration,
                                easing: Easing.out(Easing.cubic),
                                useNativeDriver: true,
                            })
                        ]).start();
                    });
                }, batchStagger);
                
                animTimers.current.push(timer);
            } else {
                // Just set the position without animation for tiles that don't move
                animatedX.setValue(tile.col * CELL_SIZE);
                animatedY.setValue(tile.row * CELL_SIZE);
            }
        } else {
            // For first render, just set the position without animation
            animatedX.setValue(tile.col * CELL_SIZE);
            animatedY.setValue(tile.row * CELL_SIZE);
            isFirstRender.current = false;
        }
        
        // New tile appearance animation
        if (tile.isNew) {
            // Calculate proper delay based on whether this follows movement
            const appearanceDelay = tile.delayAppearance ? 150 : 50;
            
            // Delay appearance animation until after position is set
            const timer = setTimeout(() => {
                Animated.spring(animatedValue, {
                    toValue: 1,
                    friction: 6, // Higher friction for smoother appearance
                    tension: 150,
                    useNativeDriver: true,
                }).start();
            }, appearanceDelay);
            animTimers.current.push(timer);
        }
        
        // Enhanced merge animation (for merged tiles)
        if (tile.mergedFrom) {
            // Wait for movement to complete
            const timer = setTimeout(() => {
                // Parallel animations for more impact
                Animated.parallel([
                    // 1. Scale animation (more pronounced)
                    Animated.sequence([
                        Animated.timing(animatedValue, {
                            toValue: 1.2,  // Scale up larger
                            duration: 120,
                            easing: Easing.out(Easing.back(1.5)), // Bounce effect
                            useNativeDriver: true,
                        }),
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration: 100,
                            useNativeDriver: true,
                        })
                    ]),
                    
                    // 2. Flash/highlight effect
                    Animated.sequence([
                        Animated.timing(flashOpacity, {
                            toValue: 0.7,
                            duration: 80,
                            useNativeDriver: true,
                        }),
                        Animated.timing(flashOpacity, {
                            toValue: 0,
                            duration: 140,
                            useNativeDriver: true,
                        })
                    ]),
                    
                    // 3. Quick rotation animation
                    Animated.sequence([
                        Animated.timing(animatedRotation, {
                            toValue: 0.05, // Slight rotation (in radians)
                            duration: 60,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animatedRotation, {
                            toValue: -0.05,
                            duration: 60,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animatedRotation, {
                            toValue: 0,
                            duration: 60,
                            useNativeDriver: true,
                        })
                    ])
                ]).start();
            }, 30); // Short delay after movement
            
            animTimers.current.push(timer);
        }
        
        // Cleanup function for animation timers and other resources
        return () => {
            animTimers.current.forEach(timer => clearTimeout(timer));
        };
    }, [tile, previousPosition, animatedX, animatedY, animatedValue, animatedRotation, flashOpacity, animationIndex, batchSize]);

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

    // Transform animatedRotation value to actual rotation string
    const spin = animatedRotation.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-30deg', '30deg']
    });

    return (
        <Animated.View 
            style={[
                styles.tile,
                { 
                    backgroundColor: getBackgroundColor(),
                    transform: [
                        { translateX: animatedX },
                        { translateY: animatedY },
                        { scale: animatedValue },
                        { rotate: spin }
                    ],
                    // Better z-index based on multiple factors
                    zIndex: (
                        (tile.isNew ? 10 : 0) + 
                        (tile.mergedFrom ? 20 : 0) + 
                        (previousPosition ? 
                            Math.abs(previousPosition.row - tile.row) + 
                            Math.abs(previousPosition.col - tile.col) : 0)
                    )
                }
            ]}
        >
            {/* Flash overlay for merge effect */}
            <Animated.View 
                style={[
                    styles.flashOverlay,
                    { opacity: flashOpacity }
                ]}
            />
            
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
    flashOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        borderRadius: 4,
    }
});

export default Tile;