import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const ScoreBoard = ({ score }) => {
    const prevScore = useRef(score);
    const scoreAnimation = useRef(new Animated.Value(1)).current;
    
    useEffect(() => {
        // Animate score when it changes
        if (score > prevScore.current) {
            scoreAnimation.setValue(1.2);
            Animated.spring(scoreAnimation, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true
            }).start();
        }
        prevScore.current = score;
    }, [score, scoreAnimation]);
    
    return (
        <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Animated.Text 
                style={[
                    styles.scoreValue,
                    { transform: [{ scale: scoreAnimation }] }
                ]}
            >
                {score}
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    scoreContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 18,
        color: '#666',
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default ScoreBoard;