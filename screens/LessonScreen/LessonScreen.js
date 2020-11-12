import React, { useEffect, useReducer, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styles from "./styles";
import Button from "../../components/Button/Button";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as WebBrowser from "expo-web-browser";
import { firebase } from "../../src/firebase/config";

export default function LessonScreen({ navigation, route }) {
	const [lessonData, setLessonData] = useState();
	const [user, setUser] = useState();
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [docs, setDocs] = useState([]);

	useEffect(() => {
		setUser(route.params.user);
		setLessonData(route.params.data);

		if (loading) {
			firebase
				.storage()
				.ref("images/" + route.params.data.id)
				.listAll()
				.then((res) => {
					res.prefixes.forEach((folderRef) => {
						// All the prefixes under listRef.
						// You may call listAll() recursively on them.
						// console.log(folderRef);
						folderRef.forEach((hi) => {
							console.log("helllo", hi);
						});
					});
					res.items.forEach(async (itemRef) => {
						// All the items under listRef.
						itemRef.getDownloadURL().then((url) => {
							setImages([...images, url]);
						});
						//setImages([...images, url]);
					});
				})
				.catch((error) => {
					console.log(error);
					// Uh-oh, an error occurred!
				});
			firebase
				.storage()
				.ref("files/" + route.params.data.id)
				.listAll()
				.then((res) => {
					res.prefixes.forEach((folderRef) => {
						// All the prefixes under listRef.
						// You may call listAll() recursively on them.
						// console.log(folderRef);
					});
					res.items.forEach(async (itemRef) => {
						// All the items under listRef.
						itemRef.getDownloadURL().then((url) => {
							setDocs([...docs, url]);
						});
						//setImages([...images, url]);
					});

					setLoading(false);
				})
				.catch((error) => {
					console.log(error);
					// Uh-oh, an error occurred!
				});
		}
	}, []);

	if (loading) {
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

		const options = { quality: 0.3, base64: true };

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

		//console.log(imageName);

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

		setImages([...images, uri]);
		alert("Image uploaded successfully");
	};

	const addFile = async () => {
		let pickerResult = await DocumentPicker.getDocumentAsync();

		if (pickerResult.type != "success") {
			alert("Cancelled pick");
			return;
		}

		const uri = pickerResult.uri;

		const docName = uri.substring(uri.lastIndexOf("/") + 1, uri.length + 1);

		const response = await fetch(uri);

		const blob = await response.blob();

		firebase
			.storage()
			.ref()
			.child(`files/${lessonData.id}/${docName}`)
			.put(blob)
			.catch((error) => {
				alert(error);
			});

		setDocs([...docs, uri]);
		alert("Document uploaded successfully");
		console.log(pickerResult);
	};

	const turnInWork = async () => {};

	const openFile = async (uri, docName) => {
		WebBrowser.openBrowserAsync(uri);
		// FileSystem.downloadAsync(uri, FileSystem.documentDirectory + docName)
		// 	.then(({ uri }) => {
		// 		console.log("Finished downloading to ", uri);
		// 	})
		// 	.catch((error) => {
		// 		console.error(error);
		// 	});
	};

	const openImage = async (uri) => {
		WebBrowser.openBrowserAsync(uri);
	};

	return (
		<View style={styles.container}>
			<View
				style={{
					width: "80%",
					borderRadius: 3,
					padding: 5,
					margin: 10,
					backgroundColor: "lightblue",
				}}
			>
				<Text style={{ fontSize: 16 }}>Description: </Text>
				<Text
					style={{
						width: "100%",
						minHeight: 50,
						borderWidth: 2,
						padding: 5,
						backgroundColor: "white",
					}}
				>
					{lessonData.desc}
				</Text>
			</View>
			<View style={{ margin: 10, flexDirection: "row" }}>
				{images &&
					images.map((url, i) => {
						return (
							<TouchableOpacity
								key={i}
								style={{ margin: 5 }}
								onPress={() => {
									openImage(url);
								}}
							>
								<Image
									style={{ height: 200, width: 150 }}
									source={{ uri: url }}
								/>
							</TouchableOpacity>
						);
					})}
			</View>
			<View style={{ margin: 10 }}>
				<Text>Documents:</Text>
				{docs &&
					docs.map((uri, i) => {
						const docName = uri.substring(
							uri.lastIndexOf("/") + 1,
							uri.length + 1
						);

						return (
							<TouchableOpacity
								key={i}
								style={{
									margin: 5,
									borderWidth: 1,
									padding: 5,
								}}
								onPress={() => {
									openFile(uri, docName);
								}}
							>
								<Text>Document {i}</Text>
							</TouchableOpacity>
						);
					})}
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
