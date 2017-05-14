/**
 * Created by yecalvin on 2017-03-27.
 */

// wrap script in this function
$(document).ready(function(){

    $("#btnUpload").click(function () {
        var fileToLoad = document.getElementById("fileUpload").files[0];
        var fileReader = new FileReader();
        fileReader.readAsArrayBuffer(fileToLoad);
        fileReader.onload = function (evt) {
            var id = fileToLoad.name.split('.')[0];
            var content = evt.target.result;
            var formData = new FormData();
            formData.append('body', new Blob([content]));

            $.ajax({
                url: 'http://localhost:4321/dataset/' + id,
                type: 'put',
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
            }).done(function (data) {
                console.log(fileToLoad.name + ' was succesfully uploaded.');
            }).fail(function (data) {
                console.log('ERROR - Failed to upload' + fileToLoad.name + '.');
            })
        }
    });

    var deptQuery = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "courses_dept"
            ],
            "ORDER": "courses_dept",
            "FORM": "TABLE"
        }
    };

    var courseNumQuery = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "courses_id"
            ],
            "ORDER": "courses_id",
            "FORM": "TABLE"
        }
    };

    var titleQuery = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "courses_title"
            ],
            "ORDER": "courses_title",
            "FORM": "TABLE"
        }
    };

    var secSize = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "courses_fail",
                "courses_pass"
            ],
            "FORM": "TABLE"
        }
    };

    var instr = {
        "WHERE": {},
        "OPTIONS": {
            "COLUMNS": [
                "courses_instructor"
            ],
            "ORDER": "courses_instructor",
            "FORM": "TABLE"
        }
    };

    $('#btnLoadDept').click(function () {
        loadResults(deptQuery, 'dept', addToDeptList)
    });
    $('#dept').prop('selected', true);

    $('#btnLoadCourseNum').click(function () {
        loadResults(courseNumQuery, 'courseNum', addToCourseNumList)
    });
    $('#courseNum').prop('selected', true);

    $('#btnLoadTitle').click(function () {
        loadResults(titleQuery, 'title', addToTitleList)
    });
    $('#title').prop('selected', true);

    $('#btnLoadSecSize').click(function () {
        loadResults(secSize, 'secSize', addToSecSizeList)
    });
    $('#secSize').prop('selected', true);

    $('#btnLoadInstr').click(function () {
        loadResults(instr, 'instr', addToInstrList)
    });
    $('#instr').prop('selected', true);
    dropdownSelector(['AND', 'OR'], 'andOr');
    $('#andOr').prop('selected', true);

    function loadResults(query, id, addToListFunc) {
        console.log("query", query);

        $.ajax({
            url: 'http://localhost:4321/query',
            type: 'post',
            data: JSON.stringify(query),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (data) {
            console.log("Response", data);
            addToListFunc(data.result, id);
        }).fail(function () {
            console.error("ERROR - Failed to submit query");
        });
    }

    function addToDeptList(data, id) {
        var deptList = [];
        $.each(data, function (key, value) {
            if (!deptList.includes(value.courses_dept)) {
                deptList.push(value.courses_dept);
            }
        });
        console.log("courses_dept", deptList);
        dropdownSelector(deptList, id);
    }

    function addToCourseNumList(data, id) {
        var courseNumList = [];
        $.each(data, function (key, value) {
            if (!courseNumList.includes(value.courses_id)) {
                courseNumList.push(value.courses_id);
            }
        });
        console.log("courses_id", courseNumList);
        dropdownSelector(courseNumList, id);
    }

    function addToTitleList(data, id) {
        var titleList = [];
        $.each(data, function (key, value) {
            if (!titleList.includes(value.courses_title)) {
                titleList.push(value.courses_title);
            }
        });
        console.log("courses_title", titleList);
        dropdownSelector(titleList, id);
    }

    function addToSecSizeList(data, id) {
        console.log("DATA", data);
        var secSizeList = [];
        $.each(data, function (key, value) {
            if (!secSizeList.includes(JSON.stringify(value.courses_fail + value.courses_pass))) {
                secSizeList.push(JSON.stringify(value.courses_fail + value.courses_pass));
            }
        });
        console.log("courses_secSize", secSizeList);
        dropdownSelector(secSizeList, id);
    }

    function addToInstrList(data, id) {
        var instrList = [];
        $.each(data, function (key, value) {
            if (!instrList.includes(value.courses_instructor)) {
                instrList.push(value.courses_instructor);
            }
        });
        console.log("courses_instructor", instrList);
        dropdownSelector(instrList, id);
    }

    function dropdownSelector(list, id) {
        //console.log(list);
        //console.log("id", id);
        console.log(id);
        var select = document.getElementById(id);
        console.log(select);
        for (var i = 0; i < list.length; i++) {
            var option = document.createElement('option');
            option.innerHTML = list[i];
            option.value = list[i];
            select.appendChild(option);
        }
        console.log("select", select);
    }

    $("#btnSubmitQuery").click(function () {
        var dept = $('#dept option:selected').val();
        if (dept === "null") {
            console.log("dept null");
            dept = "*;*";
        }
        var courseNum = $('#courseNum option:selected').val();
        if (courseNum === "null") {
            console.log("courseNum null");
            courseNum = "*;*";
        }
        var title = $('#title option:selected').val();
        if (title === "null") {
            console.log("title null");
            title = "*;*";
        }
        var secSize = $('#secSize option:selected').val();
        if (secSize === "null") {
            console.log("secSize null");
            secSize = "*;*";
        }
        var instr = $('#instr option:selected').val();
        if (instr === "null") {
            console.log("instr null");
            instr = "*;*";
        }
        var andOr = $('#andOr option:selected').val();

        console.log("Submitted");
        console.log("Selected", dept);
        console.log("Selected", courseNum);
        console.log("Selected", title);
        console.log("Selected", secSize);
        console.log("Selected", instr);
        console.log("Selected", andOr);

        // TODO: Fix query and make it more felixable to user input
        // TODO: Make dropdown for AND/OR
        var query = {
            "WHERE": {
                "AND": [
                    {
                        "IS": {"courses_instructor": instr}
                    },
                    {
                        "IS": {"courses_dept": dept}
                    }
                ]


            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg",
                    "courses_audit",
                    "courses_instructor",
                    "courses_title",
                    "courses_pass",
                    "courses_uuid"
                ],
                "ORDER": "courses_dept",
                "FORM": "TABLE"
            }
        };

        console.log("query", query);

        $.ajax({
            url: 'http://localhost:4321/query',
            type: 'post',
            data: JSON.stringify(query),
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (data) {
            console.log("Response", data);
            generateTable(data.result);
        }).fail(function () {
            console.error("ERROR - Failed to submit query");
        });
    });

    $("#btnQueryField").click(function () {
        $("#enterQueryField").toggle();
    });
    $("#btnSubmit").click(function () {
        var query = $("#txtQuery").val();
        console.log("query", query);

        $.ajax({
            url: 'http://localhost:4321/query',
            type: 'post',
            data: query,
            dataType: 'json',
            contentType: 'application/json'
        }).done(function (data) {
            console.log("Response", data);
            generateTable(data.result);
        }).fail(function () {
            console.error("ERROR - Failed to submit query");
        });
    });

    function generateTable(data) {
        var tbl_body = document.createElement("tbody");
        var odd_even = false;
        console.log("DATA", data);
        $.each(data, function () {
            var tbl_row = tbl_body.insertRow();
            tbl_row.className = odd_even ? "odd" : "even";
            $.each(this, function (k, v) {
                var cell = tbl_row.insertCell();
                cell.appendChild(document.createTextNode(v.toString()));
            });
            odd_even = !odd_even;
        });
        document.getElementById("tblResults").appendChild(tbl_body);
    }



        $("#btnSubmitQuery").click(function () {
            var dept = $('#dept').val();
            if (dept === "null") {
                console.log("dept null");
                dept = "**";
            }
            var courseNum = $('#cid').val();
            if (courseNum === "null") {
                console.log("courseNum null");
                courseNum = "**";
            }
            var title = $('#title').val();
            if (title === "null") {
                console.log("title null");
                title = "**";
            }
            var instr = $('#instructor').val();
            if (instr === "null") {
                console.log("instr null");
                instr = "**";
            }
            var secSize = $('#size').val();
            if (instr === "null") {
                console.log("secSize null");
                secSize = "*;*";
            }
            var andOr = $('#andOr option:selected').val();
            andOr = "AND"
            //TODO: fix this

            console.log("Submitted");
            console.log("Selected", dept);
            console.log("Selected", courseNum);
            console.log("Selected", title);
            console.log("Selected", size);
            console.log("Selected", instr);
            console.log("Selected", andOr);

            // TODO: Fix query and make it more felixable to user input
            // TODO: Make dropdown for AND/OR
            var query = {
                "WHERE": {},
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_dept",
                        "courses_id",
                        "courses_avg",
                        "courses_audit",
                        "courses_instructor",
                        "courses_title",
                        "courses_pass",
                        "courses_uuid"
                    ],
                    "ORDER": "courses_dept",
                    "FORM": "TABLE"
                }
            };

            query["WHERE"][andOr] = [];
            query["WHERE"][andOr].push({"IS": {"courses_instructor": instr.toLowerCase()}});
            query["WHERE"][andOr].push({"IS": {"courses_title": title.toLowerCase()}})
            query["WHERE"][andOr].push({"IS": {"courses_dept": dept.toLowerCase()}});
            query["WHERE"][andOr].push({"IS": {"courses_id": courseNum}});
            //TODO: section size
            //TODO: order

            console.log("query", query);

            $.ajax({
                url: 'http://localhost:4321/query',
                type: 'post',
                data: JSON.stringify(query),
                dataType: 'json',
                contentType: 'application/json'
            }).done(function (data) {
                console.log("Response", data);
                generateTable(data.result);
            }).fail(function () {
                console.error("ERROR - Failed to submit query");
            });
        });

        $("#btnQueryField").click(function () {
            $("#enterQueryField").toggle();
        });
        $("#btnSubmit").click(function () {
            var query = $("#txtQuery").val();
            console.log("query", query);

            $.ajax({
                url: 'http://localhost:4321/query',
                type: 'post',
                data: query,
                dataType: 'json',
                contentType: 'application/json'
            }).done(function (data) {
                console.log("Response", data);
                generateTable(data.result);
            }).fail(function () {
                console.error("ERROR - Failed to submit query");
            });
        });

        function generateTable(data) {
            var tbl_body = document.createElement("tbody");
            var odd_even = false;
            console.log("DATA", data);
            $.each(data, function () {
                var tbl_row = tbl_body.insertRow();
                tbl_row.className = odd_even ? "odd" : "even";
                $.each(this, function (k, v) {
                    var cell = tbl_row.insertCell();
                    cell.appendChild(document.createTextNode(v.toString()));
                });
                odd_even = !odd_even;
            });
            document.getElementById("tblResults").appendChild(tbl_body);
        }
});