//ChatScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import * as SQLite from 'expo-sqlite';
import * as CryptoModule from './HybridCryptoModule';
import * as Crypto from 'expo-crypto';
import { Messenger_IO, UnHandled_Receiving_Message, get_server_public_key, get_server_private_key } from './ConnectionModule';
import useHandleUnreadMessages from './useHandleUnreadMessages';

// 채팅 저장을 위한 SQLite 데이터베이스를 열기
const Chat_DB = SQLite.openDatabase('Encrypted_Chat_Data.db');
const ChatIO = new Messenger_IO('http://43.202.4.38:50916');
export var existed_UnHandled_Receiving_Message = 0;

export default function ChatScreen() {
    const RoomName = 'test_room';
    const UserID = 100;
    const UserName = '이진형';

    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // ActivityIndicator 상태 관리를 위한 상태 변수

    const fetchMessages = async () => {
        console.log('Start fetching KeyStore_PrivateKey...');
        const KeyStore_PrivateKey = await CryptoModule.Get_KeyStore_PrivateKey(
            'Message Fetching...'
        );
        console.log('CryptoModule.Get_KeyStore_PrivateKey completed: ', KeyStore_PrivateKey);
        //await executeTransaction();

        const executeTransaction = () => {
            // 함수를 async로 변경
            return new Promise((resolve, reject) => {
                Chat_DB.transaction((tx) => {
                    console.log('Start database transaction...');
                    setIsLoading(true);

                    tx.executeSql(
                        `SELECT * FROM ${RoomName} ORDER BY send_date DESC LIMIT 15`,
                        [],
                        async (_, { rows }) => {
                            // 비동기로 처리
                            console.log('Transaction success. Start processing rows...');
                            let rowArray = [];

                            for (let i = 0; i < rows.length; i++) {
                                const item = rows.item(i);
                                console.log(
                                    'Processing item with peer_key_hash:',
                                    item.peer_key_hash
                                );

                                let Decryptied_Data = null;
                                try {
                                    Decryptied_Data = await CryptoModule.Decryption(
                                        item.peer_key_hash,
                                        null,
                                        item.encrypt_AES_Key,
                                        item.encrypt_data,
                                        KeyStore_PrivateKey
                                    );
                                    console.log('Decryption success: ', Decryptied_Data);
                                } catch (err) {
                                    console.error('Decryption failed: ', err);
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

                            setIsLoading(false);
                            console.log('Transaction and row processing completed.');
                            resolve(rowArray);
                        },
                        (_, err) => {
                            console.log('Transaction failed: ', err);
                            setIsLoading(false);
                            reject(err);
                        }
                    );
                });
            });
        };

        try {
            console.log('Executing transaction...');
            const rowArray = await executeTransaction(); // await를 사용하여 대기
            console.log('Transaction completed, setting messages...');
            setMessages(rowArray);
        } catch (err) {
            console.log('Fetch Error:', err);
        }
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
                    //fetchMessages();
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
            console.log('SendingMessage', message);
            let public_key_object = await CryptoModule.Get_PublicKey();
			let public_server_key_object = await get_server_public_key();
			console.log("public_server_key",public_server_key_object.public_key);
            let encrypted = await CryptoModule.Encryption(
                public_key_object.public_key,
                public_server_key_object.public_key,
                message.text
            );
			
			

            const SendingMessage = {
                ciphertext: encrypted.ciphertext,
                encrypted_AESKey: encrypted.server_encrypted_AESKey,
                public_key_hash: public_key_object.public_key_hash,
				server_key_hash: public_server_key_object.hash,
                createdAt: message.createdAt.toISOString(),
                user: {
                    _id: UserID.toString(),
                    name: UserName,
                },
            };
            await ChatIO.sendMessage(SendingMessage);

            await Chat_DB.transaction((tx) => {
                tx.executeSql(
                    `INSERT INTO ${RoomName} (UUID, send_date, sender,sender_name, receiver, peer_key_hash, server_key_hash, encrypt_AES_Key, encrypt_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        Crypto.randomUUID(),
                        SendingMessage.createdAt,
                        SendingMessage.user._id,
                        SendingMessage.user.name,
                        null, //수신자
                        SendingMessage.public_key_hash,
                        SendingMessage.server_key_hash, //서버키 해시
                        SendingMessage.encrypted_AESKey,
                        SendingMessage.ciphertext,
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
                    newReceivingMessage.createdAt,
                    newReceivingMessage.user._id,
                    newReceivingMessage.user.name,
                    null, //수신자
                    newReceivingMessage.public_key_hash, //사용자 키 해시
                    newReceivingMessage.server_key_hash, //서버 키 해시
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
                newReceivingMessage.server_key_hash,
                newReceivingMessage.encrypted_AESKey,
                newReceivingMessage.ciphertext,
                null
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
        const intervalId = setInterval(() => {
            while (UnHandled_Receiving_Message.length) {
                onReceive(UnHandled_Receiving_Message[0]);
                UnHandled_Receiving_Message.shift();
            }
        }, 1000); // 1초마다 반복

        // 컴포넌트 언마운트시 인터벌 제거
        return () => {
            clearInterval(intervalId);
        };
    }, []);


    useEffect(() => {
        Make_new_DB();
        fetchMessages();
    }, []);

    //수신이 잘 되는지 테스트, 전송하듯이 구현
    /*
    useEffect(() => {
        console.log('수신테스트: ', UserID);
        let messageText = new Date().toString() + '에 자동으로 받은 메시지입니다.';
        const timer = setTimeout(async () => {
            let public_key_object = await CryptoModule.Get_PublicKey();
            //console.log(public_key_object.public_key, public_key_object.public_key_hash);

            let encrypted = await CryptoModule.Encryption(
                public_key_object.public_key,
                null,
                messageText
            );
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
	*/

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