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

var starFilled = '<svg width = "1.25em" height = "1.25em" viewBox = "0 0 16 16" fill = "currentColor" xmlns = "http://www.w3.org/2000/svg"><path d = "M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/></svg>';
var starEmpty = '<svg width = "1.25em" height = "1.25em" viewBox = "0 0 16 16" fill = "currentColor" xmlns = "http://www.w3.org/2000/svg" style = "vertical-align: middle"><path fill-rule = "evenodd" d = "M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.523-3.356c.329-.314.158-.888-.283-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767l-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288l1.847-3.658 1.846 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.564.564 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" /></svg>';
var tripList = [];
var currentStarred = [];
var user_email = "";

function getUserData() {
    db.collection("users_students").doc(user_email).get().then(function(doc) {
        var data = doc.data();
        currentStarred = data.starred;
        loadTrips();
    }).catch(function(error) {
        alert(error.message);
    });
}

function changeStar(id) {
    if (currentStarred.indexOf(id) != -1) {
        currentStarred.splice(currentStarred.indexOf(id), 1);
        db.collection("users_students").doc(user_email).update({ starred: currentStarred }).then(function() {
            $("#toggleStar" + id).html(starEmpty);
            if (toggleStar) {
                filterTrips();
            }
        }).catch(function(error) {
            alert(error.message);
        });
    } else {
        currentStarred[currentStarred.length] = id;
        db.collection("users_students").doc(user_email).update({ starred: currentStarred }).then(function() {
            $("#toggleStar" + id).html(starFilled);
        }).catch(function(error) {
            alert(error.message);
        });
    }
}

function loadTrips() {
    db.collection("interims").orderBy("id").get().then(function(qS) {
        $(".navbar-brand h3").html("Explore Trips (" + qS.size + ")");
        qS.forEach(function(doc) {
            var trip = doc.data();
            var id = trip.id;
            tripList[id - 1] = [trip.name, trip.region, trip.service, trip.culture, trip.adventure, trip.price_bracket, trip.new];
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
            $(".card-columns").append("<div class = 'card tripCard' tabindex = '0' ontouchstart = '' id = 'tripCard" + id + "'><div class = 'card-header'><div class = 'card-text toggleStar d-inline-block' id = 'toggleStar" + id + "' tabindex = '0' style = 'margin-bottom: 0 !important'>" + (currentStarred.indexOf(id) != -1 ? starFilled : starEmpty) + "</div></div><div class = 'card-body trip'><h4 class = 'card-title'>" + (trip.new ? "<span class = 'h4' style = 'color: red'>NEW </span>" : "") + trip.name + "</h6><h6 class = 'card-text'>" + categories + "</h6><h6 class = 'card-text'>HKD" + price + "</h6><p class = 'card-text mb-0'>" + trip.description + "</p></div></div>");
            $clamp($("#tripCard" + id + " p")[0], { clamp: 5, useNativeClamp: false });
            $("#tripCard" + id).keypress(function(event) {
                if (event.keyCode == 32) {
                    $("#tripCard" + id).trigger("click");
                    return false;
                }
            });
            $("#toggleStar" + id).keypress(function(event) {
                if (event.keyCode == 32) {
                    $("#toggleStar" + id).trigger("click");
                    return false;
                }
            });
            $("#tripCard" + id).click(function() {
               // alert("");
            });
            $("#toggleStar" + id).click(function(event) {
                event.preventDefault();
                event.stopPropagation();
                changeStar(id);
            });
            storage.ref("previews/" + id + ".jpg").getDownloadURL().then(function(url) {
                $("#tripCard" + id).prepend("<div class = 'starHolder toggleStar' id = 'toggleStar" + id + "' tabindex = '0'>" + (currentStarred.indexOf(id) != -1 ? starFilled : starEmpty) + "</div>");
                $("#tripCard" + id).prepend("<img src = \"" + url + "\" style = 'position: relative' class = 'card-img-top trip'>");
                $("#tripCard" + id + " .card-header").remove();
                $("#toggleStar" + id).keypress(function(event) {
                    if (event.keyCode == 32) {
                        $("#toggleStar" + id).trigger("click");
                        return false;
                    }
                });
                $("#toggleStar" + id).click(function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    changeStar(id);
                });

            }).catch(function(error) {
                if (error.code != "storage/object-not-found") {
                    alert(error.message);
                }
            });
        });
    }).catch(function(error) {
        alert(error.message);
    });
}

var toggleStar = false;
$("#filterStar").click(function() {
    if (!toggleStar) {
        $("#filterStar").html(starFilled);
        toggleStar = true;
        filterTrips();
    } else {
        $("#filterStar").html(starEmpty);
        toggleStar = false;
        filterTrips();
    }
});

function filterTrips() {
    var matches = [];
    for (var i = 0; i < tripList.length; i++) {
        matches[i] = true;
    }
    $(".tripCard").removeClass("tripHidden");
    if (toggleStar) {
        for (var i = 0; i < tripList.length; i++) {
            if (currentStarred.indexOf(i + 1) == -1) {
                $("#tripCard" + (i + 1)).addClass("tripHidden");
                matches[i] = false;
            }
        }
    }
    if ($("#tripRegion").val() !== "") {
        for (var i = 0; i < tripList.length; i++) {
            if (tripList[i][1] !== $("#tripRegion").val()) {
                $("#tripCard" + (i + 1)).addClass("tripHidden");
                matches[i] = false;
            }
        }
    }
    if ($("#service").is(":checked")) {
        for (var i = 0; i < tripList.length; i++) {
            if (!tripList[i][2]) {
                $("#tripCard" + (i + 1)).addClass("tripHidden");
                matches[i] = false;
            }
        }
    }
    if ($("#culture").is(":checked")) {
        for (var i = 0; i < tripList.length; i++) {
            if (!tripList[i][3]) {
                $("#tripCard" + (i + 1)).addClass("tripHidden");
                matches[i] = false;
            }
        }
    }
    if ($("#adventure").is(":checked")) {
        for (var i = 0; i < tripList.length; i++) {
            if (!tripList[i][4]) {
                $("#tripCard" + (i + 1)).addClass("tripHidden");
                matches[i] = false;
            }
        }
    }
    if ($("#tripPrice").val() !== "") {
        for (var i = 0; i < tripList.length; i++) {
            if (tripList[i][5].toString() !== $("#tripPrice").val()) {
                $("#tripCard" + (i + 1)).addClass("tripHidden");
                matches[i] = false;
            }
        }
    }
    if ($("#newTrip").is(":checked")) {
        for (var i = 0; i < tripList.length; i++) {
            if (!tripList[i][6]) {
                $("#tripCard" + (i + 1)).addClass("tripHidden");
                matches[i] = false;
            }
        }
    }
    if (tripList.length != 0) {
        if ($("#searchTrips").val() !== "") {
            for (var i = 0; i < tripList.length; i++) {
                if (tripList[i][0].toLowerCase().indexOf($("#searchTrips").val().toLowerCase()) == -1) {
                    $("#tripCard" + (i + 1)).addClass("tripHidden");
                    matches[i] = false;
                }
            }
        }
    }
    var totalMatches = 0;
    for (var j = 0; j < matches.length; j++) {
        if (matches[j]) {
            totalMatches++;
        }
    }
    $(".navbar-brand h3").html("Explore Trips (" + totalMatches + ")");
}

$("#tripRegion, #service, #culture, #adventure, #tripPrice, #newTrip").on("change", function() {
    filterTrips();
});

$("#searchTrips").on("input", function() {
    filterTrips();
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
                user_email = data.email;
                $("#fade").remove();
                getUserData();
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