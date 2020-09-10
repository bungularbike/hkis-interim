var firebaseConfig = {
    apiKey: "AIzaSyA6uzX2X3dFEOz86Cwp3ZxeAreKR2XY7fo",
    authDomain: "auth.hkisrobotics.com",
    databaseURL: "https://hkis-interim.firebaseio.com",
    projectId: "hkis-interim",
    storageBucket: "hkis-interim.appspot.com",
    messagingSenderId: "623891731224",
    appId: "1:623891731224:web:cfc8c3ee29e20908c8c46d",
    measurementId: "G-E8XR3ZS8QZ"
 };
 firebase.initializeApp(firebaseConfig);
 firebase.analytics();

var login = false;
firebase.auth().onAuthStateChanged(function(user) {
	if (user && !login) {
		window.open("dash.html", "_self");
	} else {
		$("#fade").remove();
	}
});

$("#studentSignIn").click(function() {
	login = true;
	var provider = new firebase.auth.GoogleAuthProvider();
	provider.setCustomParameters({"hd": "hkis.edu.hk"});
	firebase.auth().signInWithPopup(provider).then(function(result) {
		firebase.auth().currentUser.getIdToken(true).then(function(token) {
			$.ajax({
				method: "GET",
				url: "https://hkisinterimcentral.herokuapp.com/student?token=" + token
			}).done(function(jqxhr) {
				window.open("dash.html", "_self");
			}).fail(function(jqxhr) {
				console.log(jqxhr.responseText);
			});
		}).catch(function(error) {
			console.log(error.message);
		});		
	}).catch(function(error) {
		login = false;
		console.log(error.message);
	});
});