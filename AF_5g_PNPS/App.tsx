//App.tsx
//https://docs.expo.dev/workflow/customizing/
import React, { useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import ChatScreen from './ChatScreen';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import SecurityScreen from './SecurityScreen';
import * as CryptoModule from './HybridCryptoModule'; // Task 등록 함수를 여기서 불러옵니다.

const BACKGROUND_FETCH_TASK = 'background-fetch-task';
const Tab = createBottomTabNavigator();

  const executeKeyMaking = async () => {
    try {
      console.log("RSA_KeyPair_Maker");
      await CryptoModule.RSA_KeyPair_Maker();
      console.log("END RSA_KeyPair_Maker\n\n");
    } catch (error) {
      console.error(error);
    }
  };

export default function App() {
	const [Making_RSA_Key, setMaking_RSA_Key] = useState(false);
	let timerId;
  useEffect(() => {
    let timerId;
    if (Making_RSA_Key) {
      timerId = setTimeout(async () => {
        await executeKeyMaking();
		  setMaking_RSA_Key(false);
        clearTimeout(timerId);
      }, 5000);
    } else {
      clearTimeout(timerId);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [Making_RSA_Key]);

	return (
		<PaperProvider>
			<NavigationContainer>
				<Tab.Navigator>
					<Tab.Screen name="Home" component={HomeScreen} />
					<Tab.Screen name="Chat" component={ChatScreen} />
					<Tab.Screen name="Profile" component={ProfileScreen} />
					<Tab.Screen name="Security">
						{() => <SecurityScreen setMaking_RSA_Key={setMaking_RSA_Key} Making_RSA_Key={Making_RSA_Key} />}
					</Tab.Screen>
				</Tab.Navigator>
			</NavigationContainer>
		</PaperProvider>
	);
}