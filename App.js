import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { View, Text, LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LoginScreen, HomeScreen, RegistrationScreen } from "./screens";
import { firebase } from "./src/firebase/config";

const Stack = createStackNavigator();

LogBox.ignoreLogs(["Setting a timer"]);

export default function App({ navigation }) {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState(null);

	useEffect(() => {
		const usersRef = firebase.firestore().collection("users");
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				usersRef
					.doc(user.uid)
					.get()
					.then((document) => {
						setUser(document.data());
						setLoading(false);
					})
					.catch((error) => {
						setLoading(false);
					});
			} else {
				setUser(null);
				setLoading(false);
			}
		});
	}, []);

	if (loading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Text>Loading...</Text>
			</View>
		);
	}
	return (
		<NavigationContainer>
			<Stack.Navigator>
				{user ? (
					<Stack.Screen
						name="Home"
						options={{
							headerTitleAlign: "center",
							title: "Welcome " + user.fullName,
						}}
					>
						{(props) => <HomeScreen {...props} extraData={user} />}
					</Stack.Screen>
				) : (
					<>
						<Stack.Screen
							name="Login"
							component={LoginScreen}
							extraData={user}
						/>
						<Stack.Screen
							name="Registration"
							component={RegistrationScreen}
							extraData={user}
						/>
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
