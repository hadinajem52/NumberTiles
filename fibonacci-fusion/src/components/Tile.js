import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const Tile = ({ value, position }) => {
    // Ensure value is valid to prevent errors
    const tileValue = value || 0;
    const animatedValue = useRef(new Animated.Value(0)).current;
    
    // Animation effect when tile appears
    useEffect(() => {
        try {
            Animated.spring(animatedValue, {
                toValue: 1,
                friction: 5,
                tension: 100,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            console.error("Animation error:", error);
        }
    }, []);
    
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
        try {
            const darkBackgrounds = [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384];
            return tileValue >= 8 ? '#ffffff' : '#776e65';
        } catch (error) {
            console.error("Text color error:", error);
            return '#776e65'; // Default text color on error
        }
    };
    
    // Adjust font size based on value length
    const getFontSize = () => {
        try {
            if (tileValue >= 10000) return 18;
            if (tileValue >= 1000) return 20;
            if (tileValue >= 100) return 24;
            if (tileValue >= 10) return 28;
            return 32;
        } catch (error) {
            console.error("Font size error:", error);
            return 24; // Default size on error
        }
    };

    return (
        <Animated.View 
            style={[
                styles.tile,
                { 
                    backgroundColor: getBackgroundColor(),
                    transform: [{ scale: animatedValue }]
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
        width: '100%',
        height: '100%',
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