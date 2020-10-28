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
var tripList = {};
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

function changeStar(id, debug) {
    console.log(debug);
    if (currentStarred.indexOf(id) != -1) {
        currentStarred.splice(currentStarred.indexOf(id), 1);
        db.collection("users_students").doc(user_email).update({ starred: currentStarred }).then(function() {
            $(".toggleStar" + id).html(starEmpty);
            if (toggleStar) {
                filterTrips();
            }
        }).catch(function(error) {
            alert(error.message);
        });
    } else {
        currentStarred[currentStarred.length] = id;
        db.collection("users_students").doc(user_email).update({ starred: currentStarred }).then(function() {
            $(".toggleStar" + id).html(starFilled);
        }).catch(function(error) {
            alert(error.message);
        });
    }
}

function loadTrips() {
    db.collection("interims").orderBy("name").get().then(function(qS) {
        $(".navbar-brand h3").html("Explore Trips (" + qS.size + ")");
        qS.forEach(function(doc) {
            var trip = doc.data();
            var id = trip.id;
            tripList["id_" + id] = [trip.id, trip.name, "", trip.category, "", "", trip.price_bracket, ""];
            /* var categories = "";
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
            } */
            var price = formatter.format(trip.price);
            price = price.substring(0, price.length - 3);
            $(".card-columns").append("<div class = 'card tripCard' tabindex = '0' ontouchstart = '' id = 'tripCard" + id + "'><div class = 'card-header'><div class = 'card-text toggleStar d-inline-block toggleStar" + id + "' tabindex = '0' style = 'margin-bottom: 0 !important'>" + (currentStarred.indexOf(id) != -1 ? starFilled : starEmpty) + "</div></div><div class = 'card-body trip'><h4 class = 'card-title mb-2'>" + trip.name + "</h4><h6 class = 'card-text'>" + trip.category + "</h6><h6 class = 'card-text'>HKD" + price + "</h6><p class = 'card-text mb-0'>" + trip.description + "</p></div></div>");
            $clamp($("#tripCard" + id + " p")[0], { clamp: 5, useNativeClamp: false });
            $("#tripCard" + id).keypress(function(event) {
                if (event.keyCode == 32) {
                    $("#tripCard" + id).trigger("click");
                    return false;
                }
            });
            $(".toggleStar" + id).off("click");
            $(".toggleStar" + id).off("keypress");
            $(".toggleStar" + id).click(function(event) {
                event.preventDefault();
                event.stopPropagation();
                changeStar(id, "normal");
            });
            $(".toggleStar" + id).keypress(function(event) {
                if (event.keyCode == 32) {
                    $(this).trigger("click");
                    return false;
                }
            });
            $("#tripCard" + id).click(function() {
                $("#tripModal .modal-title").html(trip.name);
                $("#tripModal .modal-body").empty();
                $("#tripModal .modal-body").append("<div class = 'modalStar toggleStar toggleStar" + id + "' tabindex = '0'>" + (currentStarred.indexOf(id) != -1 ? starFilled : starEmpty) + "</div>");
                $(".toggleStar" + id).off("click");
                $(".toggleStar" + id).off("keypress");
                $(".toggleStar" + id).click(function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    changeStar(id, "modal");
                });
                $(".toggleStar" + id).keypress(function(event) {
                    if (event.keyCode == 32) {
                        $(this).trigger("click");
                        return false;
                    }
                });
                /* if (trip.new) {
                    $("#tripModal .modal-body").append("<div class = 'd-flex flex-column-reverse flex-md-row mb-2'><div><h6 class = 'card-text' style = 'color: red'>NEW</h6>");
                } */
                $("#tripModal .modal-body").append("<h6 class = 'card-text'>" + trip.category + "</h6>");
                $("#tripModal .modal-body").append("<h6 class = 'card-text'>HKD" + price + "</h6>");
                $("#tripModal .modal-body").append("<p class = 'mb-2'><span class = 'h6'>Supervisors:</span> " + trip.supervisors + "</p>");
                if (trip.room != "") {
                    $("#tripModal .modal-body").append("<p class = 'mb-2'><span class = 'h6'>Marketplace Room:</span> " + trip.room + "</p>");
                }
                $("#tripModal .modal-body").append("<h6 class = 'card-text'" + (trip.risk >= 3 ? " style = 'color: red'" : "") + ">Activity Risk Level " + trip.risk + "</h6>");
                for (var i = 0; i < trip.warnings.length; i++) {
                    $("#tripModal .modal-body").append("<h6 class = 'card-text' style = 'color: red'>" + trip.warnings[i] + "</h6>");
                }
                if (trip.video != "") {
                    $("#tripModal .modal-body").append("<div class = 'p-3 my-4' style = 'background-color: #AA272F'><div class = 'embed-responsive embed-responsive-16by9'><iframe class = 'embed-responsive-item' allowfullscreen frame-border = '0' src = '" + trip.video + "'></iframe></div></div>");
                } else {
                    $("#tripModal .modal-body").append("<br>");
                }
                $("#tripModal .modal-body").append(trip.content);
                $("#tripModal").modal("show");
            });
            if (trip.image != "") {
                $("#tripCard" + id).prepend("<div class = 'starHolder toggleStar toggleStar" + id + "' tabindex = '0'>" + (currentStarred.indexOf(id) != -1 ? starFilled : starEmpty) + "</div>");
                $("#tripCard" + id).prepend("<img src = \"" + trip.image + "\" style = 'position: relative' class = 'card-img-top trip'>");
                $("#tripCard" + id + " .card-header").remove();
                $(".toggleStar" + id).off("click");
                $(".toggleStar" + id).off("keypress");
                $(".toggleStar" + id).click(function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    changeStar(id, "picture");
                });
                $(".toggleStar" + id).keypress(function(event) {
                    if (event.keyCode == 32) {
                        $(this).trigger("click");
                        return false;
                    }
                });
            }
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
    for (var i in tripList) {
        matches[tripList[i][0]] = true;
    }
    $(".tripCard").removeClass("tripHidden");
    if (toggleStar) {
        for (var i in tripList) {
            if (currentStarred.indexOf(tripList[i][0]) == -1) {
                $("#tripCard" + tripList[i][0]).addClass("tripHidden");
                matches[tripList[i][0]] = false;
            }
        }
    }
    /*
    if ($("#tripRegion").val() !== "") {
        for (var i in tripList) {
            if (tripList[i][2] !== $("#tripRegion").val()) {
                $("#tripCard" + tripList[i][0]).addClass("tripHidden");
                matches[tripList[i][0]] = false;
            }
        }
    }
    */
    if ($("#tripCategory").val() !== "") {
        for (var i in tripList) {
            if (tripList[i][3] !== $("#tripRegion").val()) {
                $("#tripCard" + tripList[i][0]).addClass("tripHidden");
                matches[tripList[i][0]] = false;
            }
        }
    }
    /*if ($("#service").is(":checked")) {
        for (var i in tripList) {
            if (!tripList[i][3]) {
                $("#tripCard" + tripList[i][0]).addClass("tripHidden");
                matches[tripList[i][0]] = false;
            }
        }
    }
    if ($("#culture").is(":checked")) {
        for (var i in tripList) {
            if (!tripList[i][4]) {
                $("#tripCard" + tripList[i][0]).addClass("tripHidden");
                matches[tripList[i][0]] = false;
            }
        }
    }
    if ($("#adventure").is(":checked")) {
        for (var i in tripList) {
            if (!tripList[i][5]) {
                $("#tripCard" + tripList[i][0]).addClass("tripHidden");
                matches[tripList[i][0]] = false;
            }
        }
    }*/
    if ($("#tripPrice").val() !== "") {
        for (var i in tripList) {
            if (tripList[i][6].toString() !== $("#tripPrice").val()) {
                $("#tripCard" + tripList[i][0]).addClass("tripHidden");
                matches[tripList[i][0]] = false;
            }
        }
    }
    /* if ($("#newTrip").is(":checked")) {
        for (var i in tripList) {
            if (!tripList[i][7]) {
                $("#tripCard" + tripList[i][0]).addClass("tripHidden");
                matches[tripList[i][0]] = false;
            }
        }
    } */
    if ($("#searchTrips").val() !== "") {
        for (var i in tripList) {
            if (tripList[i][1].toLowerCase().indexOf($("#searchTrips").val().toLowerCase()) == -1) {
                $("#tripCard" + tripList[i][0]).addClass("tripHidden");
                matches[tripList[i][0]] = false;
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

$("#service, #culture, #adventure, #tripPrice").on("change", function() {
    filterTrips();
});

$("#searchTrips").on("input", function() {
    filterTrips();
});

$("form").submit(function() {
    return false;
});

firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		window.open("index.html", "_self");
    } else {
        firebase.auth().currentUser.getIdToken().then(function(token) {
            $.ajax({
                method: "GET",
                url: "https://us-central1-hkis-interim.cloudfunctions.net/student?token=" + token,
                dataType: "json"
            }).done(function(data) {
                if (data.admin != undefined) {
                    $("#signOut").before("<button class = 'btn btn-info ml-4' id = 'adminDash'>Admin Dashboard</button>");
                    $("#adminDash").click(function() {
                        window.open("admin.html", "_self");
                    });
                }
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