import io from 'socket.io-client';
//import { UnHandled_Receiving_Message } from './ChatScreen';

export const UnHandled_Receiving_Message = [];

export class Messenger_IO {
    constructor(serverUrl) {
        this.socket = io(serverUrl);
        console.log('Messenger_IO constructed', serverUrl);

        this.socket.on('connect', () => {
            if (this.socket && this.socket.request) {
                const { url } = this.socket.request;
                console.log(`연결됨: ${url}`);
            }
        });

        this.socket.on('receive_message', (text) => {
            console.log('받은 메시지: ',text);
            UnHandled_Receiving_Message.push(text);
        });
    }

    sendMessage(message) {
        console.log('Messenger_IO message', message);
        this.socket.emit('send_message', message);
    }
}