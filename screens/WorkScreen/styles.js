import { StyleSheet, Dimensions } from "react-native";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export default StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		padding: 10,
	},
	titleText: { fontSize: 16 },
	input: {
		minHeight: 48,
		borderRadius: 5,
		overflow: "hidden",
		backgroundColor: "white",
		marginTop: 10,
		marginBottom: 10,
		marginLeft: 30,
		marginRight: 30,
		paddingLeft: 16,
		padding: 10,
		minWidth: 200,
		width: "80%",
	},
});
