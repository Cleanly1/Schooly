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

	useEffect(() => {
		const classID = route.params.id;

		const classRef = firebase
			.firestore()
			.collection("classes")
			.doc(classID);

		classRef
			.get()
			.then((doc) => {
				if (doc.exists) {
					setClassData(doc.data());
					setReqUserData(classData.requesting);
				} else {
					// doc.data() will be undefined in this case
					// console.log("No such document!");
				}
			})
			.catch(function (error) {
				// console.log("Error getting document:", error);
			});

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

	const acceptUsers = () => {};

	return (
		<View style={styles.container}>
			{reqUserData && (
				<View>
					<Text>Requesting to join the Class:</Text>
					{reqUserData.map((user, i) => {
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
