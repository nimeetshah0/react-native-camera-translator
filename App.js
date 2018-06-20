import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { Stack } from './Router';

export default class App extends React.Component {
  render() {
    return (
      <View style={{flex: 1}}>
        <StatusBar
          barStyle="light-content"
        />
        <Stack />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
