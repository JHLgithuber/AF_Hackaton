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

const BACKGROUND_FETCH_TASK = 'background-fetch-task';
const Tab = createBottomTabNavigator(); 

TaskManager.defineTask(BACKGROUND_FETCH_TASK, () => {
  try {
	  console.log("BACKGROUND_FETCH_TASK");
    CryptoModule.RSA_KeyPair_Maker();
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    return BackgroundFetch.Result.Failed;
  }
});

export default function App() {
useEffect(() => {
  // 이 부분은 앱이 로드될 때 바로 실행됩니다.
  console.log("앱이 시작됨");
  CryptoModule.RSA_KeyPair_Maker();

  const registerBackgroundFetch = async () => {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 6,  // 15분마다
    });
  };

  registerBackgroundFetch();
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


