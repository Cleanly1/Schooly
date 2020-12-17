import { StyleSheet } from "react-native";

export default StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		width: "100%",
	},

	titleText: {
		fontSize: 16,
		fontWeight: "bold",
	},

	list: {
		width: "80%",
		maxHeight: "50%",
		borderColor: "black",
		borderWidth: 1,
		borderRadius: 5,
		padding: 5,
		overflow: "hidden",
		backgroundColor: "lightgrey",
	},
});
