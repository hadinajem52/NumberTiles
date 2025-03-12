import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Fibonacci Fusion</Text>
            <Button
                title="Start New Game"
                onPress={() => navigation.navigate('GameScreen')}
            />
            <Button
                title="Settings"
                onPress={() => navigation.navigate('SettingsScreen')}
            />
            <Button
                title="Leaderboard"
                onPress={() => navigation.navigate('LeaderboardScreen')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default HomeScreen;