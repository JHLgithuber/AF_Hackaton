import React, { useEffect } from 'react';
import { Text, View, Button } from 'react-native';
import { io } from 'socket.io-client';

export default function App() {
  useEffect(() => {
    const socket = io('http://3.36.111.111:55369');
    
    socket.on('connect', () => {
      console.log('connected to server');
      socket.emit('message', 'Hello from client');
    });

    socket.on('message', (message) => {
      console.log(`Message from server: ${message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>WebSocket Example</Text>
    </View>
  );
}
