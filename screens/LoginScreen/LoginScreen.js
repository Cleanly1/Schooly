import React, { useState, useEffect } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import Button from "../../components/Button/Button";
import styles from "./styles";
import { firebase } from "../../src/firebase/config";

export default function LoginScreen({ navigation }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const onFooterLinkPress = () => {
		navigation.navigate("Registration");
	};

	const onLoginPress = () => {
		firebase
			.auth()
			.signInWithEmailAndPassword(email, password)
			.then((response) => {
				const uid = response.user.uid;
				const usersRef = firebase.firestore().collection("users");
				usersRef
					.doc(uid)
					.get()
					.then((firestoreDocument) => {
						if (!firestoreDocument.exists) {
							alert("User does not exist anymore.");
							return;
						}
						const user = firestoreDocument.data();
						// navigation.navigate("Home", user);
					})
					.catch((error) => {
						alert(error);
					});
			})
			.catch((error) => {
				alert(error);
			});
	};

	return (
		<View style={styles.container}>
			<View style={{ flex: 1, width: "100%" }}>
				<View style={{ width: "100%", alignItems: "center" }}>
					<Image
						style={styles.logo}
						source={require("../../assets/icon.png")}
					/>
				</View>
				<View style={{ width: "100%", alignItems: "center" }}>
					<TextInput
						style={styles.input}
						placeholder="E-mail"
						placeholderTextColor="#aaaaaa"
						onChangeText={(text) => setEmail(text)}
						value={email}
						underlineColorAndroid="transparent"
						autoCapitalize="none"
					/>
					<TextInput
						style={styles.input}
						placeholderTextColor="#aaaaaa"
						secureTextEntry
						placeholder="Password"
						onChangeText={(text) => setPassword(text)}
						value={password}
						underlineColorAndroid="transparent"
						autoCapitalize="none"
					/>
					<Button
						style={{ width: "80%", marginTop: 5 }}
						text="Login"
						onPress={() => onLoginPress()}
					/>
				</View>
				<View style={styles.footerView}>
					<Text style={styles.footerText}>
						Don't have an account?{"  "}
						<Text
							onPress={onFooterLinkPress}
							style={styles.footerLink}
						>
							Sign up
						</Text>
					</Text>
				</View>
			</View>
		</View>
	);
}
