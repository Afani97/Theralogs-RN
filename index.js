/**
 * @format
 */

import {AppRegistry} from 'react-native';
import AudioRecord from 'react-native-audio-record';

import App from './Components/App';

AudioRecord.on('data', data => {
    // base64-encoded audio data chunks
});
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

