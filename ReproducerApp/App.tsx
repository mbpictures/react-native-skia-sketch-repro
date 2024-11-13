/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import {ToolbarProvider} from './drawing/context.tsx';
import {DrawBoard} from './drawing';
import {Toolbar} from './drawing/Toolbar.tsx';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <GestureHandlerRootView style={{flex: 1}}>
        <ToolbarProvider>
          <DrawBoard style={styles.canvas} />
          <View style={styles.controls}>
            <Toolbar />
          </View>
        </ToolbarProvider>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
  },
});

export default App;
