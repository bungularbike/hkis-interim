var firebaseConfig = {
    apiKey: "AIzaSyA6uzX2X3dFEOz86Cwp3ZxeAreKR2XY7fo",
    authDomain: "hkisrobotics.com",
    databaseURL: "https://hkis-interim.firebaseio.com",
    projectId: "hkis-interim",
    storageBucket: "hkis-interim.appspot.com",
    messagingSenderId: "623891731224",
    appId: "1:623891731224:web:cfc8c3ee29e20908c8c46d",
    measurementId: "G-E8XR3ZS8QZ"
 };
 firebase.initializeApp(firebaseConfig);
 firebase.analytics();

var provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParamters({"hd": "hkis.edu.hk"});
firebase.auth().signInWithPopup(provider).then(function(result) {
	var token = result.credential.accessToken;
	console.log(token);
	var user = result.user;
}).catch(function(error) {
	var errorMessage = error.message;
	console.log(errorMessage);
});