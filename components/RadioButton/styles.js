import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
	button: {
		padding: 5,
		backgroundColor: "white",
		borderWidth: 2,
		borderRadius: 20,
		width: 35,
	},
	container: { alignItems: "center", flexDirection: "row" },
	text: { margin: 5, fontSize: 16, fontWeight: "bold" },
	indicator: {
		padding: 10,
		borderRadius: 20,
	},
});

export default styles;
