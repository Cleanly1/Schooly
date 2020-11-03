import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import styles from "./styles";
import { firebase } from "../../src/firebase/config";

export default function LessonScreen({ navigation, route }) {
	const [lessonData, setLessonData] = useState({});
	const [lessonID, setLessonID] = useState("");
	useEffect(() => {
		setLessonID(route.params.id);
		console.log(route.params);
	}, []);
	return (
		<View style={styles.container}>
			<Text>LessonScreen</Text>
		</View>
	);
}
