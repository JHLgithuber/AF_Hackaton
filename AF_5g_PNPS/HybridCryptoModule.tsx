//HybridCryptoMosule.tsx
//import 'react-native-rsa-expo';
//https://www.npmjs.com/package/react-native-rsa-expo
//https://www.npmjs.com/package/crypto-js
import React, { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { InteractionManager } from 'react-native';
import { self } from 'react-native-workers';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'base-64';
import CryptoJS from 'crypto-js';
import Toast from 'react-native-root-toast';
import { get_server_private_key } from './ConnectionModule';

const KeyPair_DB = SQLite.openDatabase('Encrypted_Chat_Data.db');
const RSAKey = require('react-native-rsa');
const bits = 512; //안전한건 2048 이상
const exponent = '65537'; // must be a string. This is hex string. decimal = 65537

export async function Get_KeyStore_PrivateKey(authenticationPrompt) {
    try {
        let KeyStore_PrivateKey = await SecureStore.getItemAsync('KeyStore_PrivateKey', {
            authenticationPrompt: authenticationPrompt,
        });
        if (KeyStore_PrivateKey) {
            console.log('Get_KeyStore_PrivateKey', KeyStore_PrivateKey);
            return KeyStore_PrivateKey;
        } else {
            RSA_KeyPair_Maker();
        }
    } catch (e) {
        console.log('Get_KeyStore_PrivateKey', e);
    }
}

async function Get_KeyStore_PublicKey() {
    try {
        const KeyStore_PublicKey = await AsyncStorage.getItem('KeyStore_PublicKey');
        if (KeyStore_PublicKey !== null) {
            console.log('Get_KeyStore_PublicKey', KeyStore_PublicKey);
            return KeyStore_PublicKey;
        }
    } catch (e) {
        console.log('Get_KeyStore_PublicKey', e);
    }
}

async function Set_KeyStore_Key() {
    const rsa = new RSAKey();
    await rsa.generate(bits, exponent);
    console.log('Set_KeyStore_Key', rsa.getPublicString(), rsa.getPrivateString());

    try {
        await AsyncStorage.setItem('KeyStore_PublicKey', rsa.getPublicString());
        await SecureStore.setItemAsync('KeyStore_PrivateKey', rsa.getPrivateString(), {
            authenticationPrompt: 'KeyStore_Key키를 저장합니다',
            requireAuthentication: true,
        });
    } catch (e) {
        console.log('Set_KeyStore_Key', e);
    }
}

function Make_RSA_KeyTable() {
    KeyPair_DB.transaction((tx) => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS KeyTable (
      public_key_hash TEXT PRIMARY KEY NOT NULL,
      public_key TEXT NOT NULL,
      encrypted_private_key TEXT NOT NULL,
	  encrypted_AES_key TEXT NOT NULL,
      generated_date TEXT NOT NULL,
      used_date TEXT
	  );`,
            [],
            (_, result) => {
                console.log('Table CREATE:', result);
            },
            (_, err) => {
                console.log('CREATE Table Error:', err);
                return false;
            }
        );
    });
}

export function Remove_RSA_KeyTable() {
    KeyPair_DB.transaction((tx) => {
        tx.executeSql(
            `DROP TABLE IF EXISTS KeyTable;`,
            [],
            (_, result) => {
                console.log('Table Dropped:', result);
                // 테이블 다시 생성
                RSA_KeyPair_Maker();
				Set_KeyStore_Key();
            },
            (_, err) => {
                console.log('Drop Table Error:', err);
                return false;
            }
        );
    });
}
/*
KeyPair_DB.transaction((tx) => {
	db.transaction((tx) => {
		tx.executeSql(
			`SELECT * FROM KeyTable;`,
			[],
			(_, { rows }) => {
				console.log(`Data from ${tableName}: `, rows._array);
				resolve(rows._array);
			},
			(_, error) => {
				reject(error);
				return false;
			}
		);
	});
});*/

export function RSA_KeyPair_Maker() {
    Make_RSA_KeyTable();
    InteractionManager.runAfterInteractions(async () => {
        const toast = Toast.show('RSA KeyPair 생성중...');
        try {
            console.log('Making_RSA_Key_Pair...');
            var Start_MakingKey = new Date();
            console.log('MakingKey Time:\t', Start_MakingKey);

            const rsa = new RSAKey();
            await rsa.generate(bits, exponent);
            const publicKey = rsa.getPublicString(); // return json encoded string
            const privateKey = rsa.getPrivateString(); // return json encoded string
            console.log('publicKey:\t', publicKey);
            console.log('privateKey:\t', privateKey);
            //console.log(typeof rsa);

            var End_MakingKey = new Date();
            console.log('Required Time:\t', End_MakingKey - Start_MakingKey);

            const publicKeyHash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA512,
                publicKey
            );
            console.log('publicKeyHash:\t', publicKeyHash);

            const rsa_key = new RSAKey();
            console.log(await Get_KeyStore_PublicKey());
            console.log(typeof (await Get_KeyStore_PublicKey()));
            rsa_key.setPublicString(await Get_KeyStore_PublicKey());
            console.log('rsa_key.setPublicString');
            const randomBytes = Crypto.getRandomValues(new Uint8Array(32));
            const AESKey = base64.encode(String.fromCharCode.apply(null, randomBytes));
            const encrypted_privateKey = CryptoJS.AES.encrypt(privateKey, AESKey).toString();
            const encrypted_AES_key = rsa_key.encrypt(AESKey);
            console.log('encrypted_privateKey:\t', encrypted_AES_key);

            KeyPair_DB.transaction((tx) => {
                tx.executeSql(
                    'INSERT INTO KeyTable (public_key_hash, public_key, encrypted_private_key, encrypted_AES_key, generated_date, used_date) VALUES (?, ?, ?, ?, ?,?)',
                    [
                        publicKeyHash,
                        publicKey,
                        encrypted_privateKey,
                        encrypted_AES_key,
                        new Date().toISOString(),
                        null,
                    ],
                    (_, result) => {
                        console.log('INSERT Key:', result);
                    },
                    (_, err) => {
                        console.log('INSERT Key ERROR:', err);
                        return false;
                    }
                );
            });
            Toast.hide(toast);
        } catch (error) {
            Toast.hide(toast);
            console.error('An error occurred:', error);
        }
    });
}

//상대의 공개키로 암호화
export function Encryption(publicKey, serverKey, data) {
    try {
        const rsa = new RSAKey();
        const rsa_server = new RSAKey();
        console.log('publicKey', publicKey);
        rsa.setPublicString(publicKey);
        console.log('serverKey', serverKey);
        rsa_server.setPublicString(serverKey);

        // AES 암호화 키 생성
        const randomBytes = Crypto.getRandomValues(new Uint8Array(32));
        const AESKey = base64.encode(String.fromCharCode.apply(null, randomBytes));
        console.log('AESKey', AESKey);

        //console.log("AESKey in Base64:", typeof(AESKey));

        // Base64 디코딩하여 WordArray 형식으로 변환
        //const AESKeyWordArray = CryptoJS.enc.Base64.parse(AESKey);

        const ciphertext = CryptoJS.AES.encrypt(data, AESKey).toString();
        console.log('ciphertext', ciphertext);

        const encrypted_AESKey = rsa.encrypt(AESKey);
        console.log('encrypted_AESKey', encrypted_AESKey);
        const server_encrypted_AESKey = rsa_server.encrypt(encrypted_AESKey);
        console.log('server_encrypted_AESKey', server_encrypted_AESKey);

        return { ciphertext, server_encrypted_AESKey };
    } catch (error) {
        console.error('Encryption failed:', error);
        return null;
    }
}

//자신의 비밀키로 복호화
export async function Decryption(
    public_key_hash,
    server_key_hash,
    encrypt_AES_Key,
    ciphertext,
    preReady_private_key
) {
    try {
        let encrypted_privateKey = null;
        let encrypted_AES_key_for_key = null;

        console.log('encrypted_AES_key is exist?', encrypt_AES_Key);

        await new Promise((resolve, reject) => {
            KeyPair_DB.transaction((tx) => {
                tx.executeSql(
                    `SELECT encrypted_private_key, encrypted_AES_key FROM KeyTable WHERE public_key_hash = ?;`,
                    [public_key_hash],
                    (_, { rows }) => {
                        try {
                            encrypted_privateKey = rows._array[0].encrypted_private_key;
                            encrypted_AES_key_for_key = rows._array[0].encrypted_AES_key;
                            resolve();
                        } catch (e) {
                            reject(e); // 에러를 reject로 넘김
                        }
                    },
                    (_, err) => {
                        reject(err); // SQL 에러도 reject로 넘김
                    }
                );
            });
        }).catch((error) => {
            // Promise에 대한 에러 핸들링
            console.log('SQL or Promise Error: ', error);
            throw error; // 에러를 상위로 전파
        });

        if (encrypted_privateKey === null) {
            console.log('encrypted_privateKey is null');
            return null;
        } 
		
        const rsa_key = new RSAKey();
        if (preReady_private_key) {
            rsa_key.setPrivateString(preReady_private_key);
        } else {
            const KeyStore_PrivateKey = await Get_KeyStore_PrivateKey('복호화間 KeyStore_Key에 접근합니다');
            console.log('KeyStore_PrivateKey', KeyStore_PrivateKey);
            rsa_key.setPrivateString(KeyStore_PrivateKey);
        }

        //암호화되어있는 로컬 비밀키를 복호화
        const AES_Key = rsa_key.decrypt(encrypted_AES_key_for_key);
        console.log('AES_KEY=rsa_key.decrypt', AES_Key);
        var privateKey_bytes = await CryptoJS.AES.decrypt(encrypted_privateKey, AES_Key);
        var privateKey = await privateKey_bytes.toString(CryptoJS.enc.Utf8);
        console.log('privateKey', privateKey);

        //서버에서 비밀키를 가져와서 AES키를 1차 복호화
        const rsa_server = new RSAKey();
        const server_private_key = await get_server_private_key(server_key_hash);
        console.log('server_private_key', server_private_key);
        rsa_server.setPrivateString(server_private_key);
        console.log('encrypt_AES_Key', encrypt_AES_Key);
        const server_decrypt_AES_key = await rsa_server.decrypt(encrypt_AES_Key);
        console.log('server_decrypt_AES_key', server_decrypt_AES_key);

        //복호화된 로컬 비밀키로 AES키를 최종 복호화
        const rsa = new RSAKey();
        await rsa.setPrivateString(privateKey);
        const Data_AES_Key = await rsa.decrypt(server_decrypt_AES_key);
        console.log('Data_AES_Key', Data_AES_Key);

        //복호화된 AES키로 데이터 복호화
        var bytes = await CryptoJS.AES.decrypt(ciphertext, Data_AES_Key);
        var originalData = await bytes.toString(CryptoJS.enc.Utf8);
        console.log('originalData', originalData);

        return originalData;
    } catch (e) {
        console.log('Decryption ERROR: ', e);
        return 'Decryption ERROR: ' + e;
    }
}

export function Get_PublicKey() {
    //미사용 Key Pair 추출
    return new Promise(async (resolve, reject) => {
        KeyPair_DB.transaction((tx) => {
            tx.executeSql(
                `SELECT public_key, public_key_hash FROM KeyTable
				ORDER BY
				CASE WHEN used_date IS NULL THEN 1 ELSE 2 END ASC,
				CASE WHEN used_date IS NULL THEN generated_date ELSE used_date END ASC
				LIMIT 1;`,
                [],
                async (_, { rows }) => {
                    console.log('Select from KeyTable for Get_PublicKey: ', rows._array[0]);
                    console.log('Select타입은 ', typeof rows._array[0]);
                    if (rows._array[0] === undefined) {
                        await RSA_KeyPair_Maker();
                        const newPublicKey = await Get_PublicKey();
                        resolve(newPublicKey);
                    } else {
                        resolve(rows._array[0]);
                    }
                },
                async (_, err) => {
                    console.log('Select KeyTable for Get_PublicKey ERROR: ', err);
                    if (err.message && err.message.includes('no such table: KeyTable')) {
                        // 'KeyTable' 테이블이 없을 때 수행할 작업
                        await RSA_KeyPair_Maker();
                        const newPublicKey = await Get_PublicKey();
                        resolve(newPublicKey);
                    } else {
                        // 그 외의 에러에 대한 처리
                        reject(err);
                    }
                }
            );
        });
    });
}