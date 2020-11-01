import React, { useState } from "react";
import {
	Image,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Picker,
} from "react-native";
import Button from "../../components/Button/Button";
import styles from "./styles";
import { firebase } from "../../src/firebase/config";

export default function RegistrationScreen({ navigation }) {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [type, setSelectedType] = useState("Teacher");

	const onFooterLinkPress = () => {
		navigation.navigate("Login");
	};

	const onRegisterPress = () => {
		if (password !== confirmPassword) {
			alert("Passwords don't match.");
			return;
		}
		firebase
			.auth()
			.createUserWithEmailAndPassword(email, password)
			.then((response) => {
				const uid = response.user.uid;
				const data = {
					id: uid,
					email,
					fullName,
					type,
				};
				const usersRef = firebase.firestore().collection("users");
				usersRef
					.doc(uid)
					.set(data)
					.then(() => {
						navigation.navigate("Home", data);
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
			<View style={styles.container}>
				<Image
					style={styles.logo}
					source={require("../../assets/icon.png")}
				/>
				<View
					style={{
						alignItems: "center",
						height: 60,
						marginBottom: 10,
					}}
				>
					<Text>Please choose what you are:</Text>
					<Picker
						selectedValue={type}
						style={{
							height: 50,
							width: 150,
							overflow: "hidden",
							justifyContent: "center",
						}}
						onValueChange={(itemValue, itemIndex) =>
							setSelectedType(itemValue)
						}
					>
						<Picker.Item label="Teacher" value="Teacher" />
						<Picker.Item label="Student" value="Student" />
						<Picker.Item label="Parent" value="Parent" />
					</Picker>
				</View>
				<View
					style={{
						width: "80%",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<TextInput
						style={styles.input}
						placeholder="Full Name"
						placeholderTextColor="#aaaaaa"
						onChangeText={(text) => setFullName(text)}
						value={fullName}
						underlineColorAndroid="transparent"
						autoCapitalize="none"
					/>
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
					<TextInput
						style={styles.input}
						placeholderTextColor="#aaaaaa"
						secureTextEntry
						placeholder="Confirm Password"
						onChangeText={(text) => setConfirmPassword(text)}
						value={confirmPassword}
						underlineColorAndroid="transparent"
						autoCapitalize="none"
					/>
					<Button
						text="Create account"
						/*style={styles.button}*/
						style={{ width: "100%", marginTop: 5 }}
						onPress={() => onRegisterPress()}
					/>
				</View>

				<View style={styles.footerView}>
					<Text style={styles.footerText}>
						Already got an account?{" "}
						<Text
							onPress={onFooterLinkPress}
							style={styles.footerLink}
						>
							Log in
						</Text>
					</Text>
				</View>
			</View>
		</View>
	);
}
