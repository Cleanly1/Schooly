import React, { useEffect, useReducer, useState } from "react";
import { View, Text, TouchableOpacity, Image, Platform } from "react-native";
import styles from "./styles";
import Button from "../../components/Button/Button";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as WebBrowser from "expo-web-browser";
import { firebase } from "../../src/firebase/config";
import { TextInput } from "react-native-gesture-handler";

export default function LessonScreen({ navigation, route }) {
	const [lessonData, setLessonData] = useState();
	const [user, setUser] = useState();
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [docs, setDocs] = useState([]);
	const [updatedText, setUpdatedText] = useState();
	const [reload, setReload] = useState(true);

	useEffect(() => {
		const params = route.params;
		setUser(params.user);

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

			firebase
				.firestore()
				.collection("classes")
				.doc(params.classid)
				.collection("lessons")
				.doc(params.data.id)
				.get()
				.then((snapshot) => {
					setLessonData(snapshot.data());
					setUpdatedText(snapshot.data().desc);
				});

			firebase
				.firestore()
				.collection("classes")
				.doc(params.classid)
				.collection("lessons")
				.doc(params.data.id)
				.onSnapshot((snapshot) => {
					setLessonData(snapshot.data());
					setUpdatedText(snapshot.data().desc);
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

		await firebase
			.storage()
			.ref()
			.child(`images/${lessonData.id}/${imageName}`)
			.put(blob)
			.catch((error) => {
				alert(error);
			});

		firebase
			.storage()
			.ref()
			.child(`images/${lessonData.id}/${imageName}`)
			.getDownloadURL()
			.then((url) => {
				console.log(url);
				setImages([...images, url]);
			})
			.catch((error) => {
				console.log(error);
				// Uh-oh, an error occurred!
			});

		// setImages([...images, uri]);
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

		await firebase
			.storage()
			.ref()
			.child(`files/${lessonData.id}/${docName}`)
			.put(blob)
			.catch((error) => {
				alert(error);
			});

		firebase
			.storage()
			.ref()
			.child(`files/${lessonData.id}/${docName}`)
			.getDownloadURL()
			.then((url) => {
				console.log(url);
				setDocs([...docs, url]);
			})
			.catch((error) => {
				console.log(error);
				// Uh-oh, an error occurred!
			});

		alert("Document uploaded successfully");
	};

	const openFile = async (uri) => {
		if (Platform.OS === "ios") {
			WebBrowser.dismissBrowser();
		}

		await WebBrowser.openBrowserAsync(uri);
		// FileSystem.downloadAsync(uri, FileSystem.documentDirectory + docName)
		// 	.then(({ uri }) => {
		// 		console.log("Finished downloading to ", uri);
		// 	})
		// 	.catch((error) => {
		// 		console.error(error);
		// 	});

		if (Platform.OS === "ios") {
			WebBrowser.dismissBrowser();
		}
	};

	const turnInWork = async () => {};

	const updateText = async () => {
		let update = lessonData;

		update.desc = updatedText;

		const lessonRef = firebase
			.firestore()
			.collection("classes")
			.doc(route.params.classid)
			.collection("lessons")
			.doc(lessonData.id);

		await lessonRef.update(update);

		// setLessonData(update);
		// setUpdatedText(update.desc);

		console.log(lessonData);
		alert("Description updated");
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

				{user.type === "Teacher" ? (
					<View>
						<TextInput
							style={{
								width: "100%",
								minHeight: 50,
								borderWidth: 2,
								padding: 5,
								backgroundColor: "white",
							}}
							placeholderTextColor="#aaaaaa"
							onChangeText={(text) => setUpdatedText(text)}
							value={updatedText}
							underlineColorAndroid="transparent"
							multiline={true}
							autoCapitalize="none"
						/>
						<Button
							style={{
								borderWidth: 1,
								margin: 5,
								backgroundColor: "white",
								width: "50%",
							}}
							textStyle={{
								color: "lightblue",
								textShadowColor: "black",
							}}
							text="Update Text"
							onPress={() => {
								updateText();
							}}
						/>
					</View>
				) : (
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
				)}
			</View>
			<View>
				<Text style={styles.titleText}>Images: </Text>
				{images && images.length != 0 ? (
					<View style={{ margin: 10, flexDirection: "row" }}>
						{images.map((url, i) => {
							return (
								<TouchableOpacity
									key={i}
									style={{ margin: 5 }}
									onPress={() => {
										openFile(url);
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
				) : (
					<Text>No images have been added to this lesson</Text>
				)}
			</View>
			<View style={{ margin: 10 }}>
				<Text style={styles.titleText}>
					Documents: {docs.length != 0 ? "(Press to view)" : null}
				</Text>
				{docs && docs.length != 0 ? (
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
								<Text>{i}: Document </Text>
							</TouchableOpacity>
						);
					})
				) : (
					<Text>No documents have been added to this lesson</Text>
				)}
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
