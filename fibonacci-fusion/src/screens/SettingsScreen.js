import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Button } from '../components/Button';
import { theme } from '../assets/styles/theme';

const SettingsScreen = () => {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);

    const toggleSound = () => setSoundEnabled(previousState => !previousState);
    const toggleMusic = () => setMusicEnabled(previousState => !previousState);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.setting}>
                <Text style={styles.label}>Sound Effects</Text>
                <Switch
                    value={soundEnabled}
                    onValueChange={toggleSound}
                />
            </View>
            <View style={styles.setting}>
                <Text style={styles.label}>Background Music</Text>
                <Switch
                    value={musicEnabled}
                    onValueChange={toggleMusic}
                />
            </View>
            <Button title="Back to Home" onPress={() => {/* Navigate back to Home */}} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.backgroundColor,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        color: theme.primaryColor,
    },
    setting: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        marginVertical: 10,
    },
    label: {
        fontSize: 18,
        color: theme.textColor,
    },
});

export default SettingsScreen;