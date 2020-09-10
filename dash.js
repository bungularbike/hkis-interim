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

firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		window.open("index.html", "_self");
    } else {
        firebase.auth().currentUser.getIdToken().then(function(token) {
            $.ajax({
                method: "GET",
                url: "https://hkisinterimcentral.herokuapp.com/student?token=" + token
            }).done(function(jqxhr) {
                var data = JSON.parse(jqxhr.responseText);
                $("#userName").html(data.name);
                $("#fade").remove();
            }).fail(function(jqxhr) {
                alert(jqxhr.responseText);
            });
        }).catch(function(error) {
            alert(error.message);
        });
    }
});