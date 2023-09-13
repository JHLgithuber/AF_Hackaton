//SecurityScreen.js
import { useState, useEffect } from 'react';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Switch, TextInput } from 'react-native';
import * as CryptoModule from './HybridCryptoModule';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SecurityScreen(props) {
	const styles = StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: 'center',
			paddingHorizontal: 10,
		},
		button: {
			alignItems: 'center',
			backgroundColor: '#DDDDDD',
			padding: 10,
		},
		countContainer: {
			alignItems: 'center',
			padding: 10,
		},
	});

	// 새로운 state를 추가합니다. 여기서는 저장될 텍스트 값을 관리합니다.
	const [WS, setWS] = useState('');

	// 컴포넌트가 마운트될 때 AsyncStorage에서 값을 로딩합니다.
	useEffect(() => {
		const loadStoredWS = async () => {
			try {
				const value = await AsyncStorage.getItem('WS_address');
				if (value !== null) {
					setWS(value);
				}
			} catch (e) {
				console.error('Error loading data from AsyncStorage', e);
			}
		};

		loadStoredWS();
	}, []);

	// AsyncStorage에 텍스트 값을 저장하는 함수
	const saveStoredWS = async () => {
		try {
			await AsyncStorage.setItem('WS_address', WS);
		} catch (e) {
			console.error('Error saving data to AsyncStorage', e);
		}
	};

	const toggleSwitch = () => {
		props.setMaking_RSA_Key(!props.Making_RSA_Key);
	};

	return (
		<View style={{ padding: 20 }}>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Text>백그라운드에서 RSA KeyPair 생성</Text>
				<Switch
					trackColor={{ false: '#767577', true: '#81b0ff' }}
					thumbColor={props.Making_RSA_Key ? '#f5dd4b' : '#f4f3f4'}
					ios_backgroundColor="#3e3e3e"
					onValueChange={toggleSwitch}
					value={props.Making_RSA_Key}
				/>
			</View>
			<View
				style={{
					marginBottom: 20,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<TouchableOpacity
					style={{
						backgroundColor: 'red',
						padding: 10,
						borderRadius: 5,
					}}
					activeOpacity={0.4}
					onPress={CryptoModule.Remove_RSA_KeyTable}
				>
					<Text style={{ color: 'white' }}>RSA KeyPair 초기화</Text>
				</TouchableOpacity>
			</View>
			<View
                style={{
                    marginBottom: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        width: '100%',
                    }}
                    value={WS}
                    onChangeText={text => setWS(text)}
                    placeholder="메신저 백엔드 주소"
                />
                <TouchableOpacity
                    style={{
                        backgroundColor: 'green',
                        padding: 10,
                        borderRadius: 5,
                        marginTop: 10,
                    }}
                    onPress={saveStoredWS}
                >
                    <Text style={{ color: 'white' }}>저장</Text>
                </TouchableOpacity>
            </View>
		</View>
	);
}