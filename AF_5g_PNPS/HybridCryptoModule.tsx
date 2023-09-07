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
const bits = 512;//안전한건 2048 이상
const exponent = '65537'; // must be a string. This is hex string. decimal = 65537

const KeyStore_PublicKey=`{"n":"d0b831029f93540cb3cac6b581389723d029ffea4d004429ac226a942945460eb5432f60c098a9900d095fd480308073b1f4e90ba308847b5d51117534cfbe45","e":"65537"}`;
const KeyStore_PrivateKey=`{"n":"d0b831029f93540cb3cac6b581389723d029ffea4d004429ac226a942945460eb5432f60c098a9900d095fd480308073b1f4e90ba308847b5d51117534cfbe45","e":"65537","d":"2097aeb8eae6866ac7be305332feaf18a237bf5ae045b5fffff7909b4f4d8c2fab6076e617c3c0c3e9f10dff5883f92072a883e81191b9313b225cdc1b3d929b","p":"fd44875e9609d959da1c1d261fc484f5f144cdcd403d0a29b485d42c93b92967","q":"d2f8a14c9d105f7d22f64bebc05fcc0e0e7f6579623b6126aaaf519eb5c49373","dmp1":"de0f63f31b7e5e158168bdf9824466c02b7f482919bbcc6f33f0a5d8da522945","dmq1":"6d7df2681ce0071c4e833ec215aea8c3bd37357fcfb22c955d28f25719bf8f5d","coeff":"0cf999e7e1ddbcb767f4e553c9e3816f93cba0cc8d276749397ff57034be2b05"}`;
        

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
		var privateKey = privateKey_bytes.toString(CryptoJS.enc.Utf8);
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