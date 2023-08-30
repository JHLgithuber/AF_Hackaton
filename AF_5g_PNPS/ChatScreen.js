// ChatScreen.js
import React, { useState, useEffect } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';

const Chat_DB = SQLite.openDatabase('Encrypted_Chat_Data.db'); //채팅저장용 SQLite

export default function ChatScreen() {
	const RoomName = 'test_room';

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

	const fetchMessages = () => {
		Chat_DB.transaction((tx) => {
			tx.executeSql(
				`SELECT * FROM ${RoomName};`,
				[],
				(_, { rows }) => {
					for (let i = 0; i < rows.length; i++) {
						const item = rows.item(i);
						const rowMessage: IMessage = {
							_id: item.id,
							text: item.encrypt_data,
							createdAt: item.date,
							user: {
								_id: item.sender,
								name: '시스템',
							},
						};
						rowArray.push(rowMessage);
					}
						
						console.log('전체 데이터 배열:', rowArray);
				setMessages(rowArray); // 업데이트된 배열로 메시지 업데이트
					console.log('전체 데이터 배열:', rowArray);
				},
				(_, err) => {
					console.log('데이터 조회 실패:', err);
				}
			);
		});
	};

	const removeMessages = async () => {
		try {
			Chat_DB.transaction((tx) => {
				tx.executeSql(
					`DROP TABLE IF EXISTS ${RoomName};`,
					[],
					(_, result) => {
						console.log('테이블 삭제 성공:', result);
					},
					(_, err) => {
						console.log('테이블 삭제 실패:', err);
						return false;
					}
				);
				console.log('메시지가 삭제되었습니다.');
			});
		} catch (e) {
			console.error('메시지 삭제 실패:', e);
		}
	};

	const onSend = async (newSendingMessages: IMessage[]) => {
		try {
			const updatedMessages = GiftedChat.append(messages, newSendingMessages);
			Chat_DB.transaction((tx) => {
				tx.executeSql(
					`INSERT INTO ${RoomName} (id, date, sender, receiver, peer_key_hash, server_key_hash, encrypt_AES_Key, encrypt_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
					[
						newSendingMessages[0]._id.toString(),
						newSendingMessages[0].createdAt.toISOString(),
						newSendingMessages[0].user._id.toString(),
						null,
						null,
						null,
						null,
						newSendingMessages[0].text.toString(),
					],
					(_, result) => {
						console.log('데이터 삽입 성공:', result);
					},
					(_, err) => {
						console.log('데이터 삽입 실패:', err);
						return false; // 롤백
					}
				);
			});
			if (newSendingMessages[0].text === '/r') {
				await removeMessages();
			}

			setMessages(updatedMessages); //화면 시현
		} catch (e) {
			console.error('메시지 전송 실패:', e);
		}
	};

	const onReceive = async (newReceivingMessage: IMessage) => {
		try {
			const updatedMessages = GiftedChat.append(messages, newReceivingMessage);
			Chat_DB.transaction((tx) => {
				tx.executeSql(
					`INSERT INTO ${RoomName} (id, date, sender, receiver, peer_key_hash, server_key_hash, encrypt_AES_Key, encrypt_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
					[
						newReceivingMessage[0]._id.toString(),
						newReceivingMessage[0].createdAt.toISOString(),
						newReceivingMessage[0].user._id.toString(),
						null,
						null,
						null,
						null,
						newReceivingMessage[0].text.toString(),
					],
					(_, result) => {
						console.log('데이터 삽입 성공:', result);
					},
					(_, err) => {
						console.log('데이터 삽입 실패:', err);
						return false; // 롤백
					}
				);
			});

			setMessages(updatedMessages); //화면 시현
		} catch (e) {
			console.error('메시지 수신 실패:', e);
		}
	};

	useEffect(() => {
		// 테이블 생성
		Chat_DB.transaction((tx) => {
			console.log("이거 안하냐");
			tx.executeSql(
				`create table if not exists ${RoomName} (id text primary key not null, date text, sender text, receiver text, peer_key_hash text, server_key_hash text, encrypt_AES_Key text, encrypt_data blob);`,
				(_, result) => {
					console.log('테이블 생성 성공:', result);
				},
				(_, err) => {
					console.log('테이블 생성 실패:', err);
					return false; // 롤백
				}
			);

			tx.executeSql(
				`INSERT INTO ${RoomName} (id, date, sender, receiver, peer_key_hash, server_key_hash, encrypt_AES_Key, encrypt_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
				['1', new Date().toISOString(), '2', null, null, null, null, 'Hello!'],
				(_, result) => {
					console.log('데이터 삽입 성공:', result);
				},
				(_, err) => {
					console.log('데이터 삽입 실패:', err);
					return false; // 롤백
				}
			);

			tx.executeSql(`SELECT * FROM ${RoomName};`, [], (_, { rows }) => {
				console.log('전체 데이터:', rows);
				for (let i = 0; i < rows.length; i++) {
					console.log(`Row ${i + 1}:`, rows.item(i));
				}
			});
		});

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