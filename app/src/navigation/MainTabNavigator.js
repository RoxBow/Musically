import React from 'react';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import { MaterialIcons } from '@expo/vector-icons';

import SongsScreen from '../screens/SongsScreen/SongsScreen';
import LyricsScreen from '../screens/LyricsScreen/LyricsScreen';

export const styleTabBarIcon = {
  marginBottom: -3
};

const SongsStack = createStackNavigator({
  Songs: {
    screen: SongsScreen,
    navigationOptions: ({ navigation }) => ({
      title: 'Songs'
    })
  }
});

SongsStack.navigationOptions = {
  tabBarLabel: 'Songs',
  tabBarIcon: ({ focused }) => (
    <MaterialIcons name="queue-music" size={25} style={styleTabBarIcon} color={ focused ? "#b50000" : "#000"} />
  )
};

const LyricsStack = createStackNavigator({
  Lyrics: {
    screen: LyricsScreen,
    navigationOptions: ({ navigation }) => ({
      title: 'Lyrics'
    })
  }
});

LyricsStack.navigationOptions = {
  tabBarLabel: 'Lyrics',
  tabBarIcon: ({ focused }) => (
    <MaterialIcons name="keyboard-voice" size={25} style={styleTabBarIcon} color={ focused ? "#b50000" : "#000"} />
  )
};

export default createBottomTabNavigator(
  {
    SongsStack,
    LyricsStack
  },
  {
    initialRouteName: 'SongsStack',
    tabBarOptions: {
      activeTintColor: '#e91e63',
      labelStyle: {
        fontSize: 14
      }
    }
  }
);
