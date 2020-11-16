import React, { useEffect, useState } from "react";
import {
	Image,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	ScrollView,
} from "react-native";
import Button from "../../components/Button/Button";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as WebBrowser from "expo-web-browser";
import styles from "./styles";
import { firebase } from "../../src/firebase/config";

export default function WorkScreen({ navigation, route }) {
	const [lessonData, setLessonData] = useState();
	const [user, setUser] = useState("");
	const [docs, setDocs] = useState([]);
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	const [warned, setWarned] = useState(false);
	const [students, setStudents] = useState("");
	const [conversation, setConversation] = useState();
	const [haveWork, setHaveWork] = useState(false);

	useEffect(() => {
		let params = route.params;
		setUser(params.user);
		setLessonData(params.lessonData);
		setStudents(params.members);

		// firebase.firestore().collection("users").doc();
		if (loading) {
			firebase
				.storage()
				.ref(`work/${params.lessonData.id}/${params.student.id}/files`)
				.listAll()
				.then((res) => {
					// res.prefixes.forEach((folderRef) => {
					// 	// All the prefixes under listRef.
					// 	// You may call listAll() recursively on them.
					// 	// console.log(folderRef);
					// });
					res.items.forEach(async (itemRef) => {
						// All the items under listRef.

						itemRef.getDownloadURL().then((url) => {
							setDocs([
								...docs,
								{ name: itemRef.name, url: url },
							]);
						});
						//setImages([...images, url]);
					});

					//setLoading(false);
				})
				.catch((error) => {
					console.log(error);
					// Uh-oh, an error occurred!
				});

			firebase
				.storage()
				.ref(`work/${params.lessonData.id}/${params.student.id}/images`)
				.listAll()
				.then((res) => {
					// res.prefixes.forEach((folderRef) => {
					// 	// All the prefixes under listRef.
					// 	// You may call listAll() recursively on them.
					// 	// console.log(folderRef);
					// });

					res.items.forEach(async (itemRef) => {
						// All the items under listRef.
						itemRef.getDownloadURL().then((url) => {
							setImages([
								...images,
								{ name: itemRef.name, url: url },
							]);
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

		let unsub = firebase
			.firestore()
			.collection("classes")
			.doc(params.classid)
			.collection("lessons")
			.doc(params.lessonData.id)
			.collection("work")
			.doc(params.student.id)
			.onSnapshot((doc) => {
				if (!doc.exists) {
					setHaveWork(false);
					return;
				}
				setConversation(doc.data());

				setHaveWork(true);
			});

		return () => {
			unsub();
		};
	});

	const addImage = async () => {
		let permissionResult = await ImagePicker.requestCameraRollPermissionsAsync();

		if (permissionResult.granted === false) {
			alert("Permission to access camera roll is required!");
			return;
		}

		const options = { quality: 0.3 };

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

		const response = await fetch(uri);

		const blob = await response.blob();

		await firebase
			.storage()
			.ref()
			.child(`work/${lessonData.id}/${user.id}/images/${imageName}`)
			.put(blob)
			.catch((error) => {
				alert(error);
			});

		firebase
			.storage()
			.ref()
			.child(`work/${lessonData.id}/${user.id}/images/${imageName}`)
			.getDownloadURL()
			.then((url) => {
				setImages([...images, { name: imageName, url: url }]);
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

		const docName =
			pickerResult.name != undefined
				? pickerResult.name
				: uri.substring(uri.lastIndexOf("/") + 1, uri.length + 1);

		const response = await fetch(uri);

		const blob = await response.blob();

		await firebase
			.storage()
			.ref()
			.child(`work/${lessonData.id}/${user.id}/files/${docName}`)
			.put(blob)
			.catch((error) => {
				alert(error);
			});

		firebase
			.storage()
			.ref()
			.child(`work/${lessonData.id}/${user.id}/files/${docName}`)
			.getDownloadURL()
			.then((url) => {
				setDocs([...docs, { name: docName, url: url }]);
			})
			.catch((error) => {
				console.log(error);
				// Uh-oh, an error occurred!
			});

		alert("Document uploaded successfully");
	};

	const turnInWork = async () => {
		// if (docs.length > 0 && images.length > 0 && !warned) {
		// 	alert("Don´t forget to add your files and images");
		// 	setWarned(true);
		// 	return;
		// }

		let convo = { id: user.id, message: message };

		firebase
			.firestore()
			.collection("classes")
			.doc(route.params.classid)
			.collection("lessons")
			.doc(lessonData.id)
			.collection("work")
			.doc(user.id)
			.set({
				id: user.id,
				messages: [convo],
			});

		setMessage("");
	};

	const sendMessage = () => {
		let convo = { id: user.id, message: message };
		firebase
			.firestore()
			.collection("classes")
			.doc(route.params.classid)
			.collection("lessons")
			.doc(lessonData.id)
			.collection("work")
			.doc(route.params.student.id)
			.update({
				messages: firebase.firestore.FieldValue.arrayUnion(convo),
			});

		setConversation([conversation, convo]);

		setMessage("");
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

	if (loading) {
		return (
			<View style={styles.container}>
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View>
				<View>
					{images && images.length > 0 ? (
						<>
							<Text style={styles.titleText}>Images:</Text>
							{images.map((img, i) => {
								return (
									<TouchableOpacity
										key={i}
										style={{ margin: 5 }}
										onPress={() => {
											openFile(img.url);
										}}
									>
										<Image
											style={{ height: 200, width: 150 }}
											source={{ uri: img.url }}
										/>
									</TouchableOpacity>
								);
							})}
						</>
					) : null}
				</View>
				{docs && docs.length > 0 ? (
					<>
						<Text style={styles.titleText}>Documents:</Text>
						{docs.map((doc, i) => {
							return (
								<TouchableOpacity
									key={i}
									style={{ padding: 5, borderWidth: 2 }}
									onPress={() => {
										openFile(doc.url);
									}}
								>
									<Text>{doc.name}</Text>
								</TouchableOpacity>
							);
						})}
					</>
				) : null}
			</View>
			<View
				style={{
					padding: 5,
					width: "80%",
				}}
			>
				<Text style={styles.titleText}>Messages: </Text>
				<ScrollView
					style={{
						backgroundColor: "white",
						borderWidth: 2,
						padding: 5,
						paddingBottom: 20,
						height: 200,
					}}
				>
					<View style={{ marginBottom: 20 }}>
						{conversation && conversation.messages != undefined
							? conversation.messages.map((mess, i) => {
									const student = students.filter(
										(student) => {
											return student.id == mess.id;
										}
									);

									return (
										<Text key={i} style={{ fontSize: 15 }}>
											<Text
												style={{
													fontWeight: "bold",
													fontSize: 16,
												}}
											>
												{student[0].fullName}:
											</Text>{" "}
											{mess.message}
										</Text>
									);
							  })
							: null}
					</View>
				</ScrollView>
			</View>

			<TextInput
				style={styles.input}
				placeholder="Message"
				placeholderTextColor="#aaaaaa"
				onChangeText={(text) => setMessage(text)}
				value={message}
				underlineColorAndroid="transparent"
				autoCapitalize="none"
				multiline={true}
				numberOfLines={5}
			/>

			{user.type === "Student" ? (
				<View style={{ flexDirection: "row" }}>
					<Button
						style={{ margin: 5 }}
						text="Add Image"
						onPress={() => {
							addImage();
						}}
					/>
					<Button
						style={{ margin: 5 }}
						text="Add File"
						onPress={() => {
							addFile();
						}}
					/>
				</View>
			) : null}

			{haveWork === true ? (
				<Button
					text="Send message"
					onPress={() => {
						sendMessage();
					}}
				/>
			) : (
				<>
					<Button
						text="Turn in your work"
						onPress={() => {
							turnInWork();
						}}
					/>
				</>
			)}
		</View>
	);
}
