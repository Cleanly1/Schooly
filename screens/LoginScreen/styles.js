import { StyleSheet, Dimensions } from "react-native";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export default StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {},
	logo: {
		flex: 1,
		height: 120,
		width: 90,
		alignSelf: "center",
		margin: 30,
	},
	input: {
		height: 48,
		borderRadius: 5,
		overflow: "hidden",
		backgroundColor: "white",
		marginTop: 10,
		marginBottom: 10,
		marginLeft: 30,
		marginRight: 30,
		paddingLeft: 16,
		minWidth: 200,
		width: "80%",
	},
	footerView: {
		flex: 1,
		alignItems: "center",
		marginTop: 20,
		minWidth: 200,
	},
	footerText: {
		fontSize: 16,
		color: "#2e2e2d",
	},
	footerLink: {
		color: "#788eec",
		fontWeight: "bold",
		fontSize: 16,
		width: "100%",
	},
});
