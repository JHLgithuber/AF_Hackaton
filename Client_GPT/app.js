var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var _this = this;
//app.ts
require('dotenv').config();
var OpenAI = require('openai');
var CryptoModule = require('./HybridCryptoModuleForNodeJS');
//import * as CryptoModule from './HybridCryptoModuleForNodeJS';
var _a = require('./ConnectionModule'), Messenger_IO = _a.Messenger_IO, UnHandled_Receiving_Message = _a.UnHandled_Receiving_Message, get_server_public_key = _a.get_server_public_key, get_server_private_key = _a.get_server_private_key;
var uuidv4 = require('uuid').v4;
var ChatIO = new Messenger_IO(process.env.MESSENGER_IO_URL);
var openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
var UserName = 'GPT_AI';
var UserID = 1000;
var AI_arr = [
    {
        role: 'system',
        content: '너는 공군 해커톤 본선에서 사용될 암호화 메신저의 대화 상대를 맡은 AI야. 네가 할 일은 일상적이면서도 자연스러우면서 작위적이지 않으지만, 공식적인 행사에 맞는 예시가 될 대화를 유지하는 것이야.',
    },
    { role: 'user', content: '안녕?', },
];
var onSend = function (newMessages) {
    if (newMessages === void 0) { newMessages = []; }
    return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                //console.log(newMessages);
                return [4 /*yield*/, newMessages.forEach(function (message) { return __awaiter(_this, void 0, void 0, function () {
                        var public_key_object, public_server_key_object, encrypted, SendingMessage;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    /*if (message.text === '/r') {
                                        // 테이블 삭제
                                        await Chat_DB.transaction((tx) => {
                                            tx.executeSql(
                                                `DROP TABLE IF EXISTS ${RoomName};`,
                                                [],
                                                (_, result) => {
                                                    console.log('Table Dropped:', result);
                                                    // 테이블 다시 생성
                                                    Make_new_DB();
                                                },
                                                (_, err) => {
                                                    console.log('Drop Table Error:', err);
                                                    return false;
                                                }
                                            );
                                        });
                                        await setMessages([]); // 화면에서 모든 메시지 제거
                                        return; // 이후 처리를 중단
                                    }*/
                                    //console.log(typeof parseInt(message._id, 10));
                                    //CryptoModule.Encryption();//메시지 암호화
                                    // 기존의 메시지 삽입 로직
                                    console.log('SendingMessage', message);
                                    return [4 /*yield*/, ChatIO.request_public_key('Give me your KEY by GPT_Client!!!')];
                                case 1:
                                    public_key_object = _a.sent();
                                    return [4 /*yield*/, get_server_public_key()];
                                case 2:
                                    public_server_key_object = _a.sent();
                                    console.log('public_server_key', public_server_key_object.public_key);
                                    return [4 /*yield*/, CryptoModule.Encryption(public_key_object.public_key, public_server_key_object.public_key, message.text)];
                                case 3:
                                    encrypted = _a.sent();
                                    SendingMessage = {
                                        ciphertext: encrypted.ciphertext,
                                        encrypted_AESKey: encrypted.server_encrypted_AESKey,
                                        public_key_hash: public_key_object.public_key_hash,
                                        server_key_hash: public_server_key_object.hash,
                                        createdAt: new Date(),
                                        user: {
                                            _id: UserID.toString(),
                                            name: UserName,
                                        },
                                    };
                                    return [4 /*yield*/, ChatIO.sendMessage(SendingMessage)];
                                case 4:
                                    _a.sent();
                                    AI_arr.push({ role: 'assistant', content: message.text });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    //console.log(newMessages);
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
var onReceive = function (newReceivingMessage) { return __awaiter(_this, void 0, void 0, function () {
    var Decryptied_Data, updatedMessage, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, CryptoModule.Decryption(newReceivingMessage.public_key_hash, newReceivingMessage.server_key_hash, newReceivingMessage.encrypted_AESKey, newReceivingMessage.ciphertext, null)];
            case 1:
                Decryptied_Data = _a.sent();
                updatedMessage = __assign(__assign({}, newReceivingMessage), { _id: uuidv4(), text: Decryptied_Data });
                return [4 /*yield*/, AI_arr.push({ role: 'user', content: Decryptied_Data })];
            case 2:
                _a.sent();
                return [4 /*yield*/, AI_request()];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                err_1 = _a.sent();
                console.error('Decryption failed:', err_1);
                return [3 /*break*/, 5];
            case 5:
                console.log('newReceivingMessage', newReceivingMessage);
                return [2 /*return*/];
        }
    });
}); };
function AI_request() {
    return __awaiter(this, void 0, void 0, function () {
        var completion, AI_response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (AI_arr.length >= 20) {
                        AI_arr.splice(1, AI_arr.length - 20);
                    }
                    return [4 /*yield*/, openai.chat.completions.create({
                            messages: AI_arr,
                            model: 'gpt-3.5-turbo',
                        })];
                case 1:
                    completion = _a.sent();
                    AI_response = completion.choices[0].message;
                    onSend([{ text: AI_response.content }]);
                    return [2 /*return*/];
            }
        });
    });
}
var intervalId = setInterval(function () {
    while (UnHandled_Receiving_Message.length) {
        onReceive(UnHandled_Receiving_Message[0]);
        UnHandled_Receiving_Message.shift();
    }
}, 1000); // 1초마다 반복
var intervalMakeKey = setInterval(function () {
    CryptoModule.RSA_KeyPair_Maker();
}, 120000); // 120초마다 반복
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            CryptoModule.Remove_RSA_KeyTable();
            AI_request();
            return [2 /*return*/];
        });
    });
}
main().catch(console.error); // 에러가 발생할 경우 출력
