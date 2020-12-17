import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	TextInput,
} from "react-native";
import styles from "./styles";
import Button from "../../components/Button/Button";
import { firebase } from "../../src/firebase/config";

export default function ClassScreen({ navigation, route }) {
	const [classData, setClassData] = useState({});
	const [ID, setID] = useState();
	const [haveLoaded, setHaveLoaded] = useState(false);
	const [users, setUsers] = useState([]);
	const [memberList, setMemberList] = useState([]);
	const [lessonList, setLessonList] = useState([]);
	const [user, setUser] = useState("");
	const [show, setShow] = useState(false);
	const [lessonTitle, setLessonTitle] = useState("");
	const [lessonID, setLessonID] = useState();

	useEffect(() => {
		const classID = route.params.id;
		setID(classID);
		setUser(route.params.user);

		// setClassID(route.params.id);

		// const classRef = firebase
		// 	.firestore()
		// 	.collection("classes")
		// 	.doc(classID)
		// 	.onSnapshot(function (doc) {
		// 		console.log("Current data: ", doc.data());
		// 	});

		if (!haveLoaded) {
			var unsub = firebase
				.firestore()
				.collection("classes")
				.doc(classID)
				.onSnapshot((firestoreDocument) => {
					if (!firestoreDocument.exists) {
						alert("User does not exist anymore.");
						return;
					}
					const data = firestoreDocument.data();
					setClassData(data);
					// data.membersRef.map((member) => {
					// 	member.get().then();

					// 	//getMembers(member);
					// });
					if (data.requesting !== []) {
						data.requesting.map((id) => {
							getUser(id);
						});
					}
				});

			firebase
				.firestore()
				.collection("users")
				.where("classes", "array-contains", `${classID}`)
				.get()
				.then((querySnapshot) => {
					// if (!querySnapshot.exists) {
					// 	alert("No Members");
					// 	return;
					// }

					let array = [];
					querySnapshot.forEach((snapshot) => {
						array.push(snapshot.data());
						var source = snapshot.metadata.fromCache
							? "local cache"
							: "server";
						console.log("Data came from " + source);
					});

					setMemberList(array);
				});

			firebase
				.firestore()
				.collection("classes")
				.doc(classID)
				.collection("lessons")
				.get()
				.then((querySnapshot) => {
					let array = [];

					querySnapshot.forEach((snapshot) => {
						let data = snapshot.data();
						array.push(data);
					});
					setLessonList(array);
					setHaveLoaded(true);
				})
				.catch((error) => {
					console.log(error);
				});

			return () => {
				unsub();
			};
		}
	}, []);

	const getData = async (classID) => {
		await new Promise((resolve) => {
			firebase
				.firestore()
				.collection("classes")
				.doc(classID)
				.get()
				.then((doc) => {
					if (doc.exists) {
						setClassData(doc.data());
						setReqList(classData.requesting);
					} else {
						// doc.data() will be undefined in this case
						// console.log("No such document!");
					}
					resolve(true);
				})
				.catch(function (error) {
					// console.log("Error getting document:", error);
				});
		});
	};

	const getUser = (id) => {
		firebase
			.firestore()
			.collection("users")
			.doc(id)
			.get()
			.then((snapshot) => {
				if (!snapshot.exists) {
					alert("User does not exist anymore.");
					return;
				}

				setUsers([...users, snapshot.data()]);
			});
	};

	const getMembers = (member) => {
		member.get().then((snapshot) => {
			if (!snapshot.exists) {
				alert("User does not exist anymore.");
				return;
			}

			setMemberList([...memberList, snapshot.data()]);
		});
	};

	const getRandomID = () => {
		let number = Math.floor(Math.random() * 1000000 + 1);

		firebase
			.firestore()
			.collection("classes")
			.doc(ID)
			.collection("lessons")
			.where("__name__", "==", `${number}`)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach((doc) => {
					// doc.data() is never undefined for query doc snapshots
					//console.log(doc.id);
					const document = doc.data();
					setLessonID(doc.id);
				});
			});

		while (lessonID === number) {
			number = Math.floor(Math.random() * 1000000 + 1);
		}

		number = number.toString();
		while (number.length < 6) number = "0" + number;

		return number;
	};

	const acceptUser = (user) => {
		const classRef = firebase.firestore().collection("classes").doc(ID);
		const userRef = firebase.firestore().collection("users").doc(user.id);

		const updatedUsers = users.filter((info) => {
			return info.id != user.id;
		});

		setUsers(updatedUsers);
		setMemberList([...memberList, user]);

		userRef.update({
			classes: firebase.firestore.FieldValue.arrayUnion(ID),
		});

		classRef.update({
			requesting: firebase.firestore.FieldValue.arrayRemove(user.id),
			members: firebase.firestore.FieldValue.arrayUnion(user.id),
		});
	};

	const createLesson = () => {
		if (lessonTitle === "" || lessonTitle.length <= 3) {
			alert(
				"Lesson must have a title that is more than 3 characters long"
			);
			return;
		}

		const id = getRandomID();

		const newLesson = {
			id: id,
			title: lessonTitle,
			desc: "Please edit the lessons/assignments description",
		};

		firebase
			.firestore()
			.collection("classes")
			.doc(ID)
			.collection("lessons")
			.doc(id)
			.set(newLesson);

		setLessonList([...lessonList, newLesson]);

		setShow(!show);
	};

	const goToLesson = (data) => {
		navigation.navigate("Lesson", {
			data: data,
			title: data.title,
			user: user,
			classid: ID,
			members: memberList,
		});
	};

	if (!haveLoaded) {
		return (
			<View style={styles.container}>
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Button
					style={{ width: "33%" }}
					text="Back"
					onPress={() => navigation.goBack()}
				></Button>
				<Text
					style={[
						styles.headerText,
						user.type !== "Teacher"
							? {
									width: "33%",
									marginRight: "33%",
							  }
							: null,
					]}
				>
					{classData.title}
				</Text>
				{user.type === "Teacher" ? (
					<Button
						style={{ width: "33%", alignSelf: "flex-end" }}
						text="Options"
						onPress={() => {
							setShow(!show);
						}}
					></Button>
				) : null}
			</View>
			{show && (
				<View style={styles.optionsContainer}>
					{user.type == "Teacher" ? (
						<View
							style={{
								width: "100%",
								alignItems: "center",
							}}
						>
							<Text
								style={[
									styles.titleText,
									{ fontWeight: "bold" },
								]}
							>
								Class ID: {ID}
							</Text>
							<Text style={styles.titleText}>
								Create a lesson
							</Text>
							<TextInput
								style={styles.input}
								placeholder="Lesson Title"
								placeholderTextColor="#aaaaaa"
								onChangeText={(text) => setLessonTitle(text)}
								value={lessonTitle}
								underlineColorAndroid="transparent"
								autoCapitalize="none"
							/>
							<Button
								style={{
									width: "100%",
									marginTop: 5,
								}}
								text="Setup a new lesson"
								onPress={() => createLesson()}
							/>
						</View>
					) : null}
				</View>
			)}

			<View style={styles.contentContainer}>
				<View style={{ width: "45%", height: "100%", marginRight: 5 }}>
					<Text style={styles.titleText}>Members in class:</Text>
					<ScrollView style={styles.list}>
						{memberList && memberList.length != 0
							? memberList.map((memberUser, i) => {
									return (
										<View
											key={i}
											style={{
												width: "100%",
												borderBottomColor: "grey",
												borderBottomWidth: 2,
											}}
										>
											<Text
												style={{
													width: "100%",
													fontSize: 16,
													padding: 5,
												}}
											>
												{`${memberUser.fullName}: ${memberUser.type}`}
											</Text>
										</View>
									);
							  })
							: null}
					</ScrollView>
				</View>
				<View style={{ width: "45%", height: "100%", marginLeft: 5 }}>
					<Text style={styles.titleText}>
						Lessons: (Press to view)
					</Text>
					<ScrollView style={styles.list}>
						{lessonList && lessonList.length > 0
							? lessonList.map((lessonData, i) => {
									return (
										<TouchableOpacity
											key={i}
											style={{
												width: "100%",
												borderBottomColor: "grey",
												borderBottomWidth: 2,
											}}
											onPress={() =>
												goToLesson(lessonData)
											}
										>
											<Text
												style={{
													width: "100%",
													fontSize: 16,
													padding: 5,
												}}
											>
												{`${lessonData.title}`}
											</Text>
										</TouchableOpacity>
									);
							  })
							: null}
					</ScrollView>
				</View>
			</View>
			<View
				style={[
					styles.contentContainer,
					{ width: "45%", flexDirection: "column" },
				]}
			>
				{users && users.length > 0 && user.id == classData.owner ? (
					<>
						<Text>Requesting to join the Class:</Text>
						<ScrollView style={[styles.list, { maxHeight: "50%" }]}>
							{users.map((user, i) => {
								return (
									<View
										key={i}
										style={{
											borderBottomWidth: 2,
											paddingBottom: 5,
											borderColor: "grey",
											flexDirection: "row",
											alignItems: "center",
										}}
									>
										<Text style={{ marginRight: 30 }}>
											{user.fullName}
										</Text>
										<TouchableOpacity
											style={{
												width: 10,
												padding: 10,
												borderRadius: 100,
												borderWidth: 5,
												borderColor: "green",
												backgroundColor: "darkgreen",
											}}
											onPress={() => {
												acceptUser(user);
											}}
										></TouchableOpacity>
									</View>
								);
							})}
						</ScrollView>
					</>
				) : null}
			</View>
		</View>
	);
}
