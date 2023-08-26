import React, { useState, useEffect } from 'react';
import { Appearance, AppearanceProvider } from 'react-native-appearance';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import ChatScreen from './ChatScreen';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

const CombinedDefaultTheme = {
  ...DefaultTheme,
  ...DefaultTheme,
 };

const CombinedDarkTheme = {
  ...DarkTheme,
  ...DarkTheme,
};

export default function App() {
  const colorScheme = Appearance.getColorScheme(); // 시스템 다크 모드 설정 감지
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    // Appearance 라이브러리를 사용하여 시스템 다크 모드 설정을 구독
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });

    // 구독 취소
    return () => subscription.remove();
  }, []);

  const theme = isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <AppearanceProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer theme={theme}>
          <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AppearanceProvider>
  );
}
