import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { View, Text, LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
	LoginScreen,
	HomeScreen,
	RegistrationScreen,
	ClassScreen,
	LessonScreen,
	WorkScreen,
} from "./screens";
import { firebase } from "./src/firebase/config";

const Stack = createStackNavigator();

LogBox.ignoreLogs(["Setting a timer"]);

export default function App({ navigation, route }) {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState(null);

	useEffect(() => {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				firebase
					.firestore()
					.collection("users")
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
					<>
						<Stack.Screen
							name="Home"
							options={{
								headerShown: false,
								// headerTitleAlign: "center",
								// title: "Welcome " + user.fullName,
							}}
							component={HomeScreen}
						/>

						<Stack.Screen
							name="Class"
							options={{
								headerShown: false,
							}}
							component={ClassScreen}
						/>
						<Stack.Screen
							name="Lesson"
							component={LessonScreen}
							options={({ route }) => ({
								title: route.params.title,
								headerTitleAlign: "center",
							})}
						/>

						<Stack.Screen
							name="Work"
							component={WorkScreen}
							options={({ route }) => ({
								title: route.params.title,
								headerTitleAlign: "center",
							})}
						/>
					</>
				) : (
					<>
						<Stack.Screen name="Login" component={LoginScreen} />
						<Stack.Screen
							name="Registration"
							component={RegistrationScreen}
						/>
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
