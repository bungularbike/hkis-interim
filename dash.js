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

var db = firebase.firestore();

var storage = firebase.storage();

var formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

db.collection("interims").orderBy("id").get().then(function(qS) {
    $("h3.navbar-brand").html("Explore Trips (" + qS.size + ")");
    qS.forEach(function(doc) {
        var trip = doc.data();
        var categories = "";
        if (trip.service) {
            categories = "Service";
        }
        if (trip.culture) {
            if (categories != "") {
                categories += "<span class = 'mx-3'></span>";
            }
            categories += "Culture";
        }
        if (trip.adventure) {
            if (categories != "") {
                categories += "<span class = 'mx-3'></span>";
            }
            categories += "Adventure";
        }
        var price = formatter.format(trip.price);
        price = price.substring(0, price.length - 3);
        $(".card-columns").append("<div class = 'card' id = 'trip" + doc.id + "' tabindex = '0' ontouchstart = ''><div class = 'card-body'><h4 class = 'card-title'>" + (trip.new ? "<span class = 'h4' style = 'color: red'>NEW </span>" : "") + trip.name + "</h6><h6 class = 'card-text'>" + categories + "</h6><h6 class = 'card-text'>" + price + "</h6><p class = 'card-text mb-0'>" + trip.description + "</p></div></div>");
        $("#trip" + doc.id).keydown(function(event) {
            if (event.keyCode == 32) {
                $("#trip" + doc.id).addClass("active");
                return false;
            }
        });
        $("#trip" + doc.id).keyup(function(event) {
            $("#trip" + doc.id).removeClass("active");
        });
        storage.ref("previews/" + doc.id + ".jpg").getDownloadURL().then(function(url) {
            $("#trip" + doc.id).prepend("<img src = \"" + url + "\" class = 'card-img-top'>");
        }).catch(function(error) {
            if (error.code != "storage/object-not-found") {
                alert(error.message);
            }
        });
    });
}).catch(function(error) {
    alert(error.message);
});

firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		window.open("index.html", "_self");
    } else {
        firebase.auth().currentUser.getIdToken().then(function(token) {
            $.ajax({
                method: "GET",
                url: "https://hkisinterimcentral.herokuapp.com/student?token=" + token,
                dataType: "json"
            }).done(function(data) {
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

$("#signOut").click(function() {
    $("#signOut").attr("disabled", true);
    firebase.auth().signOut();
});

