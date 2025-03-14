import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import { COLORS, FONTS, SPACING } from '../assets/styles/Typography';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const navigation = useNavigation();

    // Load settings when component mounts
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSound = await AsyncStorage.getItem('sound_enabled');
                const savedMusic = await AsyncStorage.getItem('music_enabled');
                
                if (savedSound !== null) {
                    setSoundEnabled(savedSound === 'true');
                }
                
                if (savedMusic !== null) {
                    setMusicEnabled(savedMusic === 'true');
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        };
        
        loadSettings();
    }, []);

    const toggleSound = async (value) => {
        setSoundEnabled(value);
        try {
            await AsyncStorage.setItem('sound_enabled', value.toString());
            // Here you would also trigger an action to enable/disable sound
            // For example: SoundManager.enableSoundEffects(value);
        } catch (error) {
            console.error('Failed to save sound setting:', error);
        }
    };

    const toggleMusic = async (value) => {
        setMusicEnabled(value);
        try {
            await AsyncStorage.setItem('music_enabled', value.toString());
            // Here you would also trigger an action to enable/disable music
            // For example: MusicManager.enableBackgroundMusic(value);
        } catch (error) {
            console.error('Failed to save music setting:', error);
        }
    };

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
            <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.BACKGROUND,
    },
    title: {
        ...FONTS.H1,
        marginBottom: SPACING.LARGE,
        color: COLORS.PRIMARY,
    },
    setting: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        marginVertical: SPACING.MEDIUM,
    },
    label: {
        ...FONTS.BODY,
        color: COLORS.TEXT,
    },
});

export default SettingsScreen;