import React, { useEffect, useRef, memo, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { Typography, Colors, getTileTextSize } from '../assets/styles/Typography';

// Get the screen width for calculations
const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 24, 450);
const GRID_SIZE = 5;
const CELL_SIZE = (BOARD_SIZE - 12) / GRID_SIZE;
const CELL_PADDING = 3;
const TILE_SIZE = CELL_SIZE - (CELL_PADDING * 2);

// Memoized color getter functions to avoid recalculating on every render
const getTileBackgroundColor = (value) => {
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
    return colors[value] || '#6d597a'; // Default purple for very large numbers
};

const getTileTextColor = (value) => {
    return value >= 8 ? '#ffffff' : '#776e65';
};

const getTileFontSize = (value) => {
    return getTileTextSize(value);
};

// Calculate position for a tile
const calculatePosition = (row, col) => ({
    x: col * CELL_SIZE + CELL_PADDING,
    y: row * CELL_SIZE + CELL_PADDING
});

const Tile = memo(({ 
    tile, 
    previousPosition, 
    animationIndex = 0, 
    batchSize = 1, 
    delayStart = false,
    animationBatch
}) => {
    // Ensure value is valid to prevent errors
    const tileValue = tile.value || 0;
    const isFirstRender = useRef(true);
    
    // Pre-calculate styles that don't change during animations
    const textColor = getTileTextColor(tileValue);
    const fontSize = getTileFontSize(tileValue);
    const backgroundColor = getTileBackgroundColor(tileValue);
    
    // Animation values
    const animatedValue = useRef(new Animated.Value(tile.isNew ? 0 : 1)).current;
    const animatedX = useRef(new Animated.Value(tile.col * CELL_SIZE + CELL_PADDING)).current;
    const animatedY = useRef(new Animated.Value(tile.row * CELL_SIZE + CELL_PADDING)).current;
    const animatedRotation = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(1)).current;
    const flashOpacity = useRef(new Animated.Value(0)).current;
    const mergeAnimationProgress = useRef(new Animated.Value(0)).current; // Track merge animation state
    
    // Animation controllers for proper cleanup
    const animControllers = useRef([]);
    const animTimers = useRef([]);
    
    // Animation cleanup utility
    const cleanupAnimations = useCallback(() => {
        // Clear timers
        animTimers.current.forEach(timer => clearTimeout(timer));
        animTimers.current = [];
        
        // Stop animations
        animControllers.current.forEach(controller => {
            if (controller && controller.stop) {
                controller.stop();
            }
        });
        animControllers.current = [];
    }, []);
    
    // Handle animations when tile properties change
    useEffect(() => {
        // Clean up any pending animations before starting new ones
        cleanupAnimations();
        
        // Calculate animation timing based on batch information
        const getAnimationDuration = (baseTime) => {
            const batchFactor = animationBatch?.size > 8 ? 1.1 : 1;
            const distanceFactor = animationBatch?.maxDistance > 2 ? 1.1 : 1;
            return Math.round(baseTime * batchFactor * distanceFactor);
        };
        
        // Only animate position if this isn't the first render and there's a previous position
        if (!isFirstRender.current && previousPosition) {
            if (previousPosition.row !== tile.row || previousPosition.col !== tile.col) {
                // Calculate movement distance (helps determine animation timing)
                const rowDistance = Math.abs(previousPosition.row - tile.row);
                const colDistance = Math.abs(previousPosition.col - tile.col);
                const maxDistance = Math.max(rowDistance, colDistance);
                
                // First set to previous position instantly
                animatedX.setValue(previousPosition.col * CELL_SIZE + CELL_PADDING);
                animatedY.setValue(previousPosition.row * CELL_SIZE + CELL_PADDING);
                
                // Calculate stagger based on batch size and animation index
                // Smaller stagger reduces overall animation time while still providing visual sequence
                const staggerAmount = animationBatch?.size > 8 ? 
                    Math.min(1.5 * animationIndex, 12) : 
                    Math.min(animationIndex, 5);
                
                // Calculate duration based on distance moved
                const baseDuration = 150;
                const distanceFactor = maxDistance > 2 ? 1.2 : 1;
                const finalDuration = Math.round(baseDuration * distanceFactor);
                
                const timer = setTimeout(() => {
                    if (tile.willDisappear) {
                        // Handle disappearing tiles (merging into another)
                        const { targetRow, targetCol } = tile;
                        const targetPos = calculatePosition(targetRow, targetCol);
                        
                        // Calculate precise animation duration based on distance
                        const distance = Math.sqrt(
                            Math.pow(targetCol - (previousPosition?.col || tile.col), 2) +
                            Math.pow(targetRow - (previousPosition?.row || tile.row), 2)
                        );
                        
                        const moveDuration = Math.min(350, Math.max(200, distance * 100));
                        
                        // Use parallel animation instead of sequence for better performance
                        const moveAndShrink = Animated.parallel([
                            // X position
                            Animated.timing(animatedX, {
                                toValue: targetPos.x,
                                duration: moveDuration,
                                easing: Easing.out(Easing.cubic),
                                useNativeDriver: true,
                            }),
                            // Y position
                            Animated.timing(animatedY, {
                                toValue: targetPos.y,
                                duration: moveDuration,
                                easing: Easing.out(Easing.cubic),
                                useNativeDriver: true,
                            }),
                            // Slight shrink as it approaches
                            Animated.timing(animatedValue, {
                                toValue: 0.85,
                                duration: moveDuration,
                                easing: Easing.out(Easing.cubic),
                                useNativeDriver: true,
                            })
                        ]);
                        
                        const fadeOut = Animated.timing(animatedOpacity, {
                            toValue: 0,
                            duration: 150,
                            easing: Easing.out(Easing.cubic),
                            useNativeDriver: true,
                        });
                        
                        // Use sequence for these specific animations
                        const controller = Animated.sequence([
                            moveAndShrink,
                            fadeOut
                        ]);
                        
                        controller.start();
                        animControllers.current.push(controller);
                    } else if (tile.mergedFrom) {
                        // This is the resulting merged tile that appears after merger
                        animatedX.setValue(tile.col * CELL_SIZE + CELL_PADDING);
                        animatedY.setValue(tile.row * CELL_SIZE + CELL_PADDING);
                        
                        // Re-use the existing flash and scale animations but with optimized timing
                        const mergeTimer = setTimeout(() => {
                            // Create a single animation group for better performance
                            const mergeAnimation = Animated.parallel([
                                // Scale animation with spring for natural feel
                                Animated.sequence([
                                    Animated.timing(animatedValue, {
                                        toValue: 0.8,
                                        duration: 0,
                                        useNativeDriver: true,
                                    }),
                                    Animated.spring(animatedValue, {
                                        toValue: 1.2,
                                        friction: 5,
                                        tension: 160,
                                        useNativeDriver: true,
                                    }),
                                    Animated.spring(animatedValue, {
                                        toValue: 1,
                                        friction: 5,
                                        tension: 140,
                                        useNativeDriver: true,
                                    })
                                ]),
                                
                                // Flash effect with optimized timing
                                Animated.sequence([
                                    Animated.timing(flashOpacity, {
                                        toValue: 0.6,
                                        duration: 100,
                                        useNativeDriver: true,
                                    }),
                                    Animated.timing(flashOpacity, {
                                        toValue: 0,
                                        duration: 200,
                                        easing: Easing.out(Easing.cubic),
                                        useNativeDriver: true,
                                    })
                                ]),
                                
                                // Track merge progress for UI effects
                                Animated.timing(mergeAnimationProgress, {
                                    toValue: 1,
                                    duration: 300,
                                    useNativeDriver: true,
                                })
                            ]);
                            
                            mergeAnimation.start();
                            animControllers.current.push(mergeAnimation);
                        }, 50); // Reduced delay for better responsiveness
                        
                        animTimers.current.push(mergeTimer);
                    } else {
                        // Normal movement animation with optimized timing
                        const newPos = calculatePosition(tile.row, tile.col);
                        
                        // Use a single animation controller for both X and Y
                        const moveAnimation = Animated.parallel([
                            Animated.timing(animatedX, {
                                toValue: newPos.x,
                                duration: finalDuration,
                                easing: Easing.out(Easing.cubic),
                                useNativeDriver: true,
                            }),
                            Animated.timing(animatedY, {
                                toValue: newPos.y,
                                duration: finalDuration,
                                easing: Easing.out(Easing.cubic),
                                useNativeDriver: true,
                            })
                        ]);
                        
                        moveAnimation.start();
                        animControllers.current.push(moveAnimation);
                    }
                }, staggerAmount);
                
                animTimers.current.push(timer);
            } else {
                // Just set the position without animation for tiles that don't move
                const newPos = calculatePosition(tile.row, tile.col);
                animatedX.setValue(newPos.x);
                animatedY.setValue(newPos.y);
            }
        } else {
            // For first render, just set the position without animation
            const newPos = calculatePosition(tile.row, tile.col);
            animatedX.setValue(newPos.x);
            animatedY.setValue(newPos.y);
            isFirstRender.current = false;
        }
        
        // New tile appearance animation
        if (tile.isNew) {
            // Calculate proper delay based on whether this follows movement
            const appearanceDelay = tile.delayAppearance ? 120 : 30;
            
            const timer = setTimeout(() => {
                // Alternative with subtle pop but no glitching
                const appearAnimation = Animated.sequence([
                    // First grow to exactly 1.0
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 120,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    // Small pause
                    Animated.delay(10),
                    // Very slight bounce (optional)
                    Animated.timing(animatedValue, {
                        toValue: 1.02,
                        duration: 40,
                        useNativeDriver: true,
                    }),
                    // Settle back to 1.0
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 40,
                        useNativeDriver: true,
                    })
                ]);
                
                appearAnimation.start();
                animControllers.current.push(appearAnimation);
            }, appearanceDelay);
            
            animTimers.current.push(timer);
        }
        
        // Enhanced merge animation (for merged tiles)
        if (tile.mergedFrom) {
            // Wait for movement to complete
            const timer = setTimeout(() => {
                // Combine animations for better performance
                const mergeEffects = Animated.parallel([
                    // Scale and rotation animations
                    Animated.sequence([
                        Animated.timing(animatedRotation, {
                            toValue: 0.05,
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
                ]);
                
                mergeEffects.start();
                animControllers.current.push(mergeEffects);
            }, 30);
            
            animTimers.current.push(timer);
        }
        
        // Cleanup function
        return cleanupAnimations;
    }, [
        tile, 
        previousPosition, 
        animatedX, 
        animatedY, 
        animatedValue, 
        animatedRotation,
        flashOpacity, 
        animationIndex, 
        batchSize, 
        animatedOpacity, 
        mergeAnimationProgress,
        cleanupAnimations,
        animationBatch
    ]);

    // Transform animatedRotation value to actual rotation string
    const spin = animatedRotation.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-30deg', '30deg']
    });
    
    // Create shadow effect that intensifies during merge
    const shadowOpacity = mergeAnimationProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.15, 0.3]
    });
    
    // Create elevation effect that increases during merge
    const elevation = mergeAnimationProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [3, 8]
    });

    // Calculate zIndex only once per render
    const tileZIndex = (
        (tile.isNew ? 15 : 0) + 
        (tile.mergedFrom ? 40 : 0) +
        (tile.willDisappear ? -5 : 0) +
        (tile.value || 0)
    );

    return (
        <Animated.View 
            style={[
                styles.tile,
                { 
                    backgroundColor: backgroundColor,
                    transform: [
                        { translateX: animatedX },
                        { translateY: animatedY },
                        { scale: animatedValue },
                        { rotate: spin }
                    ],
                    opacity: animatedOpacity,
                    zIndex: tileZIndex,
                    shadowOpacity: shadowOpacity,
                    elevation: elevation,
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
                    color: textColor,
                    fontSize: fontSize,
                }
            ]}>
                {tileValue}
            </Text>
        </Animated.View>
    );
});

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
            height: 2,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        backfaceVisibility: 'hidden',
        elevation: 3,
    },
    value: {
        fontWeight: 'bold',
        fontFamily: Typography.tileNumber.base.fontFamily,
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