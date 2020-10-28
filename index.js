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
		$("#fade").fadeOut(function() { $(this).remove() });
	}
});

$("#studentSignIn").click(function() {
	login = true;
	$("#studentSignIn").attr("disabled", true);
	$("#studentError").empty();
	$("#studentSpinnerP").append("<span class = 'spinner-border ml-3'></span>");
	$("#studentSpinnerP").addClass("mb-4");
	var provider = new firebase.auth.GoogleAuthProvider();
	provider.setCustomParameters({"hd": "hkis.edu.hk"});
	firebase.auth().signInWithPopup(provider).then(function(result) {
		firebase.auth().currentUser.getIdToken(true).then(function(token) {
			$.ajax({
				method: "GET",
				url: "https://us-central1-hkis-interim.cloudfunctions.net/student?token=" + token
			}).done(function(jqxhr) {
				window.open("dash.html", "_self");
			}).fail(function(jqxhr) {
				login = false;
				$("#studentError").html(jqxhr.responseText);
				$("#studentSignIn").attr("disabled", false);
				$("#studentSpinnerP .spinner-border").remove();
				$("#studentSpinnerP").removeClass("mb-4");
			});
		}).catch(function(error) {
			login = false;
			$("#studentError").html(error.message);
			$("#studentSignIn").attr("disabled", false);
			$("#studentSpinnerP .spinner-border").remove();
			$("#studentSpinnerP").removeClass("mb-4");
		});		
	}).catch(function(error) {
		var message = "";
		switch (error.code) {
			case "auth/popup-blocked":
				login = false;
				$("#studentError").html("Please enable popups for this page to complete sign-in");
				$("#studentSignIn").attr("disabled", false);
				$("#studentSpinnerP .spinner-border").remove();
				$("#studentSpinnerP").removeClass("mb-4");
				break;
			case "auth/popup-closed-by-user":
				login = false;
				$("#studentError").html("Please try signing in again");
				$("#studentSignIn").attr("disabled", false);
				$("#studentSpinnerP .spinner-border").remove();
				$("#studentSpinnerP").removeClass("mb-4");
				break;
			case "auth/cancelled-popup-request":
				break;
			default:
				login = false;
				$("#studentError").html(error.message);
				$("#studentSignIn").attr("disabled", false);
				$("#studentSpinnerP .spinner-border").remove();
				$("#studentSpinnerP").removeClass("mb-4");
				break;
		}
	});
});