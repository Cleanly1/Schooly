import { StyleSheet, Dimensions } from "react-native";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export default StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
	},
	contentContainer: {
		flex: 1,
		height: "45%",
		alignItems: "flex-start",
		flexDirection: "row",
		padding: 10,
	},
	header: {
		alignSelf: "flex-start",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "flex-start",
		width: "100%",
		padding: 20,
	},
	headerText: {
		flex: 1,
		paddingVertical: 10,
		marginHorizontal: "auto",
		textAlign: "center",
		fontSize: 20,
		fontWeight: "bold",
	},

	list: {
		width: "100%",
		maxHeight: "95%",
		borderColor: "black",
		borderWidth: 1,
		borderRadius: 5,
		padding: 5,
		overflow: "hidden",
		backgroundColor: "lightgrey",
	},

	optionsContainer: {
		position: "absolute",
		width: "80%",
		alignItems: "center",
		backgroundColor: "grey",
		zIndex: 1,
		top: 60,
		margin: 5,
		padding: 10,
		borderRadius: 5,
		shadowColor: "black",
	},
	input: {
		height: 48,
		width: "60%",
		borderRadius: 5,
		overflow: "hidden",
		backgroundColor: "white",
		paddingLeft: 16,
		margin: 5,
	},

	titleText: {
		fontSize: 20,
	},
});
