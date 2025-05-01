import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
    Home: undefined;
    Profile: { name: string; borderColor: string };
  };
  
const RootStack = createStackNavigator<RootStackParamList>();

const Navigator = () => {
  return (
    <RootStack.Navigator initialRouteName="Home">
      <RootStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </RootStack.Navigator>
  );
};

export default Navigator;