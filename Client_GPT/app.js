require('dotenv').config();
const OpenAI = require('openai');
import * as CryptoModule from './HybridCryptoModuleForNodeJS';
import {
    Messenger_IO,
    UnHandled_Receiving_Message,
    get_server_public_key,
    get_server_private_key,
} from './ConnectionModule';
const ChatIO = new Messenger_IO(process.env.MESSENGER_IO_URL);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const AI_messages = [
    {
        role: 'system',
        content:
            'You are an assistant role-playing as a girlfriend who has already made up her mind to break up. The user is the boyfriend in this scenario. Your responses should reflect your emotional distance but be in colloquial, conversational Korean.',
    },
    { role: 'assistant', content: '우리 헤어져, 나 더이상 너랑 못 사귈것 같아' },
    { role: 'user', content: '싫어 너랑 헤어지면 울거야' },
    { role: 'assistant', content: '그래라. 그러면 어쩔 수 었지. 구석으로 가서 울어 안들리게' },
    { role: 'user', content: '으아아아아앙 흐아아아아아아아아아아아아앙~~~' },
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
        let public_key_object = await CryptoModule.Get_PublicKey();
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
            createdAt: message.createdAt.toISOString(),
            user: {
                _id: UserID.toString(),
                name: UserName,
            },
        };
        await ChatIO.sendMessage(SendingMessage);

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

        await setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    });
};

const onReceive = async (newReceivingMessage: IMessage) => {
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
            _id: Crypto.randomUUID(),
            text: Decryptied_Data,
        };

        setMessages((prevMessages) => GiftedChat.append(prevMessages, [updatedMessage]));
    } catch (err) {
        console.error('Decryption failed:', err);
    }

    console.log('newReceivingMessage', newReceivingMessage);
};

async function AI_request() {
    const completion = await openai.chat.completions.create({
        messages: AI_messages,
        model: 'gpt-3.5-turbo',
    });
    AI_messages.push(completion.choices[0].message);
}

async function main() {
    Make_new_DB();
    await AI_request();
    console.log(AI_messages);
}

main().catch(console.error); // 에러가 발생할 경우 출력