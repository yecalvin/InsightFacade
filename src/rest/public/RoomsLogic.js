/**
 * Created by yecalvin on 2017-03-28.
 */

var roomNames = [];
var roomNumbers = [];
var roomSizes = [];
var roomTypes = [];
var FurnitureTypes = [];
var locations = [];
var roomsFullName = [];
var roomsFullName2 = [];

var isOR;
var a;
var b;
var c;
var d;
var e;
var g;
var h;
var i;

var latnlon;
function handleGetLatLon(i) {
    query = {
        "WHERE": {
            "IS": {"rooms_fullname": i}
        },
        "OPTIONS": {
            "COLUMNS": ["rooms_lat",
                "rooms_lon"],
            "FORM": "TABLE"
        }
    };

    console.log(query);

    $.ajax({
        url: 'http://localhost:4321/query',
        type: 'post',
        data: JSON.stringify(query),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function (data) {

        console.log(data);
        latnlon = {lat: data.result[0].rooms_lat, lon: data.result[0].rooms_lon};
        return latnlon;
    }).fail(function () {
        console.error("ERROR - Failed to submit query");
    });
}

function queryButton() {
    console.log("button down");
    console.log(value);
}

function getRoomsFullName() {

    if (roomTypes.length != 0) return;

    query = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "rooms_fullname"
            ],
            "ORDER": "rooms_fullname",
            "FORM": "TABLE"
        }
    };

    $.ajax({
        url: 'http://localhost:4321/query',
        type: 'post',
        data: JSON.stringify(query),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function (data) {
        for (var dat in data) {
            for (var dat0 in data[dat]) {
                if (data[dat][dat0].rooms_fullname != undefined && !roomsFullName.includes(data[dat][dat0].rooms_fullname)) {
                    var option = "<option>" + data[dat][dat0].rooms_fullname + "</option>";
                    $('#sel1').append(option);
                    roomsFullName.push(data[dat][dat0].rooms_fullname);
                }
            }
        }
    }).fail(function () {
        console.error("ERROR - Failed to submit query");
    });
}

function getRoomName() {

    if (roomNames.length != 0) return;

    query = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "rooms_name"
            ],
            "ORDER": "rooms_name",
            "FORM": "TABLE"
        }
    };

    $.ajax({
        url: 'http://localhost:4321/query',
        type: 'post',
        data: JSON.stringify(query),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function (data) {
        for (var dat in data) {
            for (var dat0 in data[dat]) {
                if (data[dat][dat0].rooms_name != undefined && !roomNames.includes(data[dat][dat0].rooms_name)) {
                    var option = "<option>" + data[dat][dat0].rooms_name + "</option>";
                    $("#sel1").append(option);
                    roomNames.push(data[dat][dat0].rooms_name);
                }
            }
        }
    }).fail(function () {
        console.error("ERROR - Failed to submit query");
    });
    console.log("on change --- ")
}

function getRoomNumbers() {

    if (roomNumbers.length != 0) return;

    query = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "rooms_number"
            ],
            "ORDER": "rooms_number",
            "FORM": "TABLE"
        }
    };

    $.ajax({
        url: 'http://localhost:4321/query',
        type: 'post',
        data: JSON.stringify(query),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function (data) {
        for (var dat in data) {
            for (var dat0 in data[dat]) {
                if (data[dat][dat0].rooms_number != undefined && !roomNumbers.includes(data[dat][dat0].rooms_number)) {
                    var option = "<option>" + data[dat][dat0].rooms_number + "</option>";
                    $("#sel2").append(option);
                    roomNumbers.push(data[dat][dat0].rooms_number);
                }
            }
        }
    }).fail(function () {
        console.error("ERROR - Failed to submit query");
    });
}

function getRoomSize() {

    if (roomSizes.length != 0) return;

    query = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "rooms_seats"
            ],
            "ORDER": "rooms_seats",
            "FORM": "TABLE"
        }
    };

    $.ajax({
        url: 'http://localhost:4321/query',
        type: 'post',
        data: JSON.stringify(query),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function (data) {
        for (var dat in data) {
            for (var dat0 in data[dat]) {
                if (data[dat][dat0].rooms_seats != undefined && !roomSizes.includes(data[dat][dat0].rooms_seats)) {
                    var option = "<option>" + data[dat][dat0].rooms_seats + "</option>";
                    $("#sel3").append(option);
                    roomSizes.push(data[dat][dat0].rooms_seats);
                }
            }
        }
    }).fail(function () {
        console.error("ERROR - Failed to submit query");
    });
}

function getRoomType() {

    if (roomTypes.length != 0) return;

    query = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "rooms_type"
            ],
            "ORDER": "rooms_type",
            "FORM": "TABLE"
        }
    };

    $.ajax({
        url: 'http://localhost:4321/query',
        type: 'post',
        data: JSON.stringify(query),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function (data) {
        for (var dat in data) {
            for (var dat0 in data[dat]) {
                if (data[dat][dat0].rooms_type != undefined && !roomTypes.includes(data[dat][dat0].rooms_type)) {
                    var option = "<option>" + data[dat][dat0].rooms_type + "</option>";
                    $("#sel4").append(option);
                    roomTypes.push(data[dat][dat0].rooms_type);
                }
            }
        }
    }).fail(function () {
        console.error("ERROR - Failed to submit query");
    });
}

function getFurnitureType() {

    if (FurnitureTypes.length != 0) return;

    query = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "rooms_furniture"
            ],
            "ORDER": "rooms_furniture",
            "FORM": "TABLE"
        }
    };

    $.ajax({
        url: 'http://localhost:4321/query',
        type: 'post',
        data: JSON.stringify(query),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function (data) {
        for (var dat in data) {
            for (var dat0 in data[dat]) {
                if (data[dat][dat0].rooms_furniture != undefined && !FurnitureTypes.includes(data[dat][dat0].rooms_furniture)) {
                    var option = "<option>" + data[dat][dat0].rooms_furniture + "</option>";
                    $("#sel5").append(option);
                    FurnitureTypes.push(data[dat][dat0].rooms_furniture);
                }
            }
        }
    }).fail(function () {
        console.error("ERROR - Failed to submit query");
    });
}

function getRoomsFullName2() {

    if (roomTypes.length != 0) return;

    query = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "rooms_fullname"
            ],
            "ORDER": "rooms_fullname",
            "FORM": "TABLE"
        }
    };

    $.ajax({
        url: 'http://localhost:4321/query',
        type: 'post',
        data: JSON.stringify(query),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function (data) {
        for (var dat in data) {
            for (var dat0 in data[dat]) {
                if (data[dat][dat0].rooms_fullname != undefined && !roomsFullName2.includes(data[dat][dat0].rooms_fullname)) {
                    var option = "<option>" + data[dat][dat0].rooms_fullname + "</option>";
                    $('#sel7').append(option);
                    roomsFullName2.push(data[dat][dat0].rooms_fullname);
                }
            }
        }
    }).fail(function () {
        console.error("ERROR - Failed to submit query");
    });
}


