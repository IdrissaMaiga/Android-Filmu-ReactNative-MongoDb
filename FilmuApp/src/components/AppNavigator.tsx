import React, { useEffect, useLayoutEffect } from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Orientation from 'react-native-orientation-locker';
import TabNavigator from '../navigators/TabNavigator';
import ChannelDetail from './screens/details/ChannelDetail';
import PortDetail from './screens/details/PortDetail';
import SerieDetail from './screens/details/SerieDetail';
import MovieDetail from './screens/details/MovieDetail';
import Login from './screens/auth/login';
import Register from './screens/auth/register';
import Profile from './screens/home/Profile';
import { useAuth } from '../hooks/useAuthContext';
import { getProfil } from '../function/auth';
export type RootStackParamList = {
  Login: undefined; // Login screen has no params
  Register: undefined; // Register screen has no params
  TabNavigator: undefined; // TabNavigator doesn't require params
  Profile: undefined; // Profile screen has no params
  ChannelDetail: { channelId: string }; // ChannelDetail screen expects channelId
  PortDetail: { portId: string; user: { username: string; password: string } };
  SerieDetail: { id: string ,tmdb:string}; // SerieDetail screen expects serieId
  MovieDetail: { id: string ,tmdb:string}; // MovieDetail screen expects movieId
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, setUser } = useAuth();

  useLayoutEffect(() => {
    const tryLogin = async () => {
      const data = await getProfil();
      if (data.success) {
        setUser(data.response);
      } else {
        setUser(null);
      }
    };
    tryLogin();
  }, [setUser]);

  useEffect(() => {
    const setOrientation = () => {
      const isTV = Platform.isTV;
      if (isTV) {
        Orientation.lockToLandscape();
      } else {
        Orientation.lockToPortrait();
      }
    };

    setOrientation();

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  // Determine the initial screen based on authentication state
  const initialRouteName = user ? 'TabNavigator' : 'Login';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ animation: 'slide_from_left' }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ChannelDetail"
        component={ChannelDetail}
        options={{ animation: 'slide_from_right' }}
      />
     {/*<Stack.Screen
        name="PortDetail"
        component={PortDetail}
        options={{ animation: 'slide_from_right' }}
      />*/}
      <Stack.Screen
        name="SerieDetail"
        component={SerieDetail}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MovieDetail"
        component={MovieDetail}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
