import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/hooks/useAuthContext';
import AppNavigator from './src/components/AppNavigator';
import SplashScreen from 'react-native-splash-screen'; // Import splash screen

const App = () => {
  useEffect(() => {
    // Hide the splash screen after the app is loaded
    SplashScreen.hide(); 
  }, []); // Empty dependency array ensures this runs once when the app loads

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
