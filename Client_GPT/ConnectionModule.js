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
exports.get_server_private_key = exports.get_server_public_key = exports.Messenger_IO = exports.UnHandled_Receiving_Message = void 0;
//ConnectionModule.ts
var io = require('socket.io-client');
var CryptoModule = require('./HybridCryptoModuleForNodeJS');
var myid = 1000;
//import React, { useState } from 'react';
exports.UnHandled_Receiving_Message = [];
var prev_message = null;
var Messenger_IO = /** @class */ (function () {
    function Messenger_IO(serverUrl) {
        this.connectSocket(serverUrl);
    }
    Messenger_IO.prototype.connectSocket = function (serverUrl) {
        var _this = this;
        this.socket = io(serverUrl);
        console.log('Messenger_IO constructed', serverUrl);
        this.socket.on('connect', function () {
            console.log(_this.socket);
            //alert('Messenger_IO 연결');
        });
        this.socket.on('disconnect', function () {
            console.log('Messenger_IO 연결 끊김');
            //alert('Messenger_IO 연결이 끊어졌습니다. 재연결을 시도합니다.');
            // 재연결 로직
            var reconnectInterval = setInterval(function () {
                if (_this.socket.connected) {
                    console.log('재연결 성공');
                    //alert('재연결에 성공했습니다.');
                    clearInterval(reconnectInterval);
                }
                else {
                    console.log('재연결 시도...');
                    _this.socket.connect();
                }
            }, 1000); // 1초마다 재연결 시도
        });
        this.socket.on('receive_message', function (text) {
            console.log('받은 메시지: ', text);
            // 특정 id를 무시하는 로직
            if (text.user._id === String(myid)) {
                console.log('id 1000을 무시합니다.');
                return;
            }
            if (text.ciphertext == prev_message) {
                console.log('중복수신을 무시합니다.');
                return;
            }
            exports.UnHandled_Receiving_Message.push(text);
            prev_message = text.ciphertext;
            console.log('UnHandled_Receiving_Message', exports.UnHandled_Receiving_Message);
        });
        this.socket.on('receive_request_public_key', function (data) { return __awaiter(_this, void 0, void 0, function () {
            var public_key_object;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('받은 request_public_key: ', data);
                        // 특정 id를 무시하는 로직
                        if (data.id === myid) {
                            console.log('id 1000을 무시합니다.');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, CryptoModule.Get_PublicKey()];
                    case 1:
                        public_key_object = _a.sent();
                        console.log('보낼 public_key', public_key_object);
                        this.socket.emit('response_public_key', {
                            id: myid,
                            public_key: public_key_object,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    };
    Messenger_IO.prototype.sendMessage = function (message) {
        console.log('Messenger_IO message', message);
        this.socket.emit('send_message', message);
    };
    Messenger_IO.prototype.request_public_key = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log('Messenger_IO request_public_key', data);
            _this.socket.emit('request_public_key', {
                id: myid,
                data: data,
            });
            _this.socket.on('receive_response_public_key', function (receive_data) {
                console.log('받은 receive_response_public_key: ', receive_data);
                // 특정 id를 무시하는 로직
                if (receive_data.id === myid) {
                    console.log('id 1000을 무시합니다.');
                    return;
                }
                resolve(receive_data.public_key);
            });
        });
    };
    return Messenger_IO;
}());
exports.Messenger_IO = Messenger_IO;
function get_server_public_key() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, server_public_key, server_hash, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(process.env.KEY_SERVER + '/generate_key')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    console.log("Server Public Key: ".concat(data.public_key));
                    server_public_key = JSON.stringify(data.public_key)
                        .replace(/\\/g, '')
                        .replace(/\s+/g, '')
                        .slice(1, -1);
                    console.log("Server Hash: ".concat(data.hash));
                    server_hash = JSON.stringify(data.hash)
                        .replace(/\\/g, '')
                        .replace(/\s+/g, '')
                        .slice(1, -1);
                    return [2 /*return*/, { public_key: server_public_key, hash: server_hash }];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error:', error_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.get_server_public_key = get_server_public_key;
function get_server_private_key(hash_value) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, private_key, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(process.env.KEY_SERVER + '/get_key/' + hash_value)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    private_key = JSON.stringify(data.private_key)
                        .replace(/\\/g, '')
                        .replace(/\s+/g, '')
                        .slice(2, -2);
                    console.log('Private Key:', private_key);
                    return [2 /*return*/, private_key];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error:', error_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.get_server_private_key = get_server_private_key;
