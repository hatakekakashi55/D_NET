import { AppRegistry, Platform } from 'react-native';
import App from './App';

AppRegistry.registerComponent('DreamNet', () => App);
AppRegistry.registerComponent('DNet', () => App);
AppRegistry.registerComponent('D-NET', () => App);
AppRegistry.registerComponent('main', () => App);

if (Platform.OS === 'web') {
  AppRegistry.runApplication('DreamNet', {
    initialProps: {},
    rootTag: document.getElementById('root'),
  });
}
