# react-native-rsa
React native rsa crypto lib

## The use case
Initially this was created for encrypted messaging

Client would generate RSA key pairs and store private key locally and share the public key.

## How to use


```
npm install react-native-rsa
```
Generate RSA keys
```
var RSAKey = require('react-native-rsa');
const bits = 1024;
const exponent = '10001'; // must be a string
var rsa = new RSAKey();
var r = rsa.generate(bits, exponent);
var publicKey = rsa.RSAGetPublicString(); // return json encoded string
var privateKey = rsa.RSAGetPrivateString(); // return json encoded string
```

Encrypt

```
var rsa = new RSAKey();
rsa.setPublicString(publicKey);
var originText = 'sample String Value';
var encrypted = rsa.encrypt(originText);
```

Decrypt
```
rsa.setPrivateString(privateKey);
var decrypted = rsa.decrypt(encrypted); // decrypted == originText
```


## Credits
This lib uses Tom Wu's jsbn http://www-cs-students.stanford.edu/~tjw/jsbn/


## TODO: Still missing export to DER/PEM format

## Known issues:
* RSA encryption/decryption with this lib doesn't work well with other RSA libs (such as Node RSA). I have to use the same lib on both client and server to make it work
* In the future, consider to fix this issue and let it work with standard openssl lib.
* Node js may complain about 'window' is not defined. I just commented out the 'window' related codes in rng.js and it worked. (It look like just adding some extra randomness. Should still work without that part)
