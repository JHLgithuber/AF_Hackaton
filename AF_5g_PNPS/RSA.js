import RSA from 'react-native-rsa-native';

// 공개키 및 개인키 생성
RSA.generate(2048) // 2048은 키 길이입니다.
	.then((keys) => {
		console.log('2048 bit key: ', keys);

		// 암호화 예제
		RSA.encrypt('1234', keys.public) // '1234'는 암호화할 메시지, keys.public은 공개키입니다.
			.then((encodedMessage) => {
				console.log('encoded message:', encodedMessage);

				// 복호화 예제
				RSA.decrypt(encodedMessage, keys.private) // encodedMessage는 암호화된 메시지, keys.private은 개인키입니다.
					.then((message) => {
						console.log('original message:', message); // 원래 메시지가 출력됩니다.
					});
			});
	});