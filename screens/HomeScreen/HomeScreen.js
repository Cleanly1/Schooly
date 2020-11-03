import React, { useEffect, useState } from "react";
import { Text, View, ScrollView, TextInput } from "react-native";
import styles from "./styles";
import Button from "../../components/Button/Button";
import { firebase } from "../../src/firebase/config";

export default function HomeScreen({ navigation, extraData }, props) {
	const [user, setUser] = useState("");
	const [id, setId] = useState("");
	const [classes, setClasses] = useState({});
	const [title, setTitle] = useState("");
	const [haveLoaded, setHaveLoaded] = useState(false);
	const [show, setShow] = useState(false);
	const [classID, setClassID] = useState("");
	const [joinClassID, setJoinClassID] = useState("");

	useEffect(() => {
		const uid = firebase.auth().currentUser.uid;
		console.log(props);
		firebase
			.firestore()
			.collection("users")
			.doc(uid)
			.get()
			.then((firestoreDocument) => {
				if (!firestoreDocument.exists) {
					alert("User does not exist anymore.");
					return;
				}
				const user = firestoreDocument.data();
				setUser(user);
				setId(user.id);
			});

		if (!haveLoaded) {
			// Get all of the users classes
			const ref = firebase.database().ref("user-classes/" + `${uid}`);

			ref.on("value", (snapshot) => {
				setClasses(snapshot.val());
				if (snapshot.val() == null) setClasses({});
			});

			setHaveLoaded(true);
		}
	}, []);

	const signOut = () => {
		firebase
			.auth()
			.signOut()
			.then(() => {
				setUser("");
			})
			.catch((error) => {});
	};

	const getRandomID = () => {
		let number = Math.floor(Math.random() * 100000 + 1);

		let classes = {};
		const ref = firebase.database().ref("classes/");

		ref.on("value", (snapshot) => {
			classes = snapshot.val();
			if (snapshot.val() == null) classes = {};
		});
		while (Object.keys(classes).indexOf(number) != -1) {
			number = Math.floor(Math.random() * 10000 + 1);
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
		const classData = {
			title: title,
			owner: id,
			members: [id],
			requesting: [],
		};
		firebase
			.database()
			.ref("classes/" + classID)
			.set(classData);
		firebase
			.database()
			.ref("user-classes/" + `${user.id}/` + classID)
			.set(classData);

		let update = classes;
		update[classID] = classData;
		setClasses(update);
		setTitle("");
		setClassID(getRandomID());
		setShow(!show);
	};

	const joinClass = () => {
		if (joinClassID === "" || (joinClassID.length < 5 && joinClassID > 6)) {
			alert("Class ID must be 5 digits long");
			return;
		}

		let classData = {};

		const classRef = firebase.database().ref("classes/" + joinClassID);

		classRef.on("value", (snapshot) => {
			if (snapshot.val() === null) {
				classData = null;
				return;
			}

			classData = snapshot.val();
		});

		if (classData === null) {
			alert("Couldn´t find the class you were looking for");
			return;
		}

		let requesters = classData.requesting;

		if (requesters == undefined) {
			classData["requesting"] = [user.id];
		} else {
			if (classData.requesting.includes(user.id)) {
				alert("You have already reuested to join this class");
				return;
			}
			classData.requesting = [...requesters, user.id];
		}

		var updates = {};
		updates["/classes/" + joinClassID] = classData;
		updates[
			"/user-classes/" + classData.owner + "/" + joinClassID
		] = classData;

		firebase.database().ref().update(updates);
	};

	const goToLesson = (lessonID, title) => {
		navigation.navigate("Lesson", { id: lessonID, title: title });
	};

	return (
		<ScrollView>
			<View
				style={{
					flex: 1,
					width: "100%",
					alignItems: "center",
					paddingBottom: 10,
				}}
			>
				<View style={styles.header}>
					<Text style={styles.headerText}>
						Welcome {user.fullName}
					</Text>
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

				<View>
					<Text style={{}}>Your classes:</Text>
					{classes &&
						Object.keys(classes).map((key, index) => {
							const classData = classes[key];

							return (
								<View key={index} style={{ width: 200 }}>
									<Text>{classData.title}</Text>
									<Button
										style={{ marginTop: 5 }}
										text="Go to lesson"
										onPress={() => {
											goToLesson(key, classData.title);
										}}
									/>
								</View>
							);
						})}
				</View>
				<Button
					style={{ width: "100%", marginTop: 5 }}
					text="Sign out"
					onPress={() => signOut()}
				/>
			</View>
		</ScrollView>
	);
}
