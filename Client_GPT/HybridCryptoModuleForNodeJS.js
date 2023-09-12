"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get_PublicKey = exports.Decryption = exports.Encryption = exports.RSA_KeyPair_Maker = exports.Remove_RSA_KeyTable = exports.Get_KeyStore_PrivateKey = void 0;
//HybridCryptoMosule.ts
//import 'react-native-rsa-expo';
//https://www.npmjs.com/package/react-native-rsa-expo
//https://www.npmjs.com/package/crypto-js
//import React, { useState, useEffect } from 'react';
//import * as SQLite from 'expo-sqlite';
//import * as Crypto from 'expo-crypto';
//import * as TaskManager from 'expo-task-manager';
//import * as BackgroundFetch from 'expo-background-fetch';
//import { InteractionManager } from 'react-native';
//import { self } from 'react-native-workers';
//import * as SecureStore from 'expo-secure-store';
//import AsyncStorage from '@react-native-async-storage/async-storage';
var base64 = require('base-64');
var CryptoJS = require('crypto-js');
var Level = require('level').Level;
//import Toast from 'react-native-root-toast';
var get_server_private_key = require('./ConnectionModule').get_server_private_key;
var KeyStore_db = new Level('./KeyStore_PublicKey');
var crypto = require('crypto');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('Encrypted_Chat_Data.db');
var RSAKey = require('react-native-rsa');
var bits = 512; //안전한건 2048 이상
var exponent = '65537'; // must be a string. This is hex string. decimal = 65537
function Get_KeyStore_PrivateKey(authenticationPrompt) {
    return __awaiter(this, void 0, void 0, function () {
        var KeyStore_PrivateKey, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, KeyStore_db.get('KeyStore_PrivateKey')];
                case 1:
                    KeyStore_PrivateKey = _a.sent();
                    if (KeyStore_PrivateKey) {
                        console.log('Get_KeyStore_PrivateKey', KeyStore_PrivateKey);
                        return [2 /*return*/, KeyStore_PrivateKey];
                    }
                    else {
                        RSA_KeyPair_Maker();
                    }
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.log('Get_KeyStore_PrivateKey', e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.Get_KeyStore_PrivateKey = Get_KeyStore_PrivateKey;
function Get_KeyStore_PublicKey() {
    return __awaiter(this, void 0, void 0, function () {
        var KeyStore_PublicKey, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, KeyStore_db.get('KeyStore_PublicKey')];
                case 1:
                    KeyStore_PublicKey = _a.sent();
                    if (KeyStore_PublicKey !== null) {
                        console.log('Get_KeyStore_PublicKey', KeyStore_PublicKey);
                        return [2 /*return*/, KeyStore_PublicKey];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    console.log('Get_KeyStore_PublicKey', e_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function Set_KeyStore_Key() {
    return __awaiter(this, void 0, void 0, function () {
        var rsa, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rsa = new RSAKey();
                    return [4 /*yield*/, rsa.generate(bits, exponent)];
                case 1:
                    _a.sent();
                    console.log('Set_KeyStore_Key', rsa.getPublicString(), rsa.getPrivateString());
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, KeyStore_db.put('KeyStore_PublicKey', rsa.getPublicString())];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, KeyStore_db.put('KeyStore_PrivateKey', rsa.getPrivateString())];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_3 = _a.sent();
                    console.log('Set_KeyStore_Key', e_3);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function Make_RSA_KeyTable() {
    db.serialize(function () {
        db.run("CREATE TABLE IF NOT EXISTS KeyTable (\n      public_key_hash TEXT PRIMARY KEY NOT NULL,\n      public_key TEXT NOT NULL,\n      encrypted_private_key TEXT NOT NULL,\n      encrypted_AES_key TEXT NOT NULL,\n      generated_date TEXT NOT NULL,\n      used_date TEXT\n    );", [], function (err) {
            if (err) {
                console.log('CREATE Table Error:', err);
                return;
            }
            console.log('Table CREATE:', this);
        });
    });
}
function Remove_RSA_KeyTable() {
    db.serialize(function () {
        db.run('DROP TABLE IF EXISTS KeyTable;', [], function (err) {
            if (err) {
                console.log('Drop Table Error:', err);
                return;
            }
            console.log('Table Dropped:', this);
            // 테이블 다시 생성
            RSA_KeyPair_Maker();
            Set_KeyStore_Key();
        });
    });
}
exports.Remove_RSA_KeyTable = Remove_RSA_KeyTable;
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
function RSA_KeyPair_Maker() {
    return __awaiter(this, void 0, void 0, function () {
        var Start_MakingKey, rsa, publicKey_1, privateKey, End_MakingKey, publicKeyHash_1, rsa_key, _a, _b, _c, _d, _e, _f, randomBytes, AESKey, encrypted_privateKey_1, encrypted_AES_key_1, error_1;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    Make_RSA_KeyTable();
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 6, , 7]);
                    console.log('Making_RSA_Key_Pair...');
                    Start_MakingKey = new Date().getTime();
                    console.log('MakingKey Time:\t', Start_MakingKey);
                    rsa = new RSAKey();
                    return [4 /*yield*/, rsa.generate(bits, exponent)];
                case 2:
                    _g.sent();
                    publicKey_1 = rsa.getPublicString();
                    privateKey = rsa.getPrivateString();
                    console.log('publicKey:\t', publicKey_1);
                    console.log('privateKey:\t', privateKey);
                    End_MakingKey = new Date().getTime();
                    console.log('Required Time:\t', End_MakingKey - Start_MakingKey);
                    publicKeyHash_1 = CryptoJS.SHA512(publicKey_1).toString(CryptoJS.enc.Hex);
                    console.log('publicKeyHash:\t', publicKeyHash_1);
                    rsa_key = new RSAKey();
                    _b = (_a = console).log;
                    return [4 /*yield*/, Get_KeyStore_PublicKey()];
                case 3:
                    _b.apply(_a, [_g.sent()]);
                    _d = (_c = console).log;
                    return [4 /*yield*/, Get_KeyStore_PublicKey()];
                case 4:
                    _d.apply(_c, [typeof (_g.sent())]);
                    _f = (_e = rsa_key).setPublicString;
                    return [4 /*yield*/, Get_KeyStore_PublicKey()];
                case 5:
                    _f.apply(_e, [_g.sent()]);
                    console.log('rsa_key.setPublicString');
                    randomBytes = crypto.randomBytes(32);
                    AESKey = base64.encode(String.fromCharCode.apply(null, randomBytes));
                    encrypted_privateKey_1 = CryptoJS.AES.encrypt(privateKey, AESKey).toString();
                    encrypted_AES_key_1 = rsa_key.encrypt(AESKey);
                    console.log('encrypted_privateKey:\t', encrypted_AES_key_1);
                    db.serialize(function () {
                        db.run('INSERT INTO KeyTable (public_key_hash, public_key, encrypted_private_key, encrypted_AES_key, generated_date, used_date) VALUES (?, ?, ?, ?, ?, ?)', [
                            publicKeyHash_1,
                            publicKey_1,
                            encrypted_privateKey_1,
                            encrypted_AES_key_1,
                            new Date().toISOString(),
                            null,
                        ], function (err) {
                            if (err) {
                                console.log('INSERT Key ERROR:', err);
                                return;
                            }
                            console.log('INSERT Key:', this.lastID); // 마지막에 삽입된 레코드의 ID를 출력합니다.
                        });
                    });
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _g.sent();
                    console.error('An error occurred:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.RSA_KeyPair_Maker = RSA_KeyPair_Maker;
//상대의 공개키로 암호화
function Encryption(publicKey, serverKey, data) {
    try {
        var rsa = new RSAKey();
        var rsa_server = new RSAKey();
        console.log('publicKey', publicKey);
        rsa.setPublicString(publicKey);
        console.log('serverKey', serverKey);
        rsa_server.setPublicString(serverKey);
        // AES 암호화 키 생성
        var randomBytes = crypto.randomBytes(32);
        var AESKey = base64.encode(String.fromCharCode.apply(null, randomBytes));
        console.log('AESKey', AESKey);
        //console.log("AESKey in Base64:", typeof(AESKey));
        // Base64 디코딩하여 WordArray 형식으로 변환
        //const AESKeyWordArray = CryptoJS.enc.Base64.parse(AESKey);
        var ciphertext = CryptoJS.AES.encrypt(data, AESKey).toString();
        console.log('ciphertext', ciphertext);
        var encrypted_AESKey = rsa.encrypt(AESKey);
        console.log('encrypted_AESKey', encrypted_AESKey);
        var server_encrypted_AESKey = rsa_server.encrypt(encrypted_AESKey);
        console.log('server_encrypted_AESKey', server_encrypted_AESKey);
        return { ciphertext: ciphertext, server_encrypted_AESKey: server_encrypted_AESKey };
    }
    catch (error) {
        console.error('Encryption failed:', error);
        return null;
    }
}
exports.Encryption = Encryption;
//자신의 비밀키로 복호화
function Decryption(public_key_hash, server_key_hash, encrypt_AES_Key, ciphertext, preReady_private_key) {
    return __awaiter(this, void 0, void 0, function () {
        var encrypted_privateKey_2, encrypted_AES_key_for_key_1, rsa_key, _a, _b, AES_Key, privateKey_bytes, privateKey, rsa_server, server_private_key, server_decrypt_AES_key, rsa, Data_AES_Key, bytes, originalData, e_4;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 14, , 15]);
                    encrypted_privateKey_2 = null;
                    encrypted_AES_key_for_key_1 = null;
                    console.log('public_key_hash is exist?', public_key_hash);
                    console.log('server_key_hash is exist?', server_key_hash);
                    console.log('encrypt_AES_Key is exist?', encrypt_AES_Key);
                    console.log('ciphertext is exist?', ciphertext);
                    console.log('preReady_private_key is exist?', preReady_private_key);
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            db.serialize(function () {
                                db.get('SELECT encrypted_private_key, encrypted_AES_key FROM KeyTable WHERE public_key_hash = ?', [public_key_hash], function (err, row) {
                                    if (err) {
                                        reject(err); // SQL 에러를 reject로 넘김
                                        return;
                                    }
                                    if (row) {
                                        try {
                                            encrypted_privateKey_2 = row.encrypted_private_key;
                                            encrypted_AES_key_for_key_1 = row.encrypted_AES_key;
                                            resolve(null);
                                        }
                                        catch (e) {
                                            reject(e); // 다른 에러를 reject로 넘김
                                        }
                                    }
                                    else {
                                        reject(new Error('No matching record found')); // 매칭되는 레코드가 없을 경우 에러를 reject로 넘김
                                    }
                                });
                            });
                        }).catch(function (error) {
                            // Promise에 대한 에러 핸들링
                            console.log('SQL or Promise Error: ', error);
                            throw error; // 에러를 상위로 전파
                        })];
                case 1:
                    _c.sent();
                    if (encrypted_privateKey_2 === null) {
                        console.log('encrypted_privateKey is null');
                        return [2 /*return*/, null];
                    }
                    rsa_key = new RSAKey();
                    if (!preReady_private_key) return [3 /*break*/, 2];
                    rsa_key.setPrivateString(preReady_private_key);
                    return [3 /*break*/, 4];
                case 2:
                    _b = (_a = rsa_key).setPrivateString;
                    return [4 /*yield*/, Get_KeyStore_PrivateKey('복호화중 KeyStore_Key에 접근합니다')];
                case 3:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 4;
                case 4: return [4 /*yield*/, rsa_key.decrypt(encrypted_AES_key_for_key_1)];
                case 5:
                    AES_Key = _c.sent();
                    console.log('AES_KEY=rsa_key.decrypt', AES_Key);
                    return [4 /*yield*/, CryptoJS.AES.decrypt(encrypted_privateKey_2, AES_Key)];
                case 6:
                    privateKey_bytes = _c.sent();
                    return [4 /*yield*/, privateKey_bytes.toString(CryptoJS.enc.Utf8)];
                case 7:
                    privateKey = _c.sent();
                    console.log('privateKey', privateKey);
                    rsa_server = new RSAKey();
                    return [4 /*yield*/, get_server_private_key(server_key_hash)];
                case 8:
                    server_private_key = _c.sent();
                    console.log('server_private_key', server_private_key);
                    rsa_server.setPrivateString(server_private_key);
                    console.log('encrypt_AES_Key', encrypt_AES_Key);
                    return [4 /*yield*/, rsa_server.decrypt(encrypt_AES_Key)];
                case 9:
                    server_decrypt_AES_key = _c.sent();
                    console.log('server_decrypt_AES_key', server_decrypt_AES_key);
                    rsa = new RSAKey();
                    return [4 /*yield*/, rsa.setPrivateString(privateKey)];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, rsa.decrypt(server_decrypt_AES_key)];
                case 11:
                    Data_AES_Key = _c.sent();
                    console.log('Data_AES_Key', Data_AES_Key);
                    return [4 /*yield*/, CryptoJS.AES.decrypt(ciphertext, Data_AES_Key)];
                case 12:
                    bytes = _c.sent();
                    return [4 /*yield*/, bytes.toString(CryptoJS.enc.Utf8)];
                case 13:
                    originalData = _c.sent();
                    console.log('originalData', originalData);
                    return [2 /*return*/, originalData];
                case 14:
                    e_4 = _c.sent();
                    console.log('Decryption ERROR: ', e_4);
                    return [2 /*return*/, 'Decryption ERROR: ' + e_4];
                case 15: return [2 /*return*/];
            }
        });
    });
}
exports.Decryption = Decryption;
function Get_PublicKey() {
    var _this = this;
    //미사용 Key Pair 추출
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            db.serialize(function () {
                db.get("SELECT public_key, public_key_hash FROM KeyTable\n         ORDER BY\n         CASE WHEN used_date IS NULL THEN 1 ELSE 2 END ASC,\n         CASE WHEN used_date IS NULL THEN generated_date ELSE used_date END ASC\n         LIMIT 1;", [], function (err, row) { return __awaiter(_this, void 0, void 0, function () {
                    var newPublicKey, newPublicKey;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!err) return [3 /*break*/, 5];
                                console.log('Select KeyTable for Get_PublicKey ERROR:', err);
                                if (!(err.message && err.message.includes('no such table: KeyTable'))) return [3 /*break*/, 3];
                                // 'KeyTable' 테이블이 없을 때 수행할 작업
                                return [4 /*yield*/, RSA_KeyPair_Maker()];
                            case 1:
                                // 'KeyTable' 테이블이 없을 때 수행할 작업
                                _a.sent();
                                return [4 /*yield*/, Get_PublicKey()];
                            case 2:
                                newPublicKey = _a.sent();
                                resolve(newPublicKey);
                                return [3 /*break*/, 4];
                            case 3:
                                // 그 외의 에러에 대한 처리
                                reject(err);
                                _a.label = 4;
                            case 4: return [2 /*return*/];
                            case 5:
                                if (!row) return [3 /*break*/, 6];
                                console.log('Select from KeyTable for Get_PublicKey:', row);
                                console.log('Select타입은', typeof row);
                                resolve(row);
                                return [3 /*break*/, 9];
                            case 6: return [4 /*yield*/, RSA_KeyPair_Maker()];
                            case 7:
                                _a.sent();
                                return [4 /*yield*/, Get_PublicKey()];
                            case 8:
                                newPublicKey = _a.sent();
                                resolve(newPublicKey);
                                _a.label = 9;
                            case 9: return [2 /*return*/];
                        }
                    });
                }); });
            });
            return [2 /*return*/];
        });
    }); });
}
exports.Get_PublicKey = Get_PublicKey;
