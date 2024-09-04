import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import Maizen from './src/Maizen';
import Kaizen from './src/Kaizen';

const Tab = createMaterialTopTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Maizen"
        screenOptions={{
          tabBarStyle: {display: 'none'}, // Hides the tab bar
          swipeEnabled: true, // Enables swipe gesture
        }}>
        <Tab.Screen name="Maizen" component={Maizen} />
        <Tab.Screen name="Kaizen" component={Kaizen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
