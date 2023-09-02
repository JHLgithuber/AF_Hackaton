//import 'react-native-rsa-expo';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const KeyPair_DB = SQLite.openDatabase('Encrypted_Chat_Data.db');
const RSAKey = require('react-native-rsa');
const bits = 2048;
const exponent = '10001'; // must be a string. This is hex string. decimal = 65537

KeyPair_DB.transaction((tx) => {
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

export const RSA_KeyPair_Maker = async () => {
	console.log('Making_RSA_Key_Pair...');
	var Start_MakingKey = new Date();
	console.log(Start_MakingKey);

	const rsa = new RSAKey();
	rsa.generate(bits, exponent);
	const publicKey = rsa.getPublicString(); // return json encoded string
	const privateKey = rsa.getPrivateString(); // return json encoded string
	console.log(publicKey);
	console.log(privateKey);

	var End_MakingKey = new Date();
	console.log(End_MakingKey - Start_MakingKey);

	const publicKeyHash = await Crypto.digestStringAsync(
		Crypto.CryptoDigestAlgorithm.SHA512,
		publicKey
	);

	KeyPair_DB.transaction((tx) => {
		tx.executeSql(
			'INSERT INTO KeyTable (public_key_hash, public_key, encrypted_private_key, generated_date, used_date) VALUES (?, ?, ?, ?, ?)',
			[publicKeyHash, publicKey, privateKey, new Date().toISOString(), null],
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