'use strict';
jest.autoMockOff();

var RSAKey = require('../index.js');
const publicKey = '{"n":"860d193f420329a5db6cd7eee62f8dbdc710fbbfb87065f6a05de5b5a25af6320889767f7809d8fa167c0df1142bd329033407af06e51482bec5854e9af121a914402aff868589ef7db7924e478a2bed38d7367e4338ca23f57b6214e7bfcfd43102eb85570c7bfd1a3442909878cb82047227371d5cd8d7c7190332ebff0a6f","e":"10001"}';
const privateKey = '{"n":"860d193f420329a5db6cd7eee62f8dbdc710fbbfb87065f6a05de5b5a25af6320889767f7809d8fa167c0df1142bd329033407af06e51482bec5854e9af121a914402aff868589ef7db7924e478a2bed38d7367e4338ca23f57b6214e7bfcfd43102eb85570c7bfd1a3442909878cb82047227371d5cd8d7c7190332ebff0a6f","e":"10001","d":"30ae6114cfec461bad6c019f08890c7876ea7c024c00c586a306767d57d0a0c7dac1d0fec9a109e3087754b8d0127a44d29cfa8d5d7ba3cf376893d8cffbf1b4e6b33177d09ce0bd8a61b1661ccc828fd5ec65a7fb58f5960cbb5e85c44db1bf117c96bdfdaa220ffae415db689d0bea080f4e6c644156ecf643e7437e122301","p":"c1211509d92f269b070c4df3dada4a57f821a1fbcae230e60f354ab5af1ceb2651f526678f88e473fcf3347472c385b6b631ad1ebc705ca13d8f735aa3da639f","q":"b1b0986137bdfa6890d62a5e3aebf38554066dd36ec6cc5dcc9d91cf3a7dffa5d5767daaaebaecdff8cfa1f33428e02db4611b3a56f761201bba4b02d1c36731","dmp1":"66cc792a58d4643438b82ff61114086672c95433767697989d97bc40a1093f9192266f5ec86411563bda289da348b7afdda2eb8764be5a4fe938a62a24f565f9","dmq1":"60fb9c0fe3d6c327f3759126614e8b59c824c228d69b96cbd3746533101fd93af0297e297cb8f5b4c11ec2abf55a2211901438423d59441fbc428fd2781f08e1","coeff":"30065dadc7da627b6c564f6ece12040a18b7073822620f2cda8093e7083be82a1fa9f9922543b4c650750d8040ee6dda4ec67fbf161b6eb501bb1ee7f2079635"}';

describe('RSA Key', function () {
  it('generate', function () {
    const bits = 1024;
    const exponent = '65537'; // must be a string
    var rsa = new RSAKey();
    rsa.generate(bits, exponent);

    console.log('public', rsa.getPublicString());
    console.log('private', rsa.getPrivateString());
    var privateKey = JSON.parse(rsa.getPrivateString());
    /*
    for(var key in privateKey) {
      if (key  != 'e') {
        privateKey[key] = privateKey[key].toString('hex');
        console.log('key=' + key, 'length=' + privateKey[key].length);
      }
    }*/
    var modulus = privateKey.n;
    var privateExpo = privateKey.d;
    expect(modulus.length).toEqual(bits / 4);
    expect(privateExpo.length).toEqual(bits / 4);
    expect(privateKey.dmp1.length).toEqual(bits / 8);
    expect(privateKey.dmq1.length).toEqual(bits / 8);
  });

  it('encrypt decrypt', function () {
    var rsa = new RSAKey();
    rsa.setPublicString(publicKey);
    var originText = 'sample String Value';
    var encrypted = rsa.encrypt(originText);
    console.log('encrypted', encrypted);
    // start decrypt
    rsa.setPrivateString(privateKey);
    var decrypted = rsa.decrypt(encrypted);
    expect(decrypted).toEqual(originText);
  });

});