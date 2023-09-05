//HybridCryptoMosule.js
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

const Make_RSA_KeyTable = () => {
	KeyPair_DB.transaction((tx) => {
		tx.executeSql(
			`CREATE TABLE IF NOT EXISTS KeyTable (
      public_key_hash TEXT PRIMARY KEY NOT NULL,
      public_key BLOB NOT NULL,
      encrypted_private_key BLOB NOT NULL,
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
};

export const Remove_RSA_KeyTable = () => {
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
};
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

export const RSA_KeyPair_Maker = () => {
	const toast = Toast.show('RSA KeyPair 생성중...');
	Make_RSA_KeyTable();
	InteractionManager.runAfterInteractions(async () => {
		try {
			console.log('Making_RSA_Key_Pair...');
			var Start_MakingKey = new Date();
			console.log('MakingKey Time:\t', Start_MakingKey);

			const rsa = new RSAKey();
			rsa.generate(bits, exponent);
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

			KeyPair_DB.transaction((tx) => {
				tx.executeSql(
					'INSERT INTO KeyTable (public_key_hash, public_key, encrypted_private_key, generated_date, used_date) VALUES (?, ?, ?, ?, ?)',
					[publicKeyHash, publicKey, privateKey, new Date().toISOString(), null],
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
};

//상대의 공개키로 암호화
export const Encryption = (publicKey, serverKey, data) => {
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
};

//자신의 비밀키로 복호화
export const Decryption = async (public_key_hash, server_key_hash, encrypt_AES_Key, ciphertext) => {
	let privateKey = null;
	const rsa = new RSAKey();

	// 공개키 해시 기반으로 비밀키 추출
	await new Promise((resolve, reject) => {
		KeyPair_DB.transaction((tx) => {
			tx.executeSql(
				`SELECT encrypted_private_key FROM KeyTable WHERE public_key_hash = ?;`,
				[public_key_hash],
				(_, { rows }) => {
					console.log('Select from KeyTable for Decryption: ', rows._array[0]);
					privateKey = rows._array[0].encrypted_private_key;
					console.log('privateKey', privateKey);
					resolve();
				},
				(_, err) => {
					console.log('Select KeyTable for Decryption ERROR: ', err);
					reject(err);
				}
			);
		});
	});

	if (privateKey === null) {
		console.log('privateKey', privateKey);
		return null;
	}

	rsa.setPrivateString(privateKey);
	const AES_KEY = rsa.decrypt(encrypt_AES_Key);
	console.log('AES_KEY', AES_KEY);
	var bytes = CryptoJS.AES.decrypt(ciphertext, AES_KEY);
	var originalData = bytes.toString(CryptoJS.enc.Utf8);
	console.log('Decrypted_data', originalData);

	return originalData;
};

export const Get_PublicKey = () => {
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
};

/*
console.log(privateKey);
var End_MakingKey = new Date();
console.log(End_MakingKey-Start_MakingKey);

//const rsa = new RSAKey();
for (i = 0; i < 3; i++) {
	rsa.setPublicString(publicKey);
	const originText = '계절이 지나가는 하늘에는 가을로 가득 차 있습니다.';
	const encrypted = rsa.encrypt(originText);
	console.log(encrypted);
	rsa.setPrivateString(privateKey);
	const decrypted = rsa.decrypt(encrypted); // decrypted == originText
	console.log(decrypted);
}

class App extends Component {
	render() {
		return (
			<View>
				<Text>Demo</Text>
			</View>
		);
	}
}

export default App;*/