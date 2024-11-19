import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from "./screens/HomeScreen";
import FormScreen from "./screens/FormScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: 'XML Form Generator', 
            headerStyle: { backgroundColor: '#F2F3F5' },
            headerTitleStyle: { 
              fontSize: 18, 
              fontWeight: '600', 
              color: '#1C1C1E',
            },
          }} 
        />
        <Stack.Screen 
          name="FormScreen" 
          component={FormScreen} 
          options={{ 
            title: 'Generated Form', 
            headerStyle: { backgroundColor: '#F2F3F5' },
            headerTitleStyle: { 
              fontSize: 18, 
              fontWeight: '600', 
              color: '#1C1C1E',
            },
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
