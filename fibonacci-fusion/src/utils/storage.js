// This file handles local storage operations, such as saving and retrieving game state and high scores.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@fibonacci_fusion';

export const saveGameState = async (state) => {
    try {
        const jsonValue = JSON.stringify(state);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
        console.error("Failed to save game state:", e);
    }
};

export const loadGameState = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error("Failed to load game state:", e);
    }
};

export const clearGameState = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error("Failed to clear game state:", e);
    }
};