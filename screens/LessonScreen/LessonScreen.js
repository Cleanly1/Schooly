import React, { useEffect, useReducer, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./styles";
import Button from "../../components/Button/Button";
import * as ImagePicker from "expo-image-picker";
import { firebase } from "../../src/firebase/config";

export default function LessonScreen({ navigation, route }) {
	const [lessonData, setLessonData] = useState();
	const [user, setUser] = useState();

	useEffect(() => {
		setUser(route.params.user);
		setLessonData(route.params.data);
	}, []);

	if (lessonData === undefined) {
		return (
			<View>
				<Text>Loading...</Text>
			</View>
		);
	}

	const addImage = async () => {
		let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

		if (permissionResult.granted === false) {
			alert("Permission to access camera roll is required!");
			return;
		}

		const options = { quality: 0.5 };

		let pickerResult = await ImagePicker.launchImageLibraryAsync(options);

		if (pickerResult.cancelled != false) {
			alert("Cancelled pick");
			return;
		}

		const uri = pickerResult.uri;

		const imageName = uri.substring(
			uri.lastIndexOf("/") + 1,
			uri.length + 1
		);

		console.log(imageName);

		const response = await fetch(uri);

		const blob = await response.blob();

		firebase
			.storage()
			.ref()
			.child(`images/${lessonData.id}/${imageName}`)
			.put(blob)
			.catch((error) => {
				alert(error);
			});
	};

	const addFile = async () => {};

	const turnInWork = async () => {};

	return (
		<View style={styles.container}>
			<View
				style={{
					borderRadius: 3,
					padding: 5,
					margin: 10,
					backgroundColor: "lightblue",
				}}
			>
				<Text style={{ fontSize: 16 }}>Description: </Text>
				<Text
					style={{
						borderWidth: 2,
						padding: 5,
						backgroundColor: "white",
					}}
				>
					{lessonData.desc}
				</Text>
			</View>
			{user.type === "Teacher" ? (
				<View style={{ flexDirection: "row" }}>
					<Button
						style={{ marginRight: 5 }}
						text="Add one image to this lesson"
						onPress={() => {
							addImage();
						}}
					></Button>
					<Button
						style={{ marginLeft: 5 }}
						text="Add a file to this lesson"
						onPress={() => {
							addFile();
						}}
					></Button>
				</View>
			) : (
				<View>
					<Button
						text="Turn in your work"
						onPress={() => {
							turnInWork();
						}}
					/>
				</View>
			)}
		</View>
	);
}
