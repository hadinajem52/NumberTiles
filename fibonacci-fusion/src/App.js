import React from 'react';
import { SafeAreaView, StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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
  // Add this fonts configuration
  fonts: {
    regular: 'Arial',
    bold: 'Arial-BoldMT',
  }
};

const Stack = createStackNavigator();

const App = () => {
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
              fontWeight: 'bold',
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
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  }
});

export default App;