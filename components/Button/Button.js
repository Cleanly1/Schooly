import { TouchableOpacity, Text } from "react-native";
import React from "react";
import styles from "./styles";

const Button = ({ onPress, text, style, children }) => {
	return (
		<TouchableOpacity style={[styles.button, style]} onPress={onPress}>
			{(text = !"" ? <Text style={styles.text}>{text}</Text> : null)}
			{children}
		</TouchableOpacity>
	);
};

export default Button;
