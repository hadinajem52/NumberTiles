import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { getTopScores } from '../utils/storage';

const LeaderboardScreen = () => {
    const [scores, setScores] = React.useState([]);

    React.useEffect(() => {
        const fetchScores = async () => {
            const topScores = await getTopScores();
            setScores(topScores);
        };

        fetchScores();
    }, []);

    const renderScoreItem = ({ item }) => (
        <View style={styles.scoreItem}>
            <Text style={styles.playerName}>{item.player}</Text>
            <Text style={styles.playerScore}>{item.score}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Leaderboard</Text>
            <FlatList
                data={scores}
                renderItem={renderScoreItem}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
               marginBottom: 20,
        textAlign: 'center',
    },
    scoreItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    playerName: {
        fontSize: 18,
    },
    playerScore: {
        fontSize: 18,
           },
});

export default LeaderboardScreen;