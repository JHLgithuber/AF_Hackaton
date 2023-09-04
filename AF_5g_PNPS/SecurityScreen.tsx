//SecurityScreen.js
import { useState, useEffect } from 'react';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Switch } from 'react-native';
import * as CryptoModule from './HybridCryptoModule';


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
		</View>
	);
}