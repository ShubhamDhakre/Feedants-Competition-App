import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../hooks/useAuth';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CompetitionDetailsScreen from '../screens/CompetitionDetailsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return null; // Splash screen could go here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CompetitionDetails" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CompetitionDetails" component={CompetitionDetailsScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
