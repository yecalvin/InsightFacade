/**
 * Created by Chris on 2017-03-28.
 */
$(document).ready(function(){

    $('#quality').hide();

    //todo: make searchable if there is time
    $('#rooms').multiSelect();
    $('#distroom').select2();
    $('#courses').select2();


    $("#btnSchedule").click(function () {

        //make lists
        var courselist = []
        var numlist = [];
        var roomlist = [];
        $('#rooms option:selected').each(function(){
            roomlist.push($(this).val());
        });

        if(roomlist.length === 0 && $("#distroom option:selected").val() === ""){
            alert("Please select at least one building");
            throw("error: no building selected");
        }

        $('#courses option:selected').each(function(){
            if(!($(this).val() === "")) {
                courselist.push($(this).val());
            }
        });

        if(!($("#numbers").val() === "")) {
            numlist.push($('#numbers').val());
        }

        if(numlist.length === 0 && courselist.length === 0) {
            alert("Please select a department or a course number");
            throw("error: no dept/num selected");
        }

        //make courses query

        //schedule courses in rooms

        $.when(getCourses(courselist,numlist),getRooms(roomlist)).done(function(courselist, roomlist){
            courselist = courselist[0].result;
            roomlist = roomlist[0].result;

            console.log(courselist);
            console.log(roomlist);

            mwf = {8:[], 9:[], 10:[], 11:[], 12:[], 1:[], 2:[], 3:[], 4:[], 5:[]};
            tuth = {8:[],930:[],11:[],1230:[],2:[],330:[]};

            total = getQuality(courselist);

            populateCoursesTable(courselist);

            schedule(courselist, roomlist, mwf);
            schedule(courselist, roomlist, tuth);

            console.log(mwf);
            console.log(tuth);

            quality = getQuality(courselist);

            populateTableMWF(mwf);
            populateTableTUTH(tuth);
            writeQuality(total,quality);

            console.log("Total # of sections: ", total);
            console.log("unscheduled: ", quality);

        });
    });

    function getCourses(courselist, numlist){
        var query = {
            "WHERE": {
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "numSections",
                    "maxSize"
                ],
                "ORDER": {"dir":"UP", "keys":["courses_dept", "courses_id"]},
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept","courses_id"],
                "APPLY": [
                    {
                        "numSections": {"COUNT":"courses_uuid"}
                    },
                    {
                        "maxSize": {"MAX":"courses_size"}
                    }
                ]
            }
        };

        var choice = $('#andOrcourse option:selected').val();
        var subq = {"AND":[{}, {"EQ":{"courses_year":2014}}]};

        subq["AND"][0][choice] = [];
        props = subq["AND"][0][choice];

        for(var i in courselist){
            props.push({"IS":{"courses_dept":courselist[i]}})
        }

        for(var i in numlist){
            props.push({"IS":{"courses_id":numlist[i]}})
        }



        query["WHERE"] = subq;
        console.log(query);


        //perform courses query

        return $.ajax({
            url: 'http://localhost:4321/query',
            type: 'post',
            data: JSON.stringify(query),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (data) {
            courselist = data.result;
        }).fail(function () {
            console.error("ERROR - Failed to submit query");
        });
    }

    function getRooms(roomlist){

        //make rooms query
        var query = {
            "WHERE": {
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name",
                    "rooms_lat",
                    "rooms_lon",
                    "rooms_seats"
                ],
                "ORDER": "rooms_seats",
                "FORM": "TABLE"
            }
        };
        var andOr = $("#andOr option:selected").val();
        query["WHERE"][andOr] = [];
        if(roomlist.length != 0) {
            subq = {"OR": []}
            for (var i in roomlist) {
                subq["OR"].push({"IS": {"rooms_shortname": roomlist[i]}})
            }
            query["WHERE"][andOr].push(subq);
        }


        var distfrom = $("#distance").val();
        var distroom = $("#distroom option:selected").val();
        if(distroom != ""){

            if(distfrom <= 0 ){
                alert("Distance must greater than 0");
                throw("Distance must greater than 0");
            }

            //get lat lon of distroom
            var llquery = {
                "WHERE": {
                    "IS":{"rooms_shortname":distroom}
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_lat",
                        "rooms_lon"
                    ],
                    "FORM": "TABLE"
                }
            };
            var lat = 0;
            var lon = 0;

            $.ajax({
                url: 'http://localhost:4321/query',
                type: 'post',
                data: JSON.stringify(llquery),
                dataType: 'json',
                contentType: 'application/json',
                success: function(result) {
                    console.log(result);
                        lat = result.result[0]["rooms_lat"];
                        lon = result.result[0]["rooms_lon"];
                },
                error: function(err){
                    alert(err);
                },
                async: false
            });

            //turn distance into lat/lon boundary
            const r_earth = 63780000;
            var latlow = lat - (distfrom / r_earth) * (180/Math.PI);
            var lathigh = lat + (distfrom / r_earth) * (180/Math.PI);
            var lonlow = lon - (distfrom / r_earth) * (180/Math.PI)/Math.cos(lat*Math.PI/180);
            var lonhigh = lon + (distfrom / r_earth) * (180/Math.PI)/Math.cos(lat*Math.PI/180);


            llq = {"AND":[{"GT":{"rooms_lat":latlow}}, {"LT":{"rooms_lat":lathigh}}, {"GT":{"rooms_lon":lonlow}}, {"LT":{"rooms_lon":lonhigh}}]};
            query["WHERE"][andOr].push(llq);
        }


        //perform rooms query

        return $.ajax({
            url: 'http://localhost:4321/query',
            type: 'post',
            data: JSON.stringify(query),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (data) {
            roomlist = data.result;
        }).fail(function () {
            console.error("ERROR - Failed to submit query");
        });
    }

    function schedule(courselist, roomlist, day){

        for(var i in courselist){
            var toSchedule = Math.ceil(courselist[i]["numSections"]/3)
            for(var time in day) {
                if(toSchedule > 0 && notScheduled(courselist[i], day, time)) {
                    for (var k in roomlist) {
                        if (courselist[i]["maxSize"] < roomlist[k]["rooms_seats"] && isAvailable(roomlist[k], day, time)) {
                            scheduleClass(courselist[i], roomlist[k], day, time);
                            toSchedule--;
                            break;
                        }
                    }
                }
                if(toSchedule <= 0){
                    break;
                }
            }
            courselist[i]["numSections"] = toSchedule * 3;
        }
    }

    function scheduleClass(course, room, day, time){
        var scheduledClass = {};
        scheduledClass["room"] = room["rooms_name"];
        scheduledClass["course"] = course["courses_dept"] + course["courses_id"];
        scheduledClass["size"] = course["maxSize"];
        scheduledClass["seats"] = room["rooms_seats"];
        day[time].push(scheduledClass);
    }

    function notScheduled(course, day, time){

        var name = course["courses_dept"] + course["courses_id"];
        var flag = true;
        for(var i in day[time]){
            if(day[time][i]["course"] === name){
                flag = false
                break;
            }
        }
        return flag;
    }

    function isAvailable(room, day, time){
        var name = room["rooms_name"];
        flag = true;
        for(var i in day[time]){
            if(day[time][i]["room"] === name){
                flag = false;
                break;
            }
        }
        return flag;
    }

    function getQuality(courselist) {
        var unscheduled = 0;
        for (var i in courselist) {
            unscheduled += Math.ceil(courselist[i]["numSections"] / 3)
        }
        return unscheduled;
    }

    function populateTableMWF(schedule) {
        $('#bodymwf tr').remove();
        populateTable(schedule[8], "mwf", "8:00-9:00");
        populateTable(schedule[9], "mwf", "9:00-10:00");
        populateTable(schedule[10], "mwf", "10:00-11:00");
        populateTable(schedule[11], "mwf", "11:00-12:00");
        populateTable(schedule[12], "mwf", "12:00-1:00");
        populateTable(schedule[1], "mwf", "1:00-2:00");
        populateTable(schedule[2], "mwf", "2:00-3:00");
        populateTable(schedule[3], "mwf", "3:00-4:00");
        populateTable(schedule[4], "mwf", "4:00-5:00");
    }

    function populateTableTUTH(schedule){
        $('#bodytuth tr').remove();
        populateTable(schedule[8], "tuth", "8:00-9:30");
        populateTable(schedule[930], "tuth", "9:30-11:00");
        populateTable(schedule[11], "tuth", "11:00-12:30");
        populateTable(schedule[1230], "tuth", "12:30-2:00");
        populateTable(schedule[2], "tuth", "2:00-3:30");
        populateTable(schedule[330], "tuth", "3:30-5:00");
    }

    function populateTable(slot,id, time){
        for(var i in slot){
            var htmlstring = "<tr><td>" + time +"</td>"
                + "<td>" + slot[i]["course"] +"</td>"
                + "<td>" + slot[i]["room"] + "</td>"
                + "<td>" + slot[i]["seats"] + "</td>"
                + "<td>" + slot[i]["size"] + "</td></tr>";

            $('#body' + id).append(htmlstring);
        }
    }

    function writeQuality(total,quality){
        $('#quality').text("The quality of this schedule is " + (total-quality) + "/" + total + ". (" + quality +" unscheduled, " + total + " total)");
        $('#quality').show();
    }

    function populateCoursesTable(courselist){
        $('#coursebody tr').remove();
        for(var i in courselist){
            var htmlstring = "<tr><td>" + courselist[i]["courses_dept"] + courselist[i]["courses_id"] + "</td>"
            + "<td>" + Math.ceil(courselist[i]["numSections"]/3) + "</td>"
            + "<td>" + courselist[i]["maxSize"] + "</td></tr>";

            $('#coursebody').append(htmlstring);
        }
    }


});