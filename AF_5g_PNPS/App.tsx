import React, { useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import ChatScreen from './ChatScreen';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import * as CryptoModule from './HybridCryptoModule'; // Task 등록 함수를 여기서 불러옵니다.


const Tab = createBottomTabNavigator(); 

export default function App() {
	
useEffect(() => {
    if (true) {
      CryptoModule.RSA_KeyPair_Maker();
    }
    
    return () => console.log("컴포넌트 파괴, 언마운트 됨")
  }, []); 
	
	return (
		<PaperProvider>
			<NavigationContainer>
				<Tab.Navigator>
					<Tab.Screen name="Home" component={HomeScreen} />
					<Tab.Screen name="Chat" component={ChatScreen} />
					<Tab.Screen name="Profile" component={ProfileScreen} />
				</Tab.Navigator>
			</NavigationContainer>
		</PaperProvider>
	);
}


