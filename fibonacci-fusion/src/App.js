import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import SettingsScreen from './screens/SettingsScreen';

// Define a complete custom theme with all required properties
const AppTheme = {
  dark: false,
  colors: {
    primary: '#ffa64d',
    background: '#f0f0f0',
    card: '#ffffff',
    text: '#333333',
    border: '#d0d0d0',
    notification: '#ff4d4d',
  },
  // Updated fonts configuration to use Nunito fonts
  fonts: {
    regular: 'Nunito-Regular',
    medium: 'Nunito-Medium',
    bold: 'Nunito-Bold',
  }
};

const Stack = createStackNavigator();

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Nunito-Regular': require('./fonts/Nunito-Regular.ttf'),
          'Nunito-Medium': require('./fonts/Nunito-Medium.ttf'),
          'Nunito-Bold': require('./fonts/Nunito-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };
    
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c8a165" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#c8a165" />
      <NavigationContainer
        theme={AppTheme}
        fallback={<View style={styles.fallback} />}
      >
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#c8a165',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                           fontFamily: 'Nunito-Bold',
            },
            cardStyle: { backgroundColor: '#f0f0f0' }
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Home' }}
          />
          <Stack.Screen 
            name="Game" 
            component={GameScreen} 
            options={({ route }) => ({ 
              title: `${route.params?.mode ? 
                route.params.mode.charAt(0).toUpperCase() + route.params.mode.slice(1) : 
                'Classic'} Game` 
            })}
          />
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen} 
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    fontFamily: 'Nunito-Regular', // Set default font for the app
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  }
});

export default App;