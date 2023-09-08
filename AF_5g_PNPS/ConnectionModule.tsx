import io from 'socket.io-client';
import React, { useState } from 'react';

export var UnHandled_Receiving_Message = [];

export class Messenger_IO {
    constructor(serverUrl) {
        this.socket = io(serverUrl);
        console.log('Messenger_IO constructed', serverUrl);

        this.socket.on('connect', () => {
			console.log(this.socket);
            alert('Messenger_IO 연결');;
        });

        this.socket.on('receive_message', (text) => {
            console.log('받은 메시지: ', text);
            UnHandled_Receiving_Message.push(text);
            console.log('UnHandled_Receiving_Message', UnHandled_Receiving_Message);
        });
    }

    sendMessage(message) {
        console.log('Messenger_IO message', message);
        this.socket.emit('send_message', message);
    }
}