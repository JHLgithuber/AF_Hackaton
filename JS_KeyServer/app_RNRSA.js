const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

//const NodeRSA = require('node-rsa');
const RSAKey = require('react-native-rsa');
const bits = 4096; //안전한건 2048 이상, 이거 작으면 암호화 오류 발생!!
const exponent = '65537';
const app = express();
app.use(bodyParser.json());

const keyDatabase = {};

app.get('/generate_key', (req, res) => {
    const rsa = new RSAKey();
    rsa.generate(bits, exponent);
    const publicKey = rsa.getPublicString(); // return json encoded string
    const privateKey = rsa.getPrivateString(); // return json encoded string
    console.log('publicKey:\t', publicKey);
    console.log('privateKey:\t', privateKey);

    const publicKeyHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(publicKey))
        .digest('hex');

	
    keyDatabase[publicKeyHash] = JSON.stringify(privateKey);
/*
    // 데모 텍스트 암호화 및 복호화
    const demoText = 'This is a demo text.';
    const encrypted = rsa.encrypt(demoText);
	console.log('Encrypted:', encrypted);
    const decrypted = rsa.decrypt(encrypted);
    console.log('Decrypted:', decrypted);
*/
    res.json({
        hash: publicKeyHash,
        public_key: publicKey,
    });
});

app.get('/get_key/:hash_value', (req, res) => {
    const hashValue = req.params.hash_value;
    const privateKeyJSON = keyDatabase[hashValue];

    if (!privateKeyJSON) {
        res.status(404).send('Key not found');
        return;
    }

    res.json({ private_key: privateKeyJSON });
});

app.listen(6000, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:6000');
});