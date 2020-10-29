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

var toolbarGroups = [{ name: "styles", items: ["Format"] }, { name: "basicstyles", items: ["Bold", "Italic", "Underline"] }, { name: "paragraph", items: ["BulletedList", "NumberedList", "-", "Outdent", "Indent"] }, { name: "links", items: ["Link", "Unlink"] }];
CKEDITOR.replace("tripContent", { toolbar: toolbarGroups, format_h1: { element: "h3" }, format_tags: "p;h1" });

var tripList = {};
var lastId = 0;

var noImage = true;
var imageChanged = false;;

function searchTrips() {
	var matches = [];
	for (var i in tripList) {
        matches[tripList[i][0]] = true;
    }
    $(".list-group-item-action").removeClass("tripHidden");
    if ($("#searchTrips").val() !== "") {
        for (var i in tripList) {
            if (tripList[i][1].toLowerCase().indexOf($("#searchTrips").val().toLowerCase()) == -1) {
                $("#tripItem" + tripList[i][0]).addClass("tripHidden");
                matches[tripList[i][0]] = false;
            }
        }
    }
}

var starEmpty = '<svg width = "1.25em" height = "1.25em" viewBox = "0 0 16 16" fill = "currentColor" xmlns = "http://www.w3.org/2000/svg" style = "vertical-align: middle"><path fill-rule = "evenodd" d = "M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.523-3.356c.329-.314.158-.888-.283-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767l-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288l1.847-3.658 1.846 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.564.564 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" /></svg>';

function saveTrip(id) {
	$("button, input, select, textarea").attr("disabled", true);
	$(".list-group-item-action").addClass("disabled");
	CKEDITOR.instances["tripContent"].setReadOnly(true);
	$("#saveTrip").html("<div class = 'spinner-border spinner-border-sm align-middle'></div>");
	var trip = {
		id: id,
		name: $("#tripName").val(),
		category: $("#tripCategory").val(),
		// region: $("#tripRegion").val(),
		// service: $("#service").is(":checked"),
		// culture: $("#culture").is(":checked"),
		// adventure: $("#adventure").is(":checked"),
		price: $("#tripPrice").val(),
		// new: $("#new").is(":checked"),
		supervisors: $("#tripSupervisors").val(),
		room: $("#tripRoom").val(),
		risk: Number($("#tripRisk").val()),
		warnings: ($("#tripWarnings").val() != "" ? $("#tripWarnings").val().split("\n") : []),
		image: $("#tripImage").val(),
		video: $("#tripVideo").val(),
		description: $("#shortDescription").val(),
		content: CKEDITOR.instances["tripContent"].getData()
	};
	if (trip.price <= 5000) {
		trip.price_bracket = 1;
	} else if (trip.price > 5000 && trip.price <= 8000) {
		trip.price_bracket = 2;
	} else {
		trip.price_bracket = 3;
	}
	db.collection("interims").doc(id.toString()).set(trip).then(function() {
		$("#tripItem" + id + " h5").html($("#tripName").val());
		$("button, input, select, textarea").removeAttr("disabled");
		$(".list-group-item-action").removeClass("disabled");
		CKEDITOR.instances["tripContent"].setReadOnly(false);
		$("#saveTrip").html("Save and Update Preview");
		if (id == (lastId + 1)) {
			lastId++;
			location.reload();
		} else {
			editTrip(id);
		}
	}).catch(function(error) {
		alert(error.message);
	});
}

function deleteTrip(id) {
	if (confirm("Are you sure that you want to delete " + tripList["id_" + id][1] + "? THIS CANNOT BE UNDONE.")) {
		db.collection("interims").doc(id.toString()).delete().then(function() {
			location.reload();
		}).catch(function(error) {
			alert(error.message);
		});
	}
}

function editTrip(id) {
	$("#tripEditor").addClass("d-none");
	$("h3.card-title").html("<div class = 'd-flex flex-row mb-0'><div><h3 class = 'card-title mb-0'>Editing " + tripList["id_" + id][1] + " <span class = 'h3' style = 'color: red'>ID " + tripList["id_" + id][0] + "</span></h3></div><div class = 'spinner-border ml-auto'></div>");
	$(".list-group-item-action").addClass("disabled");
	imageChanged = false;
	db.collection("interims").doc(id.toString()).get().then(function(doc) {
		var trip = doc.data();
		$("#tripName").val(trip.name);
		$("#tripCategory").val(trip.category);
		// $("#tripRegion").val(trip.region);
		// $("#service").prop("checked", trip.service);
		// $("#culture").prop("checked", trip.culture);
		// $("#adventure").prop("checked", trip.adventure);
		$("#tripPrice").val(trip.price);
		var price = Number($("#tripPrice").val());
		var priceFormatted = formatter.format($("#tripPrice").val());
		$("#priceFormatted").html("HKD" + priceFormatted.substring(0, priceFormatted.length - 3));
		var priceBracket = "";
		if (price <= 5000) {
			$("#priceBracket").html("$");
		} else if (price > 5000 && price <= 8000) {
			$("#priceBracket").html("$$");
		} else {
			$("#priceBracket").html("$$$")
		}
		// $("#new").prop("checked", trip.new);
		$("#tripSupervisors").val(trip.supervisors);
		$("#tripRoom").val(trip.room);
		$("#tripRisk").val(trip.risk);
		$("#tripWarnings").val(trip.warnings.join("\n"));
		$("#tripImage").val(trip.image);
		$("#tripVideo").val(trip.video);
		$("#shortDescription").val(trip.description);
		CKEDITOR.instances["tripContent"].setData(trip.content);
		$("#tripEditor").removeClass("d-none");
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
        $("#previewCard img").remove();
        $("#previewCard .starHolder").remove();
        $("#previewCard .card-header").remove();
        $("#previewCard").prepend("<div class = 'card-header'><div class = 'card-text toggleStar d-inline-block' style = 'margin-bottom: 0 !important; cursor: default !important'>" + starEmpty + "</div></div>");
		$("#previewCard .card-body").html("<h6 class = 'card-title mb-2'>" + trip.name + "</h6><h4 class = 'card-text'>" + trip.category + "</h6><h6 class = 'card-text'>HKD" + priceFormatted.substring(0, priceFormatted.length - 3) + "</h6><p class = 'card-text mb-0' id = 'previewDescription'>" + trip.description + "</p>");
		$("#tripModal .modal-title").html(trip.name);
		$("#tripModal .modal-body").empty();
		/* if (trip.new) {
			$("#tripModal .modal-body").append("<h6 class = 'card-text' style = 'color: red'>NEW</h6>");
		} */
		$("#tripModal .modal-body").append("<h6 class = 'card-text'>" + trip.category + "</h6>");
		$("#tripModal .modal-body").append("<h6 class = 'card-text'>HKD" + priceFormatted.substring(0, priceFormatted.length - 3) + "</h6>");
		$("#tripModal .modal-body").append("<p class = 'mb-2'><span class = 'h6'>Supervisors:</span> " + trip.supervisors + "</p>");
		if (trip.room != "") {
			$("#tripModal .modal-body").append("<p class = 'mb-2'><span class = 'h6'>Marketplace Room:</span> " + trip.room + "</p>");
		}
		$("#tripModal .modal-body").append("<h6 class = 'card-text'" + (trip.risk >= 3 ? " style = 'color: red'" : "") + ">Activity Risk Level " + trip.risk + "</h6>");
		for (var i = 0; i < trip.warnings.length; i++) {
			$("#tripModal .modal-body").append("<h6 class = 'card-text' style = 'color: red'>" + trip.warnings[i] + "</h6>");
		}
		if (trip.image != "") {
			$("#previewCard").prepend("<div class = 'starHolder toggleStar' style = 'cursor: default !important'>" + starEmpty + "</div>");
            $("#previewCard").prepend("<img src = \"" + trip.image + "\" style = 'position: relative' class = 'card-img-top trip'>");
            $("#previewCard .card-header").remove();
		}
		if (trip.video != "") {
			$("#tripModal .modal-body").append("<div class = 'p-3 my-4' style = 'background-color: #AA272F'><div class = 'embed-responsive embed-responsive-16by9'><iframe class = 'embed-responsive-item' allowfullscreen frame-border = '0' src = '" + trip.video + "'></iframe></div></div>");
		}
		$("#tripModal .modal-body").append(trip.content);
		$("#previewCard").keypress(function(event) {
            if (event.keyCode == 32) {
                $("#previewCard").trigger("click");
                return false;
            }
        });
		$("#previewCard").click(function() {
			$("#tripModal").modal("show");
		});
		setTimeout(function() { $("#previewDescription").each(function(i, element) { $clamp(element, { clamp: 5, useNativeClamp: false }) }) }, 100);
    	$("#previewCard").removeClass("d-none");
		$(".spinner-border").remove();
		$(".list-group-item-action").removeClass("disabled");
		$("#saveTrip").click(function() {
			saveTrip(trip.id);
		});
		$("#discardChanges").click(function() {
			editTrip(trip.id);
		});
		$("#deleteTrip").click(function() {
			deleteTrip(trip.id);
		});
	});
}

$("#newTrip").click(function() {
	$("h3.card-title").html("<h3 class = 'card-title mb-0'>Editing NEW TRIP <span class = 'h3' style = 'color: red'>ID " + (lastId + 1) + "</span></h3>");
	$("#tripName").val("NEW TRIP");
	$("#tripCategory").val("");
	// $("#tripRegion").val("Region...");
	// $("#service").prop("checked", false);
	// $("#culture").prop("checked", false);
	// $("#adventure").prop("checked", false);
	$("#tripPrice").val("0");
	$("#priceFormatted").html("HKD$0");
	$("#priceBracket").html("$");
	// $("#new").prop("checked", false);
	$("#tripSupervisors").val("");
	$("#tripRoom").val("");
	$("#tripRisk").val("1");
	$("#tripWarnings").val("");
	$("#tripImage").val("");
	$("#tripVideo").val("");
	$("#shortDescription").val("");
	CKEDITOR.instances["tripContent"].setData(template = "<h3>OBJECTIVES</h3><ul><li>&nbsp;</li></ul><h3>DESCRIPTION</h3><p>&nbsp;</p><h3>SKILLS</h3><ul><li>&nbsp;</li></ul><h3>REQUIRED PRE-INTERIM TRAINING OR ACTIVITIES</h3><p>&nbsp;</p><h3>ADDITIONAL RESPONSIBILITIES</h3><p>&nbsp;</p>");
	$("#tripEditor").removeClass("d-none");
	$("#previewCard").addClass("d-none");
	$("#saveTrip").click(function() {
		saveTrip(lastId + 1);
	});
	$("#discardChanges").unbind("click");
	$("#deleteTrip").unbind("click");
});

db.collection("interims").orderBy("name").get().then(function(qS) {
	qS.forEach(function(doc) {
		var trip = doc.data();
		tripList["id_" + trip.id] = [trip.id, trip.name];
		$(".list-group").append("<a href = '#' class = 'list-group-item list-group-item-action' id = 'tripItem" + trip.id + "' tabindex = '0'><h5 class = 'mb-1'>" + trip.name + "</h5></a>");
		$("#tripItem" + trip.id).click(function() {
			editTrip(trip.id);
		});
		$("#tripItem" + trip.id).keypress(function(event) {
			if (event.keyCode == 32) {
                $("#tripItem" + trip.id).trigger("click");
                return false;
            }
		});
		if (lastId < trip.id) {
			lastId = trip.id;
		}
	});
});

$("#searchTrips").on("input", function() {
    searchTrips();
});

$("#tripPrice").on("input", function() {
	if ($("#tripPrice").val() != "") {
		var price = Number($("#tripPrice").val());
		var priceFormatted = formatter.format($("#tripPrice").val());
		$("#priceFormatted").html("HKD" + priceFormatted.substring(0, priceFormatted.length - 3));
		var priceBracket = "";
		if (price <= 5000) {
			$("#priceBracket").html("$");
		} else if (price > 5000 && price <= 8000) {
			$("#priceBracket").html("$$");
		} else {
			$("#priceBracket").html("$$$")
		}
	}
});

$("#warningSAT").click(function() {
	var text = "PLEASE NOTE: Students planning to take the March SAT should NOT sign up for this trip.";
	if ($("#tripWarnings").val() == "") {
		$("#tripWarnings").val(text);
	} else {
		$("#tripWarnings").val($("#tripWarnings").val() + "\n" + text);
	}
});

$("#warningMarketplace").click(function() {
	var text = "PLEASE NOTE: Due to the nature of this Interim, students intending to sign up must attend one of the Marketplace presentations.";
	if ($("#tripWarnings").val() == "") {
		$("#tripWarnings").val(text);
	} else {
		$("#tripWarnings").val($("#tripWarnings").val() + "\n" + text);
	}
});

$("#fillTemplate").click(function() {
	template = "<h3>OBJECTIVES</h3><ul><li>&nbsp;</li></ul><h3>DESCRIPTION</h3><p>&nbsp;</p><h3>SKILLS</h3><ul><li>&nbsp;</li></ul><h3>REQUIRED PRE-INTERIM TRAINING OR ACTIVITIES</h3><p>&nbsp;</p><h3>ADDITIONAL RESPONSIBILITIES</h3><p>&nbsp;</p>";
	CKEDITOR.instances["tripContent"].setData(template);
});

/* function checkSize() {
	if ($(window).width() < 996) {
		alert("The admin dashboard is not optimized for mobile devices. Please use a desktop device to access the admin dashboard.");
		window.open("dash.html", "_self");
	}
}
$(window).resize(function() {
	checkSize();
});
checkSize(); */

firebase.auth().onAuthStateChanged(function(user) {
	if (!user) {
		window.open("index.html", "_self");
    } else {
        firebase.auth().currentUser.getIdToken().then(function(token) {
            $.ajax({
                method: "GET",
                url: "https://asia-east2-hkis-interim.cloudfunctions.net/student?token=" + token,
                dataType: "json"
            }).done(function(data) {
            	if (data.admin == undefined) {
            		window.open("dash.html", "_self");
            	} else {
            		$("#userName").html(data.name);
	                user_email = data.email;
	                $("#fade").fadeOut(function() { $(this).remove() });
            	}
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

$("#adminDash").click(function() {
	window.open("dash.html", "_self");
});