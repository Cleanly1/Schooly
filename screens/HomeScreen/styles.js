import { StyleSheet, Dimensions } from "react-native";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export default StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
	},
	header: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		width: deviceWidth < 600 ? "100%" : "50%",
		padding: 20,
	},
	headerText: {
		fontSize: 20,
		fontWeight: "bold",
		marginRight: 50,
	},

	optionsContainer: {
		position: "absolute",
		width: "80%",
		alignItems: "center",
		alignSelf: "center",
		backgroundColor: "grey",
		zIndex: 1,
		top: 60,
		margin: 5,
		padding: 10,
		borderRadius: 5,
		shadowColor: "black",
	},

	formContainer: {
		flexDirection: "row",
		height: 80,
		marginTop: 40,
		marginBottom: 20,
		flex: 1,
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 30,
		paddingRight: 30,
		justifyContent: "center",
		alignItems: "center",
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

	list: {
		width: "100%",
		maxHeight: "80%",
		borderColor: "black",
		borderWidth: 1,
		borderRadius: 5,
		padding: 5,
		overflow: "hidden",
	},
});
