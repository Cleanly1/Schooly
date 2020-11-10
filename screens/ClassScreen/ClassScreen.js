import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./styles";
import Button from "../../components/Button/Button";
import { firebase } from "../../src/firebase/config";

export default function classScreen({ navigation, route }) {
	const [classData, setClassData] = useState({});
	const [ID, setID] = useState();
	const [haveLoaded, setHaveLoaded] = useState(false);
	const [users, setUsers] = useState([]);
	const [reqLoaded, setReqLoaded] = useState(false);
	const [memberList, setMemberList] = useState([]);
	const [juggle, setJuggle] = useState([]);

	useEffect(() => {
		const classID = route.params.id;
		setID(classID);

		// setClassID(route.params.id);

		// const classRef = firebase
		// 	.firestore()
		// 	.collection("classes")
		// 	.doc(classID)
		// 	.onSnapshot(function (doc) {
		// 		console.log("Current data: ", doc.data());
		// 	});

		if (!haveLoaded) {
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
					const data = firestoreDocument.data();
					setClassData(data);
					// data.membersRef.map((member) => {
					// 	member.get().then();

					// 	//getMembers(member);
					// });
					data.requesting.map((id) => {
						getUser(id);
					});

					setHaveLoaded(true);
					setReqLoaded(true);
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
					});
					setMemberList(array);
				});
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

	if (!haveLoaded) {
		return (
			<View>
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{users && users.length > 0 ? (
				<View>
					<Text>Requesting to join the Class:</Text>
					{users.map((user, i) => {
						return (
							<View key={i}>
								<Text>{user.fullName}</Text>
								<Text>{user.id}</Text>
								<TouchableOpacity
									style={{
										width: 30,
										padding: 20,
										borderRadius: "50%",
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
				</View>
			) : null}
			<View>
				<Text>Members in class:</Text>
				{memberList && memberList.length > 0
					? memberList.map((memberUser, i) => {
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
