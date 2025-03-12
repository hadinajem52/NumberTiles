import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class ScoreBoard extends React.Component {
    render() {
        const { score } = this.props;

        return (
            <View style={styles.container}>
                <Text style={styles.scoreText}>Score: {score}</Text>
            </View>
        );
    }
}

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
});

export default ScoreBoard;