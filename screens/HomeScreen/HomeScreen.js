import React, { useEffect, useState } from "react";
import { Text, View, ScrollView } from "react-native";
import styles from "./styles";
import Button from "../../components/Button/Button";
import { firebase } from "../../src/firebase/config";

export default function HomeScreen({ navigation, route }) {
	const [user, setUser] = useState("");
	const [id, setId] = useState("");
	const [lessons, setLessons] = useState([]);

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

		const ref = firebase.database().ref("/lessons");

		ref.on("value", function (snapshot) {
			setLessons([...lessons, snapshot.val()]);
		});
	}, []);

	const signOut = () => {
		firebase
			.auth()
			.signOut()
			.then(() => {
				setUser("");
				navigation.navigate("Login");
			})
			.catch((error) => {});
	};

	const getRandomNumber = () => {
		return 1234;
	};

	const createLesson = () => {
		const randomID = getRandomNumber();
		// lessons.forEach((lesson) => {
		// 	console.log(lesson);
		// });

		const lessonId = randomID;
		const lessonData = {
			title: "Test Lesson",
			owner: id,
			members: [id],
		};
		firebase
			.database()
			.ref("lessons/" + lessonId)
			.set(lessonData);
		firebase
			.database()
			.ref("user-lessons/" + `${user.id}/` + lessonId)
			.set(lessonData);

		setLessons([...lessons, { lessonId: lessonData }]);
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
				</View>
				<Button
					style={{ width: "100%", marginTop: 5 }}
					text="Add a lesson"
					onPress={() => createLesson()}
				/>
				<View>
					{lessons &&
						lessons.map((lesson, i) => {
							return Object.keys(lesson).map((key, index) => {
								const less = lesson[key];
								console.log(less.title);
								return (
									<View key={index}>
										<Text>{less.title}</Text>
									</View>
								);
							});
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
