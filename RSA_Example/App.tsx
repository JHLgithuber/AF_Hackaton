import React, { Component } from 'react';
import { View, Text } from 'react-native';

//import 'react-native-rsa-expo';

var Start_MakingKey = new Date();
console.log("\n\n");
console.log(Start_MakingKey)
const RSAKey = require('react-native-rsa');
const bits = 725;
const exponent = '10001'; // must be a string. This is hex string. decimal = 65537
const rsa = new RSAKey();
rsa.generate(bits, exponent);
const publicKey = rsa.getPublicString(); // return json encoded string
const privateKey = rsa.getPrivateString(); // return json encoded string
console.log(publicKey);
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

export default App;