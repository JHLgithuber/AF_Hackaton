import RSA from 'react-native-rsa-native';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

//키 Pair 저장을 위한 SQLite 데이터베이스를 열기
const KeyPair_DB = SQLite.openDatabase('Encrypted_Chat_Data.db');
const RSA_KEYPAIR_TASK = 'rsa-keypair-task';

KeyPair_DB.transaction((tx) => {
	//키페어 DB 없으면 생성
	tx.executeSql(
		`CREATE TABLE IF NOT EXISTS KeyTable (
      public_key_hash TEXT PRIMARY KEY NOT NULL,
      public_key BLOB NOT NULL,
      encrypted_private_key BLOB NOT NULL,
      generated_date TEXT NOT NULL,
      used_date TEXT NOT NULL
    );`
	);
});

const addKeyPair = async () => {
	// RSA 키페어 생성
	const { publicKey, privateKey } = await RSA.generateKeys(2048);

	// 퍼블릭 키의 해시값을 생성 (여기서는 단순화를 위해 publicKey를 사용)
	const publicKeyHash = publicKey; // 실제로는 SHA-256 등을 사용해 해시를 생성해야 함

	// 현재 날짜와 시간을 가져옴
	const issuedDate = new Date().toISOString();

	// 사용여부
	const isUsed = 0; // 0은 false, 1은 true

	// SQLite에 정보 저장
};

const RSA_KeyPair_Maker = async () => {
	const keys = await RSA.generate(4); // 2048은 키 길이입니다.
	console.log('2048 bit key: ', keys);

	// 공개키의 SHA-512 해시값을 생성합니다.
	const publicKeyHash = await Crypto.digestStringAsync(
		Crypto.CryptoDigestAlgorithm.SHA512,
		keys.public
	);

	KeyPair_DB.transaction((tx) => {
		tx.executeSql(
			'INSERT INTO KeyTable (public_key_hash, public_key, encrypt_private_key, generated_date, used_date) VALUES (?, ?, ?, ?, ?)',
			[publicKeyHash, keys.public, keys.private, new Date().toISOString(), null],
			[],
			(_, result) => {
				console.log('Key_Pair Create Success:', result);
			},
			(_, err) => {
				console.log('Key_Pair Create Error:', err);
				return false;
			}
		);
	});
};

TaskManager.defineTask(RSA_KEYPAIR_TASK, async () => {
	try {
		await RSA_KeyPair_Maker(); // RSA 키페어를 생성하는 함수
		return {
			error: false,
		};
	} catch (error) {
		return {
			error: true,
		};
	}
});

export const registerBackgroundTask = async () => {
	await console.log("BackgroundTask ON")
	await BackgroundFetch.registerTaskAsync(RSA_KEYPAIR_TASK, {
		minimumInterval: 60 * 15, // 15분마다 실행
		stopOnTerminate: false, // 앱이 종료되더라도 실행
		startOnBoot: true, // 장치가 부팅하면 시작
	});
};