// ChatScreen.js
import React, { useState } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      _id: 1,
      text: 'Hello!',
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'User',
      },
    },
  ]);

  const onSend = (newMessages = []) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
  };

  return (
    <GiftedChat
			//name={name}
      messages={messages}
      onSend={(newMessages) => onSend(newMessages)}
      user={{ _id: 1 }}
    />
  );
}