$(document).ready(function () {

    $("#roomButton").click(function () {
        isOR = false;
        a = $("#sel1").val();
        setVariables();
        var f = "AND";
        handletheQuery(a, b, c, d, e, f, g);
    });

    $("#roomButtonOR").click(function () {
        isOR = true;
        setVariables();
        var f = "OR";
        handletheQuery(a, b, c, d, e, f, g);
    });

    function setVariables() {
        a = $("#sel1").val();
        if (a == null) {
            a = "**";
        } else {
            a.toString();
        }

        b = $("#sel2").val();
        if (b == null) {
            b = "**";
        } else {
            b.toString();
        }

        c = $("#sel3").val();

        if (c != null) {
            c = parseInt(c);
        }

        d = $("#sel4").val();
        if (d == null) {
            d = "**";
        } else {
            d = d.toString();
        }

        e = $("#sel5").val();
        if (e == null) {
            e = "**";
        } else {
            e = e.toString();
        }

        g = $("#filterRoomsInput").val();
        if (g == "") {
            g = "rooms_fullname,rooms_number,rooms_seats,rooms_type,rooms_furniture";
        }

        h = $("#sel6").val();
        h = parseInt(h);
        i = $("#sel7").val();

        if (isNaN(h) || i == null) {
            console.log("cannot do location");
            handleLocation = false;
        } else {
            console.log("can do location");
            latnlon = handleGetLatLon(i);
            handleLocation = true;
        }

    }



    function handletheQuery(a, b, c, d, e, f, g) {
        console.log(isOR);

        if (c == null && !isOR) {
            c = {"GT": {"rooms_seats": 0}};
        } else if (c == null && isOR) {
            c = {"EQ": {"rooms_seats": 99999999}};
        } else {
            c = {"GT": {"rooms_seats": c}};
        }

        var array = g.split(',');

        var arrayWithLatAndLon = array;
        arrayWithLatAndLon.push("rooms_lat");
        arrayWithLatAndLon.push("rooms_lon");

        if (f === "AND") {
            query = {
                "WHERE": {
                    "AND": [
                        {"IS": {"rooms_fullname": a}},
                        {"IS": {"rooms_number": b}},
                        c,
                        {"IS": {"rooms_type": d}},
                        {"IS": {"rooms_furniture": e}}
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": array,
                    "FORM": "TABLE"
                }
            };
        } else {
            var ORarray = [];
            var index = 0;

            if (a !== "**") {
                ORarray.push({"IS": {"rooms_fullname": a}});
            }
            if (b !== "**") {
                ORarray.push({"IS": {"rooms_number": b}});
            }
            if (c !== {"GT": {"rooms_seats": 0}}) {
                ORarray.push(c);
            }
            if (d !== "**") {
                ORarray.push({"IS": {"rooms_type": d}});
            }
            if (e !== "**") {
                ORarray.push({"IS": {"rooms_furniture": e}});
            }

            query = {
                "WHERE": {
                    "OR": ORarray
                },
                "OPTIONS": {
                    "COLUMNS": array,
                    "FORM": "TABLE"
                }
            };
        }

        $.ajax({
            url: 'http://localhost:4321/query',
            type: 'post',
            data: JSON.stringify(query),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (data) {
            var table = "";
            var name = "<tr>";
            for (var dat in array) {
                name += "<th>";
                name += array[dat];
                name += "</th>";
            }
            name += "</tr>";
            console.log(query);
            $("#roomsTable").empty().append(name);

            for (var key in data.result) {
                if (handleLocation) {

                    var lat0 = latnlon.lat;
                    var lon0 = latnlon.lon;

                    var lat = data.result[key].rooms_lat;
                    var lon = data.result[key].rooms_lon;

                    var dist = getDistanceFromLatLonInKm(lat, lon, lat0, lon0);

                    if (dist > h && !isOR) {
                        continue;
                    }
                }

                var tableEntry = "<tr>";
                for (var key1 in data.result[key]) {
                    var entry = "<td>" + data.result[key][key1] + "</td>";
                    tableEntry += entry;
                }
                tableEntry += "</tr>";
                table += tableEntry;
            }
            $("#roomsTable").append(table);

        }).fail(function () {
            console.error("ERROR - Failed to submit query");
        });
    }
});


function clearRoomsQuery() {
    $("#sel1").empty();
    $("#sel2").empty();
    $("#sel3").empty();
    $("#sel4").empty();
    $("#sel5").empty();
    $("#sel6").empty();
    $("#sel7").empty();

    $("#filterRoomsInput").empty();

    roomNames = [];
    roomNumbers = [];
    roomSizes = [];
    roomTypes = [];
    FurnitureTypes = [];
    locations = [];
    roomsFullName = [];
    roomsFullName2 = [];
    $("#roomsTable").empty();
}

function makeNewBar() {
    $("#roomsFilter").append(
        "<select id='roomsFilter' onclick='makeNewBar()'>" +
        "<option value='rooms_fullname'>rooms_fullname</option>" +
        "<option value='rooms_number'>rooms_number</option>" +
        "<option value='rooms_seats'>rooms_seats</option>" +
        "<option value='rooms_type'>rooms_type</option>" +
        "<option value='rooms_furniture'>rooms_furniture</option>" +
        "</select><br>");
}


//these two are from
// http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 1000; // Distance in m
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

var mapBuildingNames = [];

function getMapNames() {

    if (roomTypes.length != 0) return;

    query = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "rooms_fullname"
            ],
            "ORDER": "rooms_fullname",
            "FORM": "TABLE"
        }
    };

    $.ajax({
        url: 'http://localhost:4321/query',
        type: 'post',
        data: JSON.stringify(query),
        dataType: 'json',
        contentType: 'application/json'
    }).done(function (data) {
        for (var dat in data) {
            for (var dat0 in data[dat]) {
                if (data[dat][dat0].rooms_fullname != undefined && !mapBuildingNames.includes(data[dat][dat0].rooms_fullname)) {
                    var option = "<option>" + data[dat][dat0].rooms_fullname + "</option>";
                    $('#selMap').append(option);
                    mapBuildingNames.push(data[dat][dat0].rooms_fullname);
                }
            }
        }
    }).fail(function () {
        console.error("ERROR - Failed to submit query");
    });
}

