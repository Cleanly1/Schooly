import React, { useEffect, useState, Component } from "react";
import { View, Text, TouchableOpacity, Image, Platform } from "react-native";
import styles from "./styles";
import Button from "../../components/Button/Button";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as WebBrowser from "expo-web-browser";
import { firebase } from "../../src/firebase/config";
import { ScrollView, TextInput } from "react-native-gesture-handler";

export default class LessonScreen extends Component {
	constructor(props) {
		super(props);

		this.state = {
			lessonData: "",
			user: "",
			loading: true,
			images: [],
			docs: [],
			updatedText: "",
			worklist: [],
			students: null,
		};
	}

	componentDidMount() {
		const params = this.props.route.params;
		this.setState({ user: params.user, students: params.members });

		if (this.state.loading) {
			firebase
				.storage()
				.ref("images/" + this.props.route.params.data.id)
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
							this.setState({
								images: [
									...this.state.images,
									{ name: itemRef.name, url: url },
								],
							});
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
				.ref("files/" + this.props.route.params.data.id)
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
							this.setState({
								docs: [
									...this.state.docs,
									{ name: itemRef.name, url: url },
								],
							});
						});
						//setImages([...images, url]);
					});

					this.setState({
						loading: false,
					});
				})
				.catch((error) => {
					console.log(error);
					// Uh-oh, an error occurred!
				});

			this.lesson = firebase
				.firestore()
				.collection("classes")
				.doc(params.classid)
				.collection("lessons")
				.doc(params.data.id)
				.onSnapshot((snapshot) => {
					this.setState({
						lessonData: snapshot.data(),
						updatedText: snapshot.data().desc,
					});
				});

			this.work = firebase
				.firestore()
				.collection("classes")
				.doc(params.classid)
				.collection("lessons")
				.doc(params.data.id)
				.collection("work")
				.onSnapshot((querySnapshot) => {
					let array = [];
					querySnapshot.forEach((doc) => {
						// doc.data() is never undefined for query doc snapshots
						array.push(doc.data());
					});
					this.setState({
						worklist: array,
					});
				});

			this.unsubscribe = firebase
				.firestore()
				.collection("classes")
				.doc(params.classid)
				.collection("lessons")
				.doc(params.data.id)
				.onSnapshot((snapshot) => {
					this.setState({
						lessonData: snapshot.data(),
						updatedText: snapshot.data().desc,
					});
				});
		}
	}

	componentWillUnmount() {
		this.unsubscribe();
		this.work();
		this.lesson();
	}

	addImage = async () => {
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
			.child(`images/${this.state.lessonData.id}/${imageName}`)
			.put(blob)
			.catch((error) => {
				alert(error);
			});

		firebase
			.storage()
			.ref()
			.child(`images/${this.state.lessonData.id}/${imageName}`)
			.getDownloadURL()
			.then((url) => {
				this.setState({
					images: [
						...this.state.images,
						{ name: imageName, url: url },
					],
				});
			})
			.catch((error) => {
				console.log(error);
				// Uh-oh, an error occurred!
			});

		// setImages([...images, uri]);
		alert("Image uploaded successfully");
	};

	addFile = async () => {
		let pickerResult = await DocumentPicker.getDocumentAsync();

		if (pickerResult.type != "success") {
			alert("Cancelled pick");
			return;
		}

		const uri = pickerResult.uri;

		let docName =
			pickerResult.name != undefined
				? pickerResult.name
				: uri.substring(uri.lastIndexOf("/") + 1, uri.length + 1);

		const response = await fetch(uri);

		const blob = await response.blob();

		await firebase
			.storage()
			.ref()
			.child(`files/${this.state.lessonData.id}/${docName}`)
			.put(blob)
			.catch((error) => {
				alert(error);
			});

		firebase
			.storage()
			.ref()
			.child(`files/${this.state.lessonData.id}/${docName}`)
			.getDownloadURL()
			.then((url) => {
				this.setState({
					docs: [...this.state.docs, { name: docName, url: url }],
				});
			})
			.catch((error) => {
				console.log(error);
				// Uh-oh, an error occurred!
			});

		alert("Document uploaded successfully");
	};

	openFile = async (uri) => {
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

	turnInWork = async () => {
		this.props.navigation.navigate("Work", {
			user: this.state.user,
			lessonData: this.state.lessonData,
			classid: this.props.route.params.classid,
			members: this.props.route.params.members,
			student: this.state.user,
		});
	};

	goToWork = (student) => {
		this.props.navigation.navigate("Work", {
			user: this.state.user,
			lessonData: this.state.lessonData,
			classid: this.props.route.params.classid,
			members: this.props.route.params.members,
			student: student,
		});
	};

	updateText = async () => {
		let update = this.state.lessonData;

		update.desc = this.state.updatedText;

		const lessonRef = firebase
			.firestore()
			.collection("classes")
			.doc(this.props.route.params.classid)
			.collection("lessons")
			.doc(this.state.lessonData.id);

		await lessonRef.update(update);

		// setLessonData(update);
		// setUpdatedText(update.desc);

		alert("Description updated");
	};

	render() {
		if (this.state.loading) {
			return (
				<View>
					<Text>Loading...</Text>
				</View>
			);
		}
		return (
			<View style={styles.container}>
				<View
					style={{
						width: "80%",
						borderRadius: 3,
						padding: 5,
						margin: 10,
					}}
				>
					<Text
						style={{
							fontSize: 18,
							fontWeight: "bold",
							marginBottom: 5,
						}}
					>
						Description:{" "}
					</Text>

					{this.state.user.type === "Teacher" ? (
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
								onChangeText={(text) =>
									this.setState({ updatedText: text })
								}
								value={this.state.updatedText}
								underlineColorAndroid="transparent"
								multiline={true}
								autoCapitalize="none"
							/>
							<Button
								style={{
									borderWidth: 1,
									margin: 5,
									width: "50%",
								}}
								textStyle={{
									textShadowColor: "black",
								}}
								text="Update Text"
								onPress={() => {
									this.updateText();
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
							{this.state.updatedText != undefined
								? this.state.updatedText
								: null}
						</Text>
					)}
				</View>
				<View>
					<Text style={styles.titleText}>Images: </Text>
					{this.state.images && this.state.images.length != 0 ? (
						<View style={{ margin: 10, flexDirection: "row" }}>
							{this.state.images.map((imgData, i) => {
								return (
									<TouchableOpacity
										key={i}
										style={{ margin: 5 }}
										onPress={() => {
											this.openFile(imgData.url);
										}}
									>
										<Image
											style={{ height: 200, width: 150 }}
											source={{ uri: imgData.url }}
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
						Documents:{" "}
						{this.state.docs.length != 0 ? "(Press to view)" : null}
					</Text>
					{this.state.docs && this.state.docs.length != 0 ? (
						this.state.docs.map((doc, i) => {
							return (
								<TouchableOpacity
									key={i}
									style={{
										margin: 5,
										borderWidth: 1,
										padding: 5,
										width: "30%",
									}}
									onPress={() => {
										this.openFile(doc.url, doc.name);
									}}
								>
									<Text>{doc.name} </Text>
								</TouchableOpacity>
							);
						})
					) : (
						<Text>No documents have been added to this lesson</Text>
					)}
				</View>
				{this.state.user.type === "Teacher" ? (
					<View style={{ flexDirection: "row" }}>
						<Button
							style={{ marginRight: 5 }}
							text="Add one image to this lesson"
							onPress={() => {
								this.addImage();
							}}
						></Button>
						<Button
							style={{ marginLeft: 5 }}
							text="Add a file to this lesson"
							onPress={() => {
								this.addFile();
							}}
						></Button>
					</View>
				) : (
					<View style={{ width: "80%" }}>
						<Button
							text="Turn in your work"
							onPress={() => {
								this.turnInWork();
							}}
						/>
					</View>
				)}
				{this.state.user.type === "Teacher" ? (
					<View
						style={{
							flex: 1,
							width: "100%",
							alignItems: "flex-start",
							margin: 10,
							paddingHorizontal: "22%",
						}}
					>
						<Text style={styles.titleText}>Students work:</Text>
						<ScrollView
							style={[styles.list, { paddingBottom: 20 }]}
						>
							{this.state.worklist &&
								this.state.worklist.map((work, i) => {
									const student = this.state.students.filter(
										(student) => {
											return student.id == work.id;
										}
									)[0];

									return (
										<TouchableOpacity
											key={i}
											style={{
												flex: 1,
												alignItems: "flex-start",
												padding: 5,
												borderBottomWidth: 1,
												borderColor: "grey",
												maxHeight: 35,
												margin: 5,
											}}
											onPress={() => {
												this.goToWork(student);
											}}
										>
											<Text>{student.fullName}</Text>
										</TouchableOpacity>
									);
								})}
						</ScrollView>
					</View>
				) : null}
			</View>
		);
	}
}
