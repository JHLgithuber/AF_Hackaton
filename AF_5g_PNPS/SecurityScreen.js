//SecurityScreen.js
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import * as CryptoModule from './HybridCryptoModule';

export default function SecurityScreen() {
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
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text>SecurityScreen</Text>
			<TouchableOpacity
				style={styles.button}
				activeOpacity={0.4}
				onPress={CryptoModule.Remove_RSA_KeyTable}
			>
				<Text style={styles.buttonText}>Remove RSA KeyPair</Text>
			</TouchableOpacity>
		</View>
	);
}