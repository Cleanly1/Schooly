import React, { useEffect, useState } from "react";
import { Text, View, ScrollView, TextInput } from "react-native";
import styles from "./styles";
import Button from "../../components/Button/Button";
import { firebase } from "../../src/firebase/config";

export default function HomeScreen({ navigation, extraData }, props) {
	const [user, setUser] = useState("");
	const [id, setId] = useState("");
	const [classes, setClasses] = useState([]);
	const [title, setTitle] = useState("");
	const [loading, setLoading] = useState(true);
	const [show, setShow] = useState(false);
	const [classID, setClassID] = useState("");
	const [joinClassID, setJoinClassID] = useState("");
	const [classIDs, setClassIDs] = useState({});

	useEffect(() => {
		const uid = firebase.auth().currentUser.uid;
		const userRef = firebase.firestore().collection("users").doc(uid);

		if (loading) {
			userRef.get().then((firestoreDocument) => {
				if (!firestoreDocument.exists) {
					alert("User does not exist anymore.");
					return;
				}
				const user = firestoreDocument.data();
				setUser(user);
				setId(user.id);
			});

			// Get all of the users classes

			const classRef = firebase.firestore().collection("classes");

			let unsub = classRef
				.where("members", "array-contains", `${uid}`)
				.onSnapshot((querySnapshot) => {
					var array = [];
					querySnapshot.forEach((doc) => {
						// doc.data() is never undefined for query doc snapshots
						array.push(doc.data());
					});
					setClasses(array);
				});
			setLoading(false);
			setClassID(getRandomID());
			// setHaveLoaded(true);

			return () => {
				unsub();
			};
		}
	}, []);

	const signOut = () => {
		//setUser("");
		firebase
			.auth()
			.signOut()
			.catch((error) => {});
	};

	const getRandomID = () => {
		let number = Math.floor(Math.random() * 100000 + 1);

		firebase
			.firestore()
			.collection("classes")
			.where("__name__", "==", `${number}`)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					// doc.data() is never undefined for query doc snapshots
					//console.log(doc.id);

					setClassIDs(doc.id);
				});
			});

		while (classIDs === number) {
			number = Math.floor(Math.random() * 100000 + 1);
		}

		number = number.toString();
		while (number.length < 5) number = "0" + number;

		return number;
	};

	const showOptions = () => {
		if (!show) {
			const randomID = getRandomID();
			setClassID(randomID);
		}
		setShow(!show);
	};

	const createClass = () => {
		if (title === "" || title.length <= 3) {
			alert(
				"Class must have a title that is more than 3 characters long"
			);
			return;
		}
		const userRef = firebase.firestore().collection("users").doc(id);
		const docRef = firebase.firestore().collection("classes").doc(classID);

		const classData = {
			id: classID,
			title: title,
			owner: id,
			members: [id],
			requesting: [],
		};

		docRef
			.set(classData)
			.then(function () {})
			.catch(function (error) {
				console.error("Error writing document: ", error);
			});

		userRef
			.update({
				classes: firebase.firestore.FieldValue.arrayUnion(classID),
			})
			.then(function () {
				//console.log("Document successfully written!");
			})
			.catch(function (error) {
				console.error("Error writing document: ", error);
			});

		let update = classes;
		update[classID] = classData;
		setClasses(update);
		setTitle("");
		setClassID(getRandomID());
		setShow(!show);
	};

	const joinClass = async () => {
		if (joinClassID === "" || (joinClassID.length < 5 && joinClassID > 6)) {
			alert("Class ID must be 5 digits long");
			return;
		}

		let docData;
		// let classData = {};

		// const classRef = firebase.database().ref("classes/" + joinClassID);

		const classRef = firebase
			.firestore()
			.collection("classes")
			.doc(joinClassID);

		try {
			var doc = await classRef.get();

			docData = doc.data();
		} catch (error) {
			console.log(error);
		}

		if (docData == undefined) {
			alert("Couldn´t find the class you were looking for");
			// setClassData({});
			return;
		}

		// const userRef = firebase.firestore().collection("users").doc(id);

		let requesters = docData.requesting;

		if (requesters.includes(id)) {
			alert("You have already asked to join this class");
			return;
		}
		//userRef
		const update = {
			requesting: firebase.firestore.FieldValue.arrayUnion(id),
		};

		firebase
			.firestore()
			.collection("classes")
			.doc(joinClassID)
			.update(update);

		setShow(!show);
	};

	const goToLesson = (lessonID, title) => {
		navigation.navigate("Class", {
			id: lessonID,
			title: title,
			user: user,
		});
	};

	if (loading) {
		return (
			<View>
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<View
			style={{
				flex: 1,
				width: "100%",
				alignItems: "flex-start",
				paddingBottom: 10,
			}}
		>
			<View style={styles.header}>
				<Text style={styles.headerText}>Welcome {user.fullName}</Text>
				<Button
					style={{ width: 100, alignSelf: "flex-end" }}
					text="Options"
					onPress={() => {
						showOptions();
					}}
				></Button>
			</View>
			{show ? (
				<View style={styles.optionsContainer}>
					{user.type == "Teacher" ? (
						<View
							style={{
								width: "100%",
								alignItems: "center",
							}}
						>
							<Text style={{ fontSize: 20 }}>
								Class ID: {classID}
							</Text>
							<TextInput
								style={styles.input}
								placeholder="Class Title"
								placeholderTextColor="#aaaaaa"
								onChangeText={(text) => setTitle(text)}
								value={title}
								underlineColorAndroid="transparent"
								autoCapitalize="none"
							/>
							<Button
								style={{
									width: "100%",
									marginTop: 5,
								}}
								text="Add a Class"
								onPress={() => createClass()}
							/>
						</View>
					) : null}
					<View
						style={{
							width: "100%",
							alignItems: "center",
							marginTop: 10,
						}}
					>
						<Text style={{ fontSize: 20 }}>Join a Class</Text>
						<TextInput
							style={styles.input}
							placeholder="Class id"
							placeholderTextColor="#aaaaaa"
							onChangeText={(text) => setJoinClassID(text)}
							value={joinClassID}
							underlineColorAndroid="transparent"
							autoCapitalize="none"
						/>
						<Button
							style={{ width: "100%", marginTop: 5 }}
							text="Join a Class"
							onPress={() => joinClass()}
						/>
					</View>
				</View>
			) : null}

			<View
				style={{
					flex: 1,
					width: "100%",
					flexDirection: "row",
					justifyContent: "center",
					padding: 10,
				}}
			>
				<View
					style={{
						width: "45%",
						height: "100%",
						margin: 10,
						marginRight: 5,
					}}
				>
					<Text style={styles.headerText}>Your classes:</Text>
					<ScrollView style={styles.list}>
						{classes &&
							classes.map((data, index) => {
								return (
									<View
										key={index}
										style={{
											width: "100%",
											flexDirection: "row",
											alignItems: "center",
											paddingBottom: 5,
											borderBottomColor: "grey",
											borderBottomWidth: 2,
										}}
									>
										<Button
											style={{
												marginTop: 5,
												marginRight: 10,
											}}
											text="Go to lesson"
											onPress={() => {
												goToLesson(data.id, data.title);
											}}
										/>
										<Text
											style={{
												fontSize: 18,
												fontWeight: "bold",
											}}
										>
											{data.title}
										</Text>
									</View>
								);
							})}
					</ScrollView>
				</View>
				<View
					style={{
						width: "45%",
						margin: 10,
						marginLeft: 10,
					}}
				>
					<Text style={styles.headerText}>Settings:</Text>
					<View
						style={{
							width: "100%",
							alignItems: "center",
							padding: 20,
							borderColor: "black",
							borderWidth: 1,
							borderRadius: 5,
						}}
					>
						<Button
							style={{ width: "50%", marginTop: 5 }}
							text="Sign out"
							onPress={() => {
								signOut();
							}}
						/>
					</View>
				</View>
			</View>
		</View>
	);
}