// from https://www.w3schools.com/html/tryit.asp?filename=tryhtml_google_map_4
// and lots of googling
var building;
function handleMap() {
    $(document).ready(function () {
        $("#mapButton").click(function () {
            building = $("#selMap").val();
            handleGetLatLonP(building).then(function(data){
                var lat = latnlon.lat;
                var lon = latnlon.lon;
                console.log(lat);
                console.log(lon);

                var mapOptions1 = {
                    center: new google.maps.LatLng(lat, lon),
                    zoom: 18,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                var myLatlng = new google.maps.LatLng(lat,lon);
                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: mapOptions1,
                    title: 'Hello World!'
                });

                var map1 = new google.maps.Map(document.getElementById("googleMap1"), mapOptions1);
                marker.setMap(map1);

            });

            // var mapOptions1 = {
            //     center: new google.maps.LatLng(lat, lon),
            //     zoom: 9,
            //     mapTypeId: google.maps.MapTypeId.ROADMAP
            // };
            // var map1 = new google.maps.Map(document.getElementById("googleMap1"), mapOptions1);
        });

    })
}

function handleGetLatLonP(building){
    return new Promise(function(fulfill,reject){
        query = {
            "WHERE": {
                "IS": {"rooms_fullname": building}
            },
            "OPTIONS": {
                "COLUMNS": ["rooms_lat",
                    "rooms_lon"],
                "FORM": "TABLE"
            }
        };

        console.log(query);

        $.ajax({
            url: 'http://localhost:4321/query',
            type: 'post',
            data: JSON.stringify(query),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (data) {
            console.log(data);
            latnlon = {lat: data.result[0].rooms_lat, lon: data.result[0].rooms_lon};
            fulfill(latnlon);
        }).fail(function () {
            reject("invalid");
            console.error("ERROR - Failed to submit query");
        });

    });
}

// from https://www.w3schools.com/html/tryit.asp?filename=tryhtml_google_map_4

// function myMap() {
//     $(document).ready(function (){
//         var mapOptions1 = {
//             center: new google.maps.LatLng(51.508742, -0.120850),
//             zoom: 9,
//             mapTypeId: google.maps.MapTypeId.ROADMAP
//         };
//         var map1 = new google.maps.Map(document.getElementById("googleMap1"),mapOptions1);
//     });
//
// }