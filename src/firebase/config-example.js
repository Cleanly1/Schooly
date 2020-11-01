import * as firebase from "firebase";
import "@firebase/auth";
import "@firebase/firestore";
import { Platform } from "react-native";

let idApp = "Your android app id";

if (Platform.OS === "ios") {
	idApp = "Your Ios app id";
}

const firebaseConfig = {
	apiKey: "AIzaSyCB-<Your-api-key>",
	authDomain: "yourProject.firebaseapp.com",
	databaseURL: "https://yourProject.firebaseio.com",
	projectId: "Project name",
	storageBucket: "projectName.appspot.com",
	messagingSenderId: "your sender id",
	appId: idApp,
};

if (!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig);
}

export { firebase };
