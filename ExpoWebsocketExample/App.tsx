import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import io from 'socket.io-client';

export default function App() {
  useEffect(() => {
    const socket = io('http://flaskwstest.run.goorm.site:5000');
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('message', (message) => {
      console.log('New message:', message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Check your console for WebSocket messages</Text>
    </View>
  );
}
