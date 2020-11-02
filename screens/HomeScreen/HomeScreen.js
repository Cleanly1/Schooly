import React, { useEffect, useState } from "react";
import { Text, View, ScrollView, TextInput } from "react-native";
import styles from "./styles";
import Button from "../../components/Button/Button";
import { firebase } from "../../src/firebase/config";

export default function HomeScreen({ navigation, route }) {
	const [user, setUser] = useState("");
	const [id, setId] = useState("");
	const [lessons, setLessons] = useState([]);
	const [title, setTitle] = useState("");
	const [haveLoaded, setHaveLoaded] = useState(false);
	const [show, setShow] = useState(false);
	const [lessonID, setLessonID] = useState("");

	useEffect(() => {
		const uid = firebase.auth().currentUser.uid;
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
			// Get all of the users lessons
			const ref = firebase.database().ref("user-lessons/" + `${uid}`);

			ref.on("value", (snapshot) => {
				console.log(snapshot.val());
				setLessons(snapshot.val());
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

		let lessons = [];
		const ref = firebase.database().ref("lessons/");

		ref.on("value", (snapshot) => {
			lessons = snapshot.val();
		});
		while (Object.keys(lessons).indexOf(number) != -1) {
			console.log("hello");
			number = Math.floor(Math.random() * 10000 + 1);
		}
		number = number.toString();
		while (number.length < 5) number = "0" + number;

		return number;
	};

	const showOptions = () => {
		if (!show) {
			const randomID = getRandomID();
			setLessonID(randomID);
		}
		setShow(!show);
	};

	const createLesson = () => {
		if (title === "" || title.length <= 3) {
			alert(
				"Lesson must have a title that is more than 3 characters long"
			);
			return;
		}
		const lessonData = {
			title: title,
			owner: id,
			members: [id],
			requesting: [],
		};
		firebase
			.database()
			.ref("lessons/" + lessonID)
			.set(lessonData);
		firebase
			.database()
			.ref("user-lessons/" + `${user.id}/` + lessonID)
			.set(lessonData);

		let update = {};
		update[lessonID] = lessonData;

		setLessons([...lessons, update]);
		setTitle("");
		setLessonID("");
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
						<Text style={{ fontSize: 20 }}>
							Lesson ID: {lessonID}
						</Text>
						<TextInput
							style={styles.input}
							placeholder="Lesson Title"
							placeholderTextColor="#aaaaaa"
							onChangeText={(text) => setTitle(text)}
							value={title}
							underlineColorAndroid="transparent"
							autoCapitalize="none"
						/>
						<Button
							style={{ width: "100%", marginTop: 5 }}
							text="Add a lesson"
							onPress={() => createLesson()}
						/>
					</View>
				) : null}

				<View>
					<Text style={{}}>Your lessons:</Text>
					{lessons &&
						Object.keys(lessons).map((key, index) => {
							const less = lessons[key];
							return (
								<View key={index}>
									<Text>{less.title}</Text>
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
