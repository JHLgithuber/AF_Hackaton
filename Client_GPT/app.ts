//app.ts
require('dotenv').config();
const OpenAI = require('openai');
const CryptoModule = require('./HybridCryptoModuleForNodeJS');
//import * as CryptoModule from './HybridCryptoModuleForNodeJS';
const {
    Messenger_IO,
    UnHandled_Receiving_Message,
    get_server_public_key,
    get_server_private_key,
} = require('./ConnectionModule');
const { v4: uuidv4 } = require('uuid');
const ChatIO = new Messenger_IO(process.env.MESSENGER_IO_URL);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const UserName = 'GPT_AI';
const UserID = 1000;

let AI_arr = [
    {
        role: 'system',
        content:
            '너는 공군 해커톤 본선에서 사용될 암호화 메신저의 대화 상대를 맡은 AI야. 네가 할 일은 일상적이면서도 자연스러우면서 작위적이지 않으지만, 공식적인 행사에 맞는 예시가 될 대화를 유지하는 것이야.',
    },
    {role: 'user',content: '안녕?',},
];

const onSend = async (newMessages = []) => {
    //console.log(newMessages);
    await newMessages.forEach(async (message) => {
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
        let public_key_object = await ChatIO.request_public_key(
            'Give me your KEY by GPT_Client!!!'
        );
        let public_server_key_object = await get_server_public_key();
        console.log('public_server_key', public_server_key_object.public_key);
        let encrypted = await CryptoModule.Encryption(
            public_key_object.public_key,
            public_server_key_object.public_key,
            message.text
        );

        const SendingMessage = {
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
        await ChatIO.sendMessage(SendingMessage);
        AI_arr.push({ role: 'assistant', content: message.text });

        /*await Chat_DB.transaction((tx) => {
            tx.executeSql(
                `INSERT INTO ${RoomName} (UUID, send_date, sender,sender_name, receiver, peer_key_hash, server_key_hash, encrypt_AES_Key, encrypt_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    Crypto.randomUUID(),
                    SendingMessage.createdAt,
                    SendingMessage.user._id,
                    SendingMessage.user.name,
                    null, //수신자
                    SendingMessage.public_key_hash,
                    SendingMessage.server_key_hash, //서버키 해시
                    SendingMessage.encrypted_AESKey,
                    SendingMessage.ciphertext,
                ],
                (_, result) => {
                    console.log('Insert Success:', result);
                },
                (_, err) => {
                    console.log('Insert Error:', err);
                    return false;
                }
            );
        });*/

        //await setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    });
};

const onReceive = async (newReceivingMessage) => {
    // 메시지 수신 로직
    // 데이터베이스에 새로운 수신 메시지를 저장
    /*Chat_DB.transaction((tx) => {
        tx.executeSql(
            `INSERT INTO ${RoomName} (UUID, send_date, sender, sender_name, receiver, peer_key_hash, server_key_hash, encrypt_AES_Key, encrypt_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                Crypto.randomUUID(),
                newReceivingMessage.createdAt,
                newReceivingMessage.user._id,
                newReceivingMessage.user.name,
                null, //수신자
                newReceivingMessage.public_key_hash, //사용자 키 해시
                newReceivingMessage.server_key_hash, //서버 키 해시
                newReceivingMessage.encrypted_AESKey, //암호화된 AES Key
                newReceivingMessage.ciphertext,
            ],
            (_, result) => {
                console.log('Receive Insert Success:', result);
            },
            (_, err) => {
                console.log('Receive Insert Error:', err);
                return false;
            }
        );
    });*/

    try {
        const Decryptied_Data = await CryptoModule.Decryption(
            newReceivingMessage.public_key_hash,
            newReceivingMessage.server_key_hash,
            newReceivingMessage.encrypted_AESKey,
            newReceivingMessage.ciphertext,
            null
        );

        let updatedMessage = {
            ...newReceivingMessage,
            _id: uuidv4(),
            text: Decryptied_Data,
        };

        await AI_arr.push({ role: 'user', content: Decryptied_Data });
        await AI_request();
    } catch (err) {
        console.error('Decryption failed:', err);
    }

    console.log('newReceivingMessage', newReceivingMessage);
};

async function AI_request() {
    if (AI_arr.length >= 20) {
        AI_arr.splice(1, AI_arr.length - 20);
    }

    const completion = await openai.chat.completions.create({
        messages: AI_arr,
        model: 'gpt-3.5-turbo',
    });
    const AI_response = completion.choices[0].message;
    onSend([{ text: AI_response.content }]);
}

const intervalId = setInterval(() => {
    while (UnHandled_Receiving_Message.length) {
        onReceive(UnHandled_Receiving_Message[0]);
        UnHandled_Receiving_Message.shift();
    }
}, 1000); // 1초마다 반복

const intervalMakeKey = setInterval(() => {
    CryptoModule.RSA_KeyPair_Maker();
}, 100000); // 100초마다 반복

async function main() {
    AI_request();
    //await AI_request();
    //console.log(AI_messages);
}

main().catch(console.error); // 에러가 발생할 경우 출력