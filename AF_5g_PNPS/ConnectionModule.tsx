//ConnectionModule.tsx
import io from 'socket.io-client';
import Toast from 'react-native-root-toast';
import React, { useState } from 'react';
import * as CryptoModule from './HybridCryptoModule';
const myid = 100;
import AsyncStorage from '@react-native-async-storage/async-storage';

export var UnHandled_Receiving_Message = [];
let prev_message = null;

export class Messenger_IO {
	constructor() {
		this.connectSocket();
	}

	async connectSocket() {
		serverUrl = await AsyncStorage.getItem('WS_address');
		this.socket = io(serverUrl);
		console.log('Messenger_IO constructed', serverUrl);

		this.socket.on('connect', () => {
			console.log(this.socket);
			alert('Messenger_IO 연결');
		});

		this.socket.on('disconnect', () => {
			console.log('Messenger_IO 연결 끊김');
			alert('Messenger_IO 연결이 끊어졌습니다. 재연결을 시도합니다.');

			// 재연결 로직
			let reconnectInterval = setInterval(() => {
				if (this.socket.connected) {
					console.log('재연결 성공');
					alert('재연결에 성공했습니다.');
					clearInterval(reconnectInterval);
				} else {
					console.log('재연결 시도...');
					this.socket.connect();
				}
			}, 1000); // 1초마다 재연결 시도
		});

		this.socket.on('receive_message', (text) => {
			console.log('받은 메시지: ', text);
			// 특정 id를 무시하는 로직
			if (text.user._id === String(myid)) {
				console.log('id 100을 무시합니다.');
				return;
			}
			if (text.ciphertext == prev_message) {
				console.log('중복수신을 무시합니다.');
				return;
			}
			UnHandled_Receiving_Message.push(text);
			prev_message = text.ciphertext;
			console.log('UnHandled_Receiving_Message', UnHandled_Receiving_Message);
		});

		this.socket.on('receive_request_public_key', async (data) => {
			console.log('받은 request_public_key: ', data);
			// 특정 id를 무시하는 로직
			if (data.id === myid) {
				console.log('id 100을 무시합니다.');
				return;
			}
			const toast = Toast.show('상대가 공개키를 요청했습니다');
			const public_key_object = await CryptoModule.Get_PublicKey();
			console.log('보낼 public_key', public_key_object);
			this.socket.emit('response_public_key', {
				id: myid,
				public_key: public_key_object,
			});
		});
	}

	sendMessage(message) {
		console.log('Messenger_IO message', message);
		this.socket.emit('send_message', message);
	}

	request_public_key(data) {
		return new Promise((resolve, reject) => {
			console.log('Messenger_IO request_public_key', data);
			this.socket.emit('request_public_key', {
				id: myid,
				data: data,
			});
			this.socket.on('receive_response_public_key', (receive_data) => {
				console.log('받은 receive_response_public_key: ', receive_data);

				// 특정 id를 무시하는 로직
				if (receive_data.id === myid) {
					console.log('id 100을 무시합니다.');
					return;
				}
				resolve(receive_data.public_key);
			});
		});
	}
}

export async function get_server_public_key() {
	try {
		const response = await fetch('https://keyserver.run.goorm.site' + '/generate_key');
		const data = await response.json();
		console.log(`Server Public Key: ${data.public_key}`);
		const server_public_key = JSON.stringify(data.public_key)
			.replace(/\\/g, '')
			.replace(/\s+/g, '')
			.slice(1, -1);
		console.log(`Server Hash: ${data.hash}`);
		const server_hash = JSON.stringify(data.hash)
			.replace(/\\/g, '')
			.replace(/\s+/g, '')
			.slice(1, -1);

		return { public_key: server_public_key, hash: server_hash };
	} catch (error) {
		console.error('Error:', error);
		return null;
	}
}

export async function get_server_private_key(hash_value) {
	try {
		const response = await fetch('https://keyserver.run.goorm.site' + '/get_key/' + hash_value);
		const data = await response.json();
		const private_key = JSON.stringify(data.private_key)
			.replace(/\\/g, '')
			.replace(/\s+/g, '')
			.slice(2, -2);
		console.log('Private Key:', private_key);

		return private_key;
	} catch (error) {
		console.error('Error:', error);
		return null;
	}
}