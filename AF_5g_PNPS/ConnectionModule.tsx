import io from 'socket.io-client';
import React, { useState } from 'react';

export var UnHandled_Receiving_Message = [];

export class Messenger_IO {
    constructor(serverUrl) {
        this.socket = io(serverUrl);
        console.log('Messenger_IO constructed', serverUrl);

        this.socket.on('connect', () => {
            console.log(this.socket);
            alert('Messenger_IO 연결');
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

export async function get_server_public_key() {
    try {
        const response = await fetch('https://keyserver.run.goorm.site/generate_key');
        const data = await response.json();
        console.log(`Server Public Key: ${data.public_key}`);
		const server_public_key=JSON.stringify(data.public_key).replace(/\\/g, '').replace(/\s+/g, '').slice(1, -1);
        console.log(`Server Hash: ${data.hash}`);
		const server_hash=JSON.stringify(data.hash).replace(/\\/g, '').replace(/\s+/g, '').slice(1, -1);
		
        return {public_key:server_public_key,hash:server_hash};
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export async function get_server_private_key(hash_value) {
    try {
        const response = await fetch(`https://keyserver.run.goorm.site/get_key/${hash_value}`);
        const data = await response.json();
		const private_key=JSON.stringify(data.private_key).replace(/\\/g, '').replace(/\s+/g, '').slice(2, -2);
		console.log('Private Key:',private_key);
		
        return private_key;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
