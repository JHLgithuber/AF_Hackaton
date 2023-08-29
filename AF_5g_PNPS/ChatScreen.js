// ChatScreen.js
import React, { useState, useEffect } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

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

	const fetchMessages = async () => {
		// 비동기로 메시지를 불러오는 함수입니다.
		const storedMessages = await AsyncStorage.getItem('messages'); // 저장소에서 메시지를 불러옵니다.
		if (storedMessages) {
			setMessages(JSON.parse(storedMessages));
		}
	};

	const removeMessages = async () => {
		try {
			await AsyncStorage.removeItem('messages');
			console.log('메시지가 삭제되었습니다.');
			setMessages([
				{
					_id: 1,
					text: '다 지웠음 ㅋ',
					createdAt: new Date(),
					user: {
						_id: 2,
						name: 'User',
					},
				},
			]);
		} catch (e) {
			console.error('메시지 삭제 실패:', e);
		}
	};

	const onSend = async (newMessages: IMessage[]) => {
		try {
			const updatedMessages = GiftedChat.append(messages, newMessages);
			await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
			setMessages(updatedMessages);
			if (newMessages[0].text === '/r') {
				await removeMessages();
			}
		} catch (e) {
			console.error('메시지 전송 실패:', e);
		}
	};

	const onReceive = async (newMessage: IMessage) => {
		//받은 메시지
		setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessage));
		await AsyncStorage.setItem(
			'messages',
			JSON.stringify(GiftedChat.append(messages, newMessage))
		); // 새로운 메시지를 저장소에 저장합니다.
	};

	useEffect(() => {
		fetchMessages(); // 함수를 실행합니다.
	}, []); // 컴포넌트가 마운트될 때 한 번만 실행됩니다.

	useEffect(() => {
		const timer = setTimeout(() => {
			const newMessage: IMessage = {
				_id: messages.length + 1,
				text: '자동으로 받은 메시지입니다.',
				createdAt: new Date(),
				user: {
					_id: 3,
					name: '시스템',
				},
			};

			onReceive(newMessage);
		}, 10000); // 10초 후에 메시지를 받습니다.

		return () => {
			clearTimeout(timer);
		};
	}, [messages]);

	return (
		<GiftedChat
			messages={messages}
			onSend={(newMessages) => onSend(newMessages)}
			user={{ _id: 1 }}
		/>
	);
}