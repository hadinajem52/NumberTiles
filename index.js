import 'react-native-gesture-handler';  // Add this at the top

import { registerRootComponent } from 'expo';

import App from './fibonacci-fusion/src/App.js';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
