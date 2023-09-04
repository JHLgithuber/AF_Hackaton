import React, { useState, useEffect } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import * as SQLite from 'expo-sqlite';
import * as CryptoModule from './HybridCryptoModule';
import * as Crypto from 'expo-crypto';

// 채팅 저장을 위한 SQLite 데이터베이스를 열기
const Chat_DB = SQLite.openDatabase('Encrypted_Chat_Data.db');

export default function ChatScreen() {
	const RoomName = 'test_room';
	const UserID = 100;
	const UserName = '이진형';

	const [messages, setMessages] = useState([]);

	const fetchMessages = () => {
		let rowArray = [];
		Chat_DB.transaction((tx) => {
			tx.executeSql(
				`SELECT * FROM ${RoomName} ORDER BY date DESC`,
				[],
				(_, { rows }) => {
					for (let i = 0; i < rows.length; i++) {
						const item = rows.item(i);
						const rowMessage: IMessage = {
							_id: item.UUID,
							text: item.encrypt_data,
							createdAt: new Date(item.date),
							user: {
								_id: item.sender,
								name: item.sender_name,
							},
						};
						rowArray.push(rowMessage);
					}
					setMessages(rowArray);
				},
				(_, err) => {
					console.log('Fetch Error:', err);
					return false;
				}
			);
		});
	};

	const Make_new_DB = () => {
		Chat_DB.transaction((tx) => {
			tx.executeSql(
				`CREATE TABLE IF NOT EXISTS ${RoomName} (UUID INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, sender TEXT, sender_name TEXT, receiver INTEGER, peer_key_hash TEXT, server_key_hash TEXT, encrypt_AES_Key TEXT, encrypt_data BLOB);`,
				[],
				(_, result) => {
					console.log('Table Create Success:', result);
					fetchMessages();
				},
				(_, err) => {
					console.log('Table Create Error:', err);
					return false;
				}
			);
		});
	};

	const generateUniquePK = () => {

		const uniquePK = Crypto.randomUUID();

		return uniquePK;
	};

	const onSend = (newMessages = []) => {
		setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
		newMessages.forEach((message) => {
			if (message.text === '/r') {
				// 테이블 삭제
				Chat_DB.transaction((tx) => {
					tx.executeSql(
						`DROP TABLE IF EXISTS ${RoomName};`,
						[],
						(_, result) => {
							console.log('Table Dropped:', result);
							// 테이블 다시 생성
							Make_new_DB();
						},
						(_, err) => {
							console.log('Drop Table Error:', err);
							return false;
						}
					);
				});
				setMessages([]); // 화면에서 모든 메시지 제거
				return; // 이후 처리를 중단
			}
			//console.log(typeof parseInt(message._id, 10));
			CryptoModule.Encryption();//메시지 암호화
			// 기존의 메시지 삽입 로직
			Chat_DB.transaction((tx) => {
				tx.executeSql(
					`INSERT INTO ${RoomName} (UUID, date, sender,sender_name, receiver, peer_key_hash, server_key_hash, encrypt_AES_Key, encrypt_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						Crypto.randomUUID(),
						message.createdAt.toISOString(),
						UserID.toString(),
						UserName,
						null,
						null,
						null,
						null,
						message.text,
					],
					(_, result) => {
						console.log('Insert Success:', result);
					},
					(_, err) => {
						console.log('Insert Error:', err);
						return false;
					}
				);
			});
		});
	};

	const onReceive = (newReceivingMessage: IMessage) => {
		// 새로운 메시지 객체를 생성하고 _id에 고유한 PK를 할당
		const updatedMessage = { ...newReceivingMessage, _id: Crypto.randomUUID() };
		setMessages((prevMessages) => GiftedChat.append(prevMessages, [updatedMessage]));

		// 메시지 수신 로직
		// 데이터베이스에 새로운 수신 메시지를 저장
		Chat_DB.transaction((tx) => {
			tx.executeSql(
				`INSERT INTO ${RoomName} (UUID, date, sender, sender_name, receiver, peer_key_hash, server_key_hash, encrypt_AES_Key, encrypt_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					Crypto.randomUUID(),
					newReceivingMessage.createdAt.toISOString(),
					newReceivingMessage.user._id,
					newReceivingMessage.user.name,
					null,
					null,
					null,
					null,
					newReceivingMessage.text,
				],
				(_, result) => {
					console.log('Receive Insert Success:', result);
				},
				(_, err) => {
					console.log('Receive Insert Error:', err);
					return false;
				}
			);
		});
		
		CryptoModule.Decryption();
	};

	useEffect(() => {
		Make_new_DB();
		fetchMessages();
	}, []);

	//수신이 잘 되는지 테스트, 전송하듯이 구현
	useEffect(() => {
		console.log("수신테스트: ",UserID);
		let messageText='자동으로 받은 메시지입니다.'
		const timer = setTimeout(async() => {
			
			let public_key=await CryptoModule.Get_PublicKey();
			//console.log(messageText);
			let encrypted=await CryptoModule.Encryption(public_key,null,messageText);
			console.log(encrypted);
			
			
			const newMessage = {
				text: encrypted[0],
				createdAt: new Date(),
				user: {
					_id: 3,
					name: '시스템',
				},
			};
			
			//console.log(newMessage);

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
			user={{
				_id: UserID.toString(),
				name: UserName,
			}}
		/>
	);
}