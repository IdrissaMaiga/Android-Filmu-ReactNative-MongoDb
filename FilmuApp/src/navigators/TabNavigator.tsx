import React, { useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import FIcon from 'react-native-vector-icons/FontAwesome';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomIcon from '../components/CustomIcon'; // Assuming CustomIcon is configured
import { useAuth } from '../hooks/useAuthContext'; // Assuming useAuthContext exists
import { useNavigation, NavigationProp } from "@react-navigation/native";
// Import Screens

import Series from '../components/screens/home/Series';
import Profile from '../components/screens/home/Profile';
import Movies from '../components/screens/home/Movies'; 
import Search from '../components/screens/home/Search';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChannelList from '../components/screens/home/ChannelList';

// Netflix-style colors
const COLORS = {
  primaryBlackRGBA: 'rgba(0, 0, 0, 0.9)',
  primaryRed: '#E50914',
  primaryGrey: '#B3B3B3',
};

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useAuth();
  type RootStackParamList = {
    Connexion: undefined;
    Inscription: undefined;
    TabNavigator: undefined;
    Login: undefined; // Add Login
    Register: undefined; // Add Register if need
  };

  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
 
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          navigation.navigate("Login");
        }
      } catch (error) {
        console.error("Error checking token", error);
      }
    };

    checkToken();
  }, []);
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarShowLabel: false, // No labels, only icons
        tabBarStyle: styles.tabBarStyle,
       // tabBarBackground: () =>
       //   Platform.OS === 'ios' || Platform.OS === 'android' ? (
       //     <BlurView blurAmount={15} style={styles.BlurViewStyles} />
       //   ) : null, // BlurView only for phones
      }}
    >
     
      <Tab.Screen
        name="Series"
        component={Series}
        options={{
          tabBarIcon: ({ focused }) => (
            <MIcon
              name="movie-roll"
              size={30}
              color={focused ? "#1E3A8A" : COLORS.primaryGrey}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Movies"
        component={Movies}
        options={{
          tabBarIcon: ({ focused }) => (
            <MIcon
              name="movie"
              size={30}
              color={focused ? "#1E3A8A" : COLORS.primaryGrey}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Channel"
        component={ChannelList}
        options={{
          tabBarIcon: ({ focused }) => (
            <MIcon
              name="video-wireless"
              size={30}
              color={focused ? "#1E3A8A" : COLORS.primaryGrey}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomIcon
              name="search"
              size={25}
              color={focused ? "#1E3A8A" : COLORS.primaryGrey}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <FIcon
              name="user"
              size={30}
              color={focused ? "#1E3A8A" : COLORS.primaryGrey}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 70, // Optimized for phones
    paddingTop:10,
    position: 'absolute',
    backgroundColor: COLORS.primaryBlackRGBA,
    borderTopWidth: 0,
    elevation: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: 'transparent',
  },
  BlurViewStyles: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default TabNavigator;
