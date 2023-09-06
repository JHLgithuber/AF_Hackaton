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
import base64 from 'base-64';
import CryptoJS from 'crypto-js';
import Toast from 'react-native-root-toast';

const KeyPair_DB = SQLite.openDatabase('Encrypted_Chat_Data.db');
const RSAKey = require('react-native-rsa');
const bits = 1024; //안전한건 2048 이상
const exponent = '65537'; // must be a string. This is hex string. decimal = 65537

const KeyStore_PublicKey=`{"n":"901590b92b579cd3dba1f472ac17cb9f8a31eca260976788b157f88e4fd867373f10f3b285be6b35c6fede296f5bc801b6da9e418e30f0755d9f79e5cf106466524753b740c40605dd8be2157238f29a20cd8f83c1c6e9627cb52e2ccb5b9f550d867f75b8d2fd67694b066bd453d3be0c2b87659c6d701d3b8aa65235c4aa01","e":"65537"}`;
const KeyStore_PrivateKey=`{"n":"901590b92b579cd3dba1f472ac17cb9f8a31eca260976788b157f88e4fd867373f10f3b285be6b35c6fede296f5bc801b6da9e418e30f0755d9f79e5cf106466524753b740c40605dd8be2157238f29a20cd8f83c1c6e9627cb52e2ccb5b9f550d867f75b8d2fd67694b066bd453d3be0c2b87659c6d701d3b8aa65235c4aa01","e":"65537","d":"3dd6e6ea8a584f38b026c29bbe0f76e022bf89571f65c48ff6d97f011cfede45e9b60f310740344faa7ff3f46d2d4982b2bafb247a6cbd0aa6e51ee66340b03b8ac37d4bda9a2b5b93c441e24a7d2da157fce8128cb3a73c9852ffc4e869419e58cf38cf4a0bc6ac897c8903fa7faf0acb4e0a1c7db91225330faa0d99ac5637","p":"cb24179f6f745a7f7f04a9c4ec374e7aee11f2a9d818098fa7053494d82d569eeae56c4e012e3b3d40d8d3e2e5d7c3d9dbb89a85ab2f2e43c9f3d8737ef7d06d","q":"b59380ea301fd87713074133b5e583ad4e18a4335351f8b6ef1c543651d8d740a0d7dbb4736dc223d501fce6653daf9e29ced7d62805192b618a950c20fdcb65","dmp1":"6173f20ec56b37301c28e1fd48b80f9f3d4a0e8791d76399f0369c9f8fb2c70a23be9a9a08a3090b3d4ae86f77dbc6129aade0ca19684e0cb6886188efc09293","dmq1":"3079f1c61ebe45468276e71ed9c5cb642bc348dfd43f3c427a436781ae35b3e73bda36be3cfe01a4f7268e5d53e1ef518137330a34aa80fba9e0b3a01e7b","coeff":"5c3baca5e432564ecbfbc57696fb42e9b0b240ff4d73690043d5fe613e6fb02bc219ec7cf134e8d5467e935804618b2187f8a94849a792b08777f9c3794a0939"}`;

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
				Make_RSA_KeyTable();
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
			
			const rsa_key=new RSAKey();
			console.log(KeyStore_PublicKey);
			console.log(typeof(KeyStore_PublicKey));
			rsa_key.setPublicString(KeyStore_PublicKey);
			console.log("rsa_key.setPublicString");
			const randomBytes = Crypto.getRandomValues(new Uint8Array(32));
			const AESKey = base64.encode(String.fromCharCode.apply(null, randomBytes));
			const encrypted_privateKey = CryptoJS.AES.encrypt(privateKey, AESKey).toString();
			const encrypted_AES_key=rsa_key.encrypt(AESKey)
			console.log('encrypted_privateKey:\t', encrypted_AES_key);
			

			KeyPair_DB.transaction((tx) => {
				tx.executeSql(
					'INSERT INTO KeyTable (public_key_hash, public_key, encrypted_private_key, encrypted_AES_key, generated_date, used_date) VALUES (?, ?, ?, ?, ?,?)',
					[publicKeyHash, publicKey, encrypted_privateKey, encrypted_AES_key, new Date().toISOString(), null],
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
		rsa.setPublicString(publicKey);

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

		return { ciphertext, encrypted_AESKey };
	} catch (error) {
		console.error('Encryption failed:', error);
		return null;
	}
}

//자신의 비밀키로 복호화
export async function Decryption(public_key_hash, server_key_hash, encrypt_AES_Key, ciphertext) {
	try {
		let encrypted_privateKey = null;
		let encrypted_AES_key = null;
		const rsa = new RSAKey();
		const rsa_key = new RSAKey();

		await new Promise((resolve, reject) => {
			KeyPair_DB.transaction((tx) => {
				tx.executeSql(
					`SELECT encrypted_private_key, encrypted_AES_key FROM KeyTable WHERE public_key_hash = ?;`,
					[public_key_hash],
					(_, { rows }) => {
						try {
							encrypted_privateKey = rows._array[0].encrypted_private_key;
							encrypted_AES_key= rows._array[0].encrypted_AES_key;
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
		
		rsa_key.setPrivateString(KeyStore_PrivateKey);
		console.log("encrypted_AES_key",encrypted_AES_key);
		const AES_Key=rsa_key.decrypt(encrypted_AES_key);
		console.log("AES_KEY=rsa_key.decrypt",AES_Key);
		var privateKey_bytes = CryptoJS.AES.decrypt(encrypted_privateKey, AES_Key);
		var privateKey = privateKey_.toString(CryptoJS.enc.Utf8);
		console.log("privateKey",privateKey);
		
		
		rsa.setPrivateString(privateKey);
		const Data_AES_Key=rsa.decrypt(encrypt_AES_Key);
		var bytes = CryptoJS.AES.decrypt(ciphertext, Data_AES_Key);
		var originalData = bytes.toString(CryptoJS.enc.Utf8);
		console.log("originalData",originalData);

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