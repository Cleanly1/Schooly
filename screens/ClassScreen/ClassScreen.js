import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import { firebase } from "../../src/firebase/config";

export default function classScreen({ navigation, route }) {
	const [classData, setClassData] = useState({});
	const [lessonID, setLessonID] = useState("");
	const [reqUserData, setReqUserData] = useState(false);
	const [memberUser, setMemberUser] = useState({});
	const [haveLoaded, setHaveLoaded] = useState(false);
	const [reload, setReload] = useState();
	const [user, setUser] = useState("");

	useEffect(() => {
		const classID = route.params.id;

		// setClassID(route.params.id);

		const classRef = firebase
			.firestore()
			.collection("classes")
			.doc(classID);

		firebase
			.firestore()
			.collection("classes")
			.doc(classID)
			.get()
			.then((firestoreDocument) => {
				if (!firestoreDocument.exists) {
					alert("User does not exist anymore.");
					return;
				}
				const info = firestoreDocument.data();
				setClassData(info);
				setReqUserData(info.requesting);
			});

		// getData(route.params.id);

		// if (classData.requesting != undefined && !haveLoaded) {
		// 	classData.requesting.map((uid, i) => {
		// 		firebase
		// 			.firestore()
		// 			.collection("users")
		// 			.doc(uid)
		// 			.get()
		// 			.then((firestoreDocument) => {
		// 				if (!firestoreDocument.exists) {
		// 					alert("User does not exist anymore.");
		// 					return;
		// 				}
		// 				const user = firestoreDocument.data();
		// 				setReqUserData([...reqUserData, user]);
		// 			});
		// 	});
		// 	setHaveLoaded(!haveLoaded);
		// }
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
						setReqUserData(classData.requesting);
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

	const acceptUsers = () => {};

	const getUser = async (id) => {
		const user = await new Promise((resolve) => {
			firebase
				.firestore()
				.collection("users")
				.doc(id)
				.get()
				.then((snapshot) => {
					if (snapshot.data() == undefined) {
						resolve(snapshot.data());
						return;
					}

					resolve(snapshot.data());
				});
		});

		setUser(user);

		setHaveLoaded(!haveLoaded);
	};

	return (
		<View style={styles.container}>
			{reqUserData && (
				<View>
					<Text>Requesting to join the Class:</Text>
					{reqUserData.map((id, i) => {
						if (!haveLoaded) {
							getUser(id);
						}

						if (user === undefined) {
							return <Text key={i}>Loading</Text>;
						}
						return <Text key={i}>{user.fullName}</Text>;
					})}
				</View>
			)}
			<View>
				<Text>Members in class:</Text>
				{classData && classData.members != undefined
					? classData.members.map((member, i) => {
							member.get().then((doc) => {
								setMemberUser(doc.data());
							});

							return (
								<View key={i}>
									<Text>
										{memberUser.fullName}: {memberUser.type}
									</Text>
								</View>
							);
					  })
					: null}
			</View>
		</View>
	);
}
