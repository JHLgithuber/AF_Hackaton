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

	
const fetchMessages = async () => {
    let rowArray = [];
    Chat_DB.transaction((tx) => {
        tx.executeSql(
            `SELECT * FROM ${RoomName} ORDER BY date DESC LIMIT 20`,
            [],
            async (_, { rows }) => {  // 비동기로 처리
                for (let i = 0; i < rows.length; i++) {
                    const item = rows.item(i);

                    let Decryptied_Data = null;
                    try {
						console.log(item.peer_key_hash);
                        Decryptied_Data = await CryptoModule.Decryption(  // await 키워드 사용
                            item.peer_key_hash,
                            null,
                            item.encrypt_AES_Key,
                            item.encrypt_data
                        );
                    } catch (err) {
                        console.error('Decryption failed:', err);
                    }

                    const rowMessage = {
                        _id: item.UUID,
                        text: Decryptied_Data,
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
		//console.log("DB를 만들까?")
		Chat_DB.transaction((tx) => {
			//console.log("DB를 만들까2?")
			tx.executeSql(
				`CREATE TABLE IF NOT EXISTS ${RoomName} (UUID TEXT PRIMARY KEY, date TEXT, sender TEXT, sender_name TEXT, receiver INTEGER, peer_key_hash TEXT, server_key_hash TEXT, encrypt_AES_Key TEXT, encrypt_data BLOB);`,
				[],
				(_, result) => {
					console.log('Table Create Success:', result);
					fetchMessages();
				},
				(_, err) => {
					return false;
				}
			);
		});
	};

	const onSend = (newMessages = []) => {
		//console.log(newMessages);
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
			//CryptoModule.Encryption();//메시지 암호화
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

	const onReceive = async (newReceivingMessage: IMessage) => {
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
					null, //수신자
					newReceivingMessage.public_key_hash, //사용자 키 해시
					null, //서버 키 해시
					newReceivingMessage.encrypted_AESKey, //암호화된 AES Key
					newReceivingMessage.ciphertext,
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

		try {
			const Decryptied_Data = await CryptoModule.Decryption(
				newReceivingMessage.public_key_hash,
				null,
				newReceivingMessage.encrypted_AESKey,
				newReceivingMessage.ciphertext
			);

			let updatedMessage = {
				...newReceivingMessage,
				_id: Crypto.randomUUID(),
				text: Decryptied_Data,
			};

			setMessages((prevMessages) => GiftedChat.append(prevMessages, [updatedMessage]));
		} catch (err) {
			console.error('Decryption failed:', err);
		}

		console.log('newReceivingMessage', newReceivingMessage);
	};

	useEffect(() => {
		Make_new_DB();
		fetchMessages();
	}, []);

	//수신이 잘 되는지 테스트, 전송하듯이 구현
	useEffect(() => {
		console.log('수신테스트: ', UserID);
		let messageText = new Date().toString()+'에 자동으로 받은 메시지입니다.';
		const timer = setTimeout(async () => {
			let public_key_object = await CryptoModule.Get_PublicKey();
			let public_key = public_key_object.public_key;
			let public_key_hash = public_key_object.public_key_hash;
			console.log(public_key, public_key_hash);

			let encrypted = await CryptoModule.Encryption(public_key, null, messageText);
			console.log(encrypted);

			const newMessage = {
				ciphertext: encrypted[0],
				encrypted_AESKey: encrypted[1],
				public_key_hash: public_key_hash,
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