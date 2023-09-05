import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
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
	const [isLoading, setIsLoading] = useState(false); // ActivityIndicator 상태 관리를 위한 상태 변수

	
const fetchMessages = async () => {
    let rowArray = [];
	setIsLoading(true);
    Chat_DB.transaction((tx) => {
        tx.executeSql(
            `SELECT * FROM ${RoomName} ORDER BY send_date DESC LIMIT 5`,
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
                        createdAt: new Date(item.send_date),
                        user: {
                            _id: item.sender,
                            name: item.sender_name,
                        },
                    };
                    rowArray.push(rowMessage);
                }
				setIsLoading(false); // 로딩 종료
                setMessages(rowArray);
            },
            (_, err) => {
				setIsLoading(false); // 로딩 종료
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
				`CREATE TABLE IF NOT EXISTS ${RoomName} (UUID TEXT PRIMARY KEY, send_date TEXT, sender TEXT, sender_name TEXT, receiver INTEGER, peer_key_hash TEXT, server_key_hash TEXT, encrypt_AES_Key TEXT, encrypt_data BLOB);`,
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

	const onSend = async (newMessages = []) => {
		//console.log(newMessages);
		await newMessages.forEach(async (message) => {
			if (message.text === '/r') {
				// 테이블 삭제
				await Chat_DB.transaction((tx) => {
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
				await setMessages([]); // 화면에서 모든 메시지 제거
				return; // 이후 처리를 중단
			}
			//console.log(typeof parseInt(message._id, 10));
			//CryptoModule.Encryption();//메시지 암호화
			// 기존의 메시지 삽입 로직
			console.log("SendingMessage",message);
			let public_key_object = await CryptoModule.Get_PublicKey();
			let encrypted = await CryptoModule.Encryption(public_key_object.public_key, null, message.text);
			
			
			
			
			await Chat_DB.transaction((tx) => {
				tx.executeSql(
					`INSERT INTO ${RoomName} (UUID, send_date, sender,sender_name, receiver, peer_key_hash, server_key_hash, encrypt_AES_Key, encrypt_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						Crypto.randomUUID(),
						message.createdAt.toISOString(),
						UserID.toString(),
						UserName,
						null,//수신자
						public_key_object.public_key_hash,
						null,//서버키 해시
						encrypted.encrypted_AESKey,
						encrypted.ciphertext,
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
			await setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
		});
	};

	const onReceive = async (newReceivingMessage: IMessage) => {
		// 메시지 수신 로직
		// 데이터베이스에 새로운 수신 메시지를 저장
		Chat_DB.transaction((tx) => {
			tx.executeSql(
				`INSERT INTO ${RoomName} (UUID, send_date, sender, sender_name, receiver, peer_key_hash, server_key_hash, encrypt_AES_Key, encrypt_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
			//console.log(public_key_object.public_key, public_key_object.public_key_hash);

			let encrypted = await CryptoModule.Encryption(public_key_object.public_key, null, messageText);
			console.log(encrypted);

			const newMessage = {
				ciphertext: encrypted.ciphertext,
				encrypted_AESKey: encrypted.encrypted_AESKey,
				public_key_hash: public_key_object.public_key_hash,
				createdAt: new Date(),
				user: {
					_id: 3,
					name: '시스템',
				},
			};

			//console.log(newMessage);

			await onReceive(newMessage);
		}, 10000); // 10초 후에 메시지를 받습니다.

		return () => {
			clearTimeout(timer);
		};
	}, [messages]);

	return (
		<View style={{ flex: 1 }}>
			{isLoading ? (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator size="large" color="#0000ff" />
				</View>
			) : (
				<GiftedChat
					messages={messages}
					onSend={(newMessages) => onSend(newMessages)}
					user={{
						_id: UserID.toString(),
						name: UserName,
					}}
				/>
			)}
		</View>
	);
}