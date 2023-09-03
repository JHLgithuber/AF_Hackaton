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
import { useNavigation } from '@react-navigation/native';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';
const Tab = createBottomTabNavigator();

TaskManager.defineTask(BACKGROUND_FETCH_TASK, () => {
	try {
		console.log('BACKGROUND_FETCH_TASK');
		CryptoModule.RSA_KeyPair_Maker();
		return BackgroundFetch.Result.NewData;
	} catch (error) {
		return BackgroundFetch.Result.Failed;
	}
});

function IntervalKeyMaking() {
	// 이 부분은 앱이 로드될 때 바로 실행됩니다.
	console.log('RSA_KeyPair_Maker');
	CryptoModule.RSA_KeyPair_Maker();
	/*
  const registerBackgroundFetch = async () => {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 6,  // 15분마다
	  
	    registerBackgroundFetch();
    });*/
	console.log('END RSA_KeyPair_Maker\n\n');
	setTimeout(IntervalKeyMaking, 5000);
}

export default function App() {
	useEffect(() => {
		// 렌더링이 완료된 후 3초 뒤에 IntervalKeyMaking 함수를 실행합니다.
		const timer = setTimeout(() => {
			IntervalKeyMaking();
		}, 3000); // 3000 밀리초 후에 실행

		// 컴포넌트가 언마운트될 때 타이머를 제거합니다.
		return () => {
			clearTimeout(timer);
		};
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