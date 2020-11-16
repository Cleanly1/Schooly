import { TouchableOpacity, Text, View } from "react-native";
import React from "react";
import styles from "./styles";

const RadioButton = ({ value, onPress, customStyle }) => {
	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.button} onPress={onPress}>
				<View style={[styles.indicator, customStyle]}></View>
			</TouchableOpacity>
			<Text style={styles.text}>{`${value}`}</Text>
		</View>
	);
};

export default RadioButton;
