import React, { Component } from 'react';
import { View, Text } from 'react-native';

import 'react-native-rsa-expo';

var Start_MakingKey = new Date();
console.log("\n\n");
console.log(Start_MakingKey)

const RSAKey = require('react-native-rsa');
const bits = 2048;
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
	const originText = `{"d":"3dd6e6ea8a584f38b026c29bbe0f76e022bf89571f65c48ff6d97f011cfede45e9b60f310740344faa7ff3f46d2d4982b2bafb247a6cbd0aa6e51ee66340b03b8ac37d4bda9a2b5b93c441e24a7d2da157fce8128cb3a73c9852ffc4e869419e58cf38cf4a0bc6ac897c8903fa7faf0acb4e0a1c7db91225330faa0d99ac5637"}`;
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