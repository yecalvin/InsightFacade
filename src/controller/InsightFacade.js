"use strict";
var Util_1 = require("../Util");
var util_1 = require("util");
var htmlFilePaths = [];
var count = 0;
var datasetList = [];
var JSZip = require("jszip");
var fs = require("fs");
var memory = { "id": null, "contents": [] };
var dict = {
    courses_dept: 'Subject', courses_id: 'Course', courses_avg: 'Avg', courses_fail: 'Fail',
    courses_instructor: 'Professor', courses_title: 'Title', courses_pass: 'Pass',
    courses_audit: 'Audit', courses_uuid: 'id', courses_year: 'Year', rooms_fullname: 'rooms_fullname',
    rooms_shortname: 'rooms_shortname', rooms_number: 'rooms_number', rooms_name: 'rooms_name',
    rooms_address: 'rooms_address', rooms_lat: 'lat',
    rooms_lon: 'lon', rooms_seats: 'rooms_seats', rooms_type: 'rooms_type', rooms_furniture: 'rooms_furniture',
    rooms_href: 'rooms_href'
};
var parse5 = require("parse5");
var http = require("http");
var InsightFacade = (function () {
    function InsightFacade() {
        Util_1.default.trace('InsightFacadeImpl::init()');
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        Util_1.default.info("In addDataset");
        var that = this;
        var fileName = id.concat(".json");
        var resultDoesNotExist = false;
        return new Promise(function (fulfill, reject) {
            if (!(id === "courses" || id === "rooms")) {
                reject({
                    code: 400,
                    body: { "error": "invalid id for addDataset" }
                });
            }
            that.parseZip(content, id).then(function (objectArray) {
                if (id !== "rooms") {
                    if (fs.existsSync(fileName)) {
                        memory.contents = [];
                        memory.id = id;
                        for (var _i = 0, objectArray_1 = objectArray; _i < objectArray_1.length; _i++) {
                            var jsonObject = objectArray_1[_i];
                            if (jsonObject.hasOwnProperty("result")) {
                                if (jsonObject.result.length !== 0) {
                                    for (var _a = 0, _b = jsonObject.result; _a < _b.length; _a++) {
                                        var courseFields = _b[_a];
                                        courseFields["Year"] = parseInt(courseFields["Year"]);
                                        if (courseFields["Section"] === "overall") {
                                            courseFields["Year"] = 1900;
                                        }
                                        memory.contents.push(courseFields);
                                    }
                                }
                            }
                        }
                        that.cacheFile(id, memory.contents).then(function () {
                            fulfill({
                                code: 201,
                                body: { "success": "the operation was successful and the id already existed (was added in this session or was previously cached)." }
                            });
                        });
                    }
                    else {
                        memory.contents = [];
                        memory.id = id;
                        for (var _c = 0, objectArray_2 = objectArray; _c < objectArray_2.length; _c++) {
                            var jsonObject = objectArray_2[_c];
                            if (jsonObject.hasOwnProperty("result")) {
                                if (jsonObject.result.length !== 0) {
                                    for (var _d = 0, _e = jsonObject.result; _d < _e.length; _d++) {
                                        var courseFields = _e[_d];
                                        courseFields["Year"] = parseInt(courseFields["Year"]);
                                        if (courseFields["Section"] === "overall") {
                                            courseFields["Year"] = 1900;
                                        }
                                        memory.contents.push(courseFields);
                                    }
                                }
                            }
                            else {
                                resultDoesNotExist = true;
                            }
                        }
                        if (memory.contents.length === 0 || resultDoesNotExist === true) {
                            reject({
                                code: 400,
                                body: { "error": "memory is empty or result does not exists." }
                            });
                        }
                        else {
                            that.cacheFile(id, memory.contents).then(function () {
                                datasetList.push(id);
                                fulfill({
                                    code: 204,
                                    body: { "success": "the operation was successful and the id was new (not added in this session or was previously cached)." }
                                });
                            });
                        }
                    }
                }
                else if (id === "rooms") {
                    if (fs.existsSync(fileName)) {
                        memory.contents = [];
                        memory.id = id;
                        for (var _f = 0, objectArray_3 = objectArray; _f < objectArray_3.length; _f++) {
                            var htmlObject = objectArray_3[_f];
                            for (var i in Object.keys(htmlObject["rooms_number"])) {
                                memory.contents.push({
                                    rooms_fullname: htmlObject["rooms_fullname"],
                                    rooms_shortname: htmlObject["rooms_shortname"],
                                    rooms_address: htmlObject["rooms_address"],
                                    rooms_number: htmlObject["rooms_number"][i],
                                    rooms_seats: parseInt(htmlObject["rooms_seats"][i]),
                                    rooms_furniture: htmlObject["rooms_furniture"][i],
                                    rooms_name: htmlObject["rooms_shortname"] + "_" + htmlObject["rooms_number"][i],
                                    rooms_type: htmlObject["rooms_type"][i],
                                    rooms_href: htmlObject["rooms_href"][i],
                                    lat: htmlObject["lat"],
                                    lon: htmlObject["lon"]
                                });
                            }
                        }
                        if (memory.contents.length === 0) {
                            reject({
                                code: 400,
                                body: { "error": "memory is empty or result does not exists." }
                            });
                        }
                        else {
                            console.log("memory: ", memory.contents);
                            that.cacheFile(id, memory.contents).then(function () {
                                fulfill({
                                    code: 201,
                                    body: { "success": "the operation was successful and the id already existed (was added in this session or was previously cached)." }
                                });
                            });
                        }
                    }
                    else {
                        memory.contents = [];
                        memory.id = id;
                        for (var _g = 0, objectArray_4 = objectArray; _g < objectArray_4.length; _g++) {
                            var htmlObject = objectArray_4[_g];
                            for (var i in Object.keys(htmlObject["rooms_number"])) {
                                if (htmlObject["lat"] === null || htmlObject["lon"] === null) {
                                    console.log(htmlObject);
                                }
                                memory.contents.push({
                                    rooms_fullname: htmlObject["rooms_fullname"],
                                    rooms_shortname: htmlObject["rooms_shortname"],
                                    rooms_address: htmlObject["rooms_address"],
                                    rooms_number: htmlObject["rooms_number"][i],
                                    rooms_seats: parseInt(htmlObject["rooms_seats"][i]),
                                    rooms_furniture: htmlObject["rooms_furniture"][i],
                                    rooms_name: htmlObject["rooms_shortname"] + "_" + htmlObject["rooms_number"][i],
                                    rooms_type: htmlObject["rooms_type"][i],
                                    rooms_href: htmlObject["rooms_href"][i],
                                    lat: htmlObject["lat"],
                                    lon: htmlObject["lon"]
                                });
                            }
                        }
                        if (memory.contents.length === 0) {
                            reject({
                                code: 400,
                                body: { "error": "memory is empty or result does not exists." }
                            });
                        }
                        else {
                            console.log("memory: ", memory.contents);
                            that.cacheFile(id, memory.contents).then(function () {
                                datasetList.push(id);
                                fulfill({
                                    code: 204,
                                    body: { "success": "the operation was successful and the id was new (not added in this session or was previously cached)." }
                                });
                            });
                        }
                    }
                }
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    InsightFacade.prototype.removeDataset = function (id) {
        Util_1.default.info("In removeDataset");
        var that = this;
        var fileName = id.concat(".json");
        return new Promise(function (fulfill, reject) {
            if (fs.existsSync(fileName)) {
                memory.contents = [];
                memory.id = null;
                fs.unlinkSync(fileName, function (err) {
                    console.log("Remove Error: ", err);
                });
                var index = datasetList.indexOf(id);
                datasetList.splice(index, 1);
                fulfill({
                    code: 204,
                    body: { "success": "the operation was successful." }
                });
            }
            else {
                reject({
                    code: 404,
                    body: { "error": "the operation was unsuccessful because the delete was for a resource that was not previously added." }
                });
            }
        });
    };
    InsightFacade.prototype.processCourses = function (zip) {
        Util_1.default.info("In processCourses");
        var processList = [];
        var jsonArray = [];
        return new Promise(function (fulfill, reject) {
            for (var filePath in zip.files) {
                if (!filePath.match("courses/")) {
                    reject({
                        code: 400,
                        body: { "error": "Wrong ID given" }
                    });
                }
                var file = zip.file(filePath);
                if (file) {
                    processList.push(file.async("string"));
                }
            }
            Promise.all(processList).then(function (files) {
                Util_1.default.info("In Promise.all");
                for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                    var file = files_1[_i];
                    try {
                        if (!util_1.isUndefined(file)) {
                            var jsonObject = JSON.parse(file);
                            jsonArray.push(jsonObject);
                        }
                    }
                    catch (err) {
                        console.log(err);
                        reject({
                            code: 400,
                            body: { "error": "Unexpected token" }
                        });
                    }
                }
                fulfill(jsonArray);
            }).catch(function (err) {
                console.log(err);
                reject({
                    code: 400,
                    body: { "error": "file is not a valid zip file." }
                });
            });
        });
    };
    InsightFacade.prototype.processRooms = function (zip) {
        Util_1.default.info("In processRooms");
        var that = this;
        var processList = [];
        htmlFilePaths = [];
        return new Promise(function (fulfill, reject) {
            for (var filePath in zip.files) {
                if (!filePath.match("campus/") && !filePath.match("index")) {
                    reject({
                        code: 400,
                        body: { "error": "Wrong ID given" }
                    });
                }
                if (filePath === "index.htm") {
                    var index = zip.file(filePath);
                    if (index) {
                        (index.async("string").then(function (data) {
                            var IndexDoc = parse5.parse(data);
                            that.findBuildingNames(IndexDoc);
                            for (var _i = 0, htmlFilePaths_1 = htmlFilePaths; _i < htmlFilePaths_1.length; _i++) {
                                var htmlFilePath = htmlFilePaths_1[_i];
                                var htmlFile = zip.file(htmlFilePath);
                                if (htmlFile) {
                                    processList.push(htmlFile.async("string"));
                                }
                            }
                            Promise.all(processList).then(function (htmlFiles) {
                                var roomsObjectList = [];
                                Util_1.default.info("In Promise.all");
                                for (var _i = 0, htmlFiles_1 = htmlFiles; _i < htmlFiles_1.length; _i++) {
                                    var htmlFile = htmlFiles_1[_i];
                                    try {
                                        if (!util_1.isUndefined(htmlFile)) {
                                            var htmlObject = parse5.parse(htmlFile);
                                            that.findBuildingDetails(htmlObject, roomsObjectList);
                                            count++;
                                        }
                                        else {
                                            console.log(htmlFile);
                                        }
                                    }
                                    catch (err) {
                                        console.log(err);
                                        reject(err);
                                    }
                                }
                                var promiseList = [];
                                var _loop_1 = function (index_1) {
                                    promiseList.push(new Promise(function (fulfill, reject) {
                                        var object = parseInt(index_1);
                                        that.getLatLon(roomsObjectList[object]["rooms_address"]).then(function (geo) {
                                            roomsObjectList[object]["lat"] = geo.lat;
                                            roomsObjectList[object]["lon"] = geo.lon;
                                            fulfill(roomsObjectList[object]);
                                        }).catch(function (err) {
                                            reject(err.error);
                                        });
                                    }));
                                };
                                for (var index_1 in roomsObjectList) {
                                    _loop_1(index_1);
                                }
                                Promise.all(promiseList).then(function (roomsList) {
                                    fulfill(roomsList);
                                }).catch(function (err) {
                                    reject(err);
                                });
                            }).catch(function (err) {
                                console.log(err);
                                reject(err);
                            });
                        }).catch(function (err) {
                            console.log(err);
                            reject(err);
                        }));
                    }
                }
            }
        });
    };
    InsightFacade.prototype.parseZip = function (zip, id) {
        Util_1.default.info("In parseZip");
        var that = this;
        return new Promise(function (fulfill, reject) {
            JSZip.loadAsync(zip, { base64: true }).then(function (zip) {
                if (id !== "rooms") {
                    that.processCourses(zip).then(function (objectArray) {
                        fulfill(objectArray);
                    }).catch(function (err) {
                        console.log(err);
                        reject(err);
                    });
                }
                else if (id === "rooms") {
                    that.processRooms(zip).then(function (objectArray) {
                        fulfill(objectArray);
                    }).catch(function (err) {
                        console.log(err);
                        reject(err);
                    });
                }
            }).catch(function () {
                reject({
                    code: 400,
                    body: { "error": "file is not a valid zip file." }
                });
            });
        });
    };
    InsightFacade.prototype.cacheFile = function (id, cachedArray) {
        Util_1.default.warn("In cacheFile");
        var fileName = id.concat(".json");
        console.log("filename: ", fileName);
        var cacheArrayString = JSON.stringify(cachedArray);
        return new Promise(function (fulfill, reject) {
            fs.writeFile(fileName, cacheArrayString, function (err) {
                if (err) {
                    console.log("cache error: ", err);
                    reject(err);
                }
                else {
                    fulfill();
                }
            });
            Util_1.default.warn("cached file");
        });
    };
    InsightFacade.prototype.findBuildingNames = function (doc) {
        this.findNode(doc, "tbody", "tr", htmlFilePaths);
    };
    InsightFacade.prototype.findBuildingDetails = function (doc, roomsObjectList) {
        var blockSystemMain = [];
        var buildingInfo = [];
        var fieldContent = [];
        var buildingName = null;
        var buildingAddress = null;
        var viewTable = [];
        var viewBody = null;
        var roomNum = [];
        var roomNumValue = [];
        var roomCap = [];
        var roomCapValue = [];
        var roomFurn = [];
        var roomFurnValue = [];
        var roomType = [];
        var roomTypeValue = [];
        var roomLink = [];
        var roomLinkValue = [];
        var roomShortNameValue = null;
        this.getNodeDetails(doc, "block block-system block-odd", blockSystemMain);
        if (blockSystemMain.length === 0) {
            this.getNodeDetails(doc, "block block-system block-even", blockSystemMain);
        }
        if (blockSystemMain.length !== 0) {
            this.getNodeDetails(blockSystemMain[0], "building-info", buildingInfo);
            this.getNodeDetails(buildingInfo[0], "field-content", fieldContent);
            buildingName = fieldContent[0].childNodes[0].value;
            buildingAddress = fieldContent[1].childNodes[0].value;
            this.getNodeDetails(blockSystemMain[0], "views-table cols-5 table", viewTable);
            if (viewTable.length !== 0) {
                if (viewTable[0].childNodes[3].nodeName === "tbody") {
                    viewBody = viewTable[0].childNodes[3];
                    this.getNodeDetails(viewBody, "views-field views-field-field-room-number", roomNum);
                    for (var _i = 0, roomNum_1 = roomNum; _i < roomNum_1.length; _i++) {
                        var node = roomNum_1[_i];
                        roomNumValue.push(node.childNodes[1].childNodes[0].value);
                    }
                    this.getNodeDetails(viewBody, "views-field views-field-field-room-capacity", roomCap);
                    for (var _a = 0, roomCap_1 = roomCap; _a < roomCap_1.length; _a++) {
                        var node = roomCap_1[_a];
                        roomCapValue.push(node.childNodes[0].value.trim());
                    }
                    this.getNodeDetails(viewBody, "views-field views-field-field-room-furniture", roomFurn);
                    for (var _b = 0, roomFurn_1 = roomFurn; _b < roomFurn_1.length; _b++) {
                        var node = roomFurn_1[_b];
                        roomFurnValue.push(node.childNodes[0].value.trim());
                    }
                    this.getNodeDetails(viewBody, "views-field views-field-field-room-type", roomType);
                    for (var _c = 0, roomType_1 = roomType; _c < roomType_1.length; _c++) {
                        var node = roomType_1[_c];
                        roomTypeValue.push(node.childNodes[0].value.trim());
                    }
                    this.getNodeDetails(viewBody, "views-field views-field-nothing", roomLink);
                    for (var _d = 0, roomLink_1 = roomLink; _d < roomLink_1.length; _d++) {
                        var node = roomLink_1[_d];
                        roomLinkValue.push(node.childNodes[1].attrs[0].value);
                    }
                    var subStr = (roomLink[0].childNodes[1].attrs[0].value.split("http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/").join(""));
                    roomShortNameValue = subStr.substring(0, subStr.indexOf("-"));
                }
            }
            var roomsObject = new Object({
                rooms_fullname: buildingName,
                rooms_shortname: roomShortNameValue,
                rooms_address: buildingAddress,
                rooms_number: roomNumValue,
                rooms_seats: roomCapValue,
                rooms_furniture: roomFurnValue,
                rooms_name: roomShortNameValue + "_" + roomNumValue,
                rooms_type: roomTypeValue,
                rooms_href: roomLinkValue,
                lat: null,
                lon: null
            });
            roomsObjectList.push(roomsObject);
        }
    };
    InsightFacade.prototype.getNodeDetails = function (node, name, array) {
        if (util_1.isUndefined(node.childNodes)) {
            return;
        }
        for (var att in node.attrs) {
            if (node.attrs[att].value === name) {
                array.push(node);
            }
        }
        for (var child in node.childNodes) {
            this.getNodeDetails(node.childNodes[child], name, array);
        }
    };
    InsightFacade.prototype.findNode = function (root, nodeName1, nodeName2, array) {
        if (util_1.isUndefined(root.childNodes)) {
            return;
        }
        if (root.nodeName === nodeName1) {
            for (var node in root.childNodes) {
                if (root.childNodes[node].nodeName === nodeName2) {
                    array.push(this.getPath(root.childNodes[node].childNodes[9]));
                }
            }
            return;
        }
        for (var child in root.childNodes) {
            this.findNode(root.childNodes[child], nodeName1, nodeName2, array);
        }
    };
    InsightFacade.prototype.getPath = function (node) {
        if (node.childNodes[0].nodeName === "#text") {
            var path = node.childNodes[1].attrs[0].value.split('./').join("");
            return path;
        }
    };
    InsightFacade.prototype.getLatLon = function (roomname) {
        return new Promise(function (fulfill, reject) {
            var validroomName = roomname;
            roomname = roomname.replace(" ", "%20");
            var url = "http://skaha.cs.ubc.ca:11316/api/v1/team48/" + validroomName;
            try {
                http.get(url, function (res) {
                    var statusCode = res.statusCode;
                    var contentType = res.headers['content-type'];
                    var geo;
                    var error;
                    if (statusCode !== 200) {
                        error = new Error("Request Failed.\n" +
                            ("Status Code: " + statusCode));
                        geo = { error: "failed response" };
                        reject(geo);
                    }
                    else if (!/^application\/json/.test(contentType)) {
                        error = new Error("Invalid content-type.\n" +
                            ("Expected application/json but received " + contentType));
                        geo = { error: "failed response" };
                        reject(geo);
                    }
                    if (error) {
                        console.log(error.message);
                        res.resume();
                        return;
                    }
                    res.setEncoding('utf8');
                    var rawData = '';
                    res.on('data', function (chunk) { return rawData += chunk; });
                    res.on('end', function () {
                        try {
                            var parsedData = JSON.parse(rawData);
                            geo = {
                                lat: parsedData.lat,
                                lon: parsedData.lon
                            };
                            fulfill(geo);
                        }
                        catch (e) {
                            geo = { error: "failed response" };
                            reject(geo);
                        }
                    });
                }).on('error', function (e) {
                    console.log("Got error: " + e.message);
                    var geo;
                    geo = { error: "failed response" };
                    reject(geo);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        var that = this;
        return new Promise(function (fulfill, reject) {
            try {
                var id = that.validateQuery(query);
                var apply;
                apply = that.getApply(query);
                console.log(apply);
                var columnsToReturn = [];
                var columns;
                columns = that.getColumns(query);
                that.getColumnNames(columns, columnsToReturn);
                var order;
                order = that.getOrder(query);
                var form;
                form = that.getForm(query);
                var obj1 = query.OPTIONS;
                var data = that.filterData(query.WHERE, id);
                var arrObjs = [];
                if (data.length != 0) {
                    console.log("done order");
                    if (!util_1.isNullOrUndefined(query.TRANSFORMATIONS)) {
                        console.log("no");
                        var groupBy;
                        groupBy = that.getGroupBy(query);
                        var apply;
                        apply = that.getApply(query);
                        arrObjs = that.transformData(data, groupBy, apply, columnsToReturn);
                    }
                    else {
                        arrObjs = that.gatherData(order, form, data, columnsToReturn);
                    }
                    if (util_1.isNullOrUndefined(order)) {
                    }
                    else if (typeof (order) === "string") {
                        arrObjs = that.handleOrder(arrObjs, order);
                    }
                    else {
                        arrObjs = that.handleOrderComplex(arrObjs, order);
                    }
                }
                if (form != "TABLE") {
                    var invalidFormResponse = { code: 400, body: { "error": "Query is not valid" } };
                    reject(invalidFormResponse);
                }
                var queryRequestToReturn = {};
                queryRequestToReturn["render"] = form;
                queryRequestToReturn["result"] = arrObjs;
                var ir = { code: 200, body: "" };
                ir.body = queryRequestToReturn;
                fulfill(ir);
            }
            catch (e) {
                var ir = void 0;
                if (Object.keys(e)[0] === '424') {
                    ir = { code: 424, body: { "error": "the operation failed." } };
                    ir.body = { 'missing': e['424'] };
                }
                else {
                    ir = { code: 400, body: { "error": "the operation failed." } };
                    ir.body = { error: e };
                }
                reject(ir);
            }
        });
    };
    InsightFacade.prototype.transformData = function (data, groupBy, apply, columns) {
        var table = {};
        var applyres = {};
        var key = "";
        for (var i in data) {
            key = "";
            for (var groupKey in groupBy) {
                key += data[i][dict[groupBy[groupKey]]] + ",,,";
            }
            key = key.substring(0, key.length - 3);
            if (util_1.isNullOrUndefined(table[key])) {
                table[key] = [];
                applyres[key] = [];
            }
            table[key].push(data[i]);
        }
        for (var key_1 in table) {
            for (var object in apply) {
                var colname = Object.keys(apply[object])[0];
                var operation = Object.keys(apply[object][colname])[0];
                var field = apply[object][colname][operation];
                var result = 0;
                if (operation === "AVG") {
                    result = this.getAvg(table[key_1], dict[field]);
                }
                else if (operation === "MAX") {
                    result = this.getMax(table[key_1], dict[field]);
                }
                else if (operation === "MIN") {
                    result = this.getMin(table[key_1], dict[field]);
                }
                else if (operation === "COUNT") {
                    result = this.getCount(table[key_1], dict[field]);
                }
                else if (operation === "SUM") {
                    result = this.getSum(table[key_1], dict[field]);
                }
                else {
                    throw ("error: invalid apply operation");
                }
                var newobj = {};
                newobj[colname] = result;
                applyres[key_1].push(newobj);
            }
        }
        return this.gatherGroupBy(table, applyres, columns, groupBy);
    };
    InsightFacade.prototype.gatherGroupBy = function (data, apply, columns, groupBy) {
        var ret = [];
        for (var value in data) {
            var newobj = {};
            var values = value.split(',,,');
            for (var i in values) {
                newobj[groupBy[i]] = values[i];
            }
            values = apply[value];
            for (var i in values) {
                newobj[Object.keys(values[i])[0]] = values[i][Object.keys(values[i])[0]];
            }
            ret.push(newobj);
        }
        return this.buildResult(ret, columns);
    };
    InsightFacade.prototype.buildResult = function (data, columns) {
        var result = [];
        for (var key in data) {
            var newobj = {};
            for (var i in columns) {
                var column = columns[i];
                if (util_1.isNullOrUndefined(data[key][column])) {
                    throw ("error: column must be in group or apply");
                }
                newobj[column] = data[key][column];
            }
            result.push(newobj);
        }
        return result;
    };
    InsightFacade.prototype.getAvg = function (data, field) {
        var sum = 0;
        var count = 0;
        for (var i in data) {
            if (typeof (data[i][field]) === "number") {
                var x = data[i][field] * 10;
                x = Number(x.toFixed(0));
                sum += x;
                count++;
            }
            else {
                throw ("error: invalid type for summing");
            }
        }
        var avg = sum / count;
        avg = avg / 10;
        return Number(avg.toFixed(2));
    };
    InsightFacade.prototype.getSum = function (data, field) {
        var sum = 0;
        for (var i in data) {
            if (typeof (data[i][field]) === "number") {
                sum += data[i][field];
            }
            else {
                throw ("error: invalid type for summing");
            }
        }
        return sum;
    };
    InsightFacade.prototype.getMin = function (data, field) {
        var min = Infinity;
        for (var i in data) {
            if (typeof (data[i][field]) === "number") {
                if (data[i][field] < min) {
                    min = data[i][field];
                }
            }
            else {
                throw ("error: invalid type for min");
            }
        }
        return min;
    };
    InsightFacade.prototype.getMax = function (data, field) {
        var max = 0;
        for (var i in data) {
            if (typeof (data[i][field]) === "number") {
                if (data[i][field] > max) {
                    max = data[i][field];
                }
            }
            else {
                throw ("error: invalid type for max");
            }
        }
        return max;
    };
    InsightFacade.prototype.getCount = function (data, field) {
        var uniqueArray = [];
        count = 0;
        for (var i in data) {
            var value = data[i][field];
            if (uniqueArray.indexOf(value) < 0) {
                uniqueArray.push(value);
                count++;
            }
        }
        return count;
    };
    InsightFacade.prototype.validateQuery = function (query) {
        if (util_1.isNullOrUndefined(query.WHERE) || util_1.isNullOrUndefined(query.OPTIONS)) {
            throw ("error: invalid query");
        }
        for (var key in query) {
            if (!(key === 'WHERE' || key === 'OPTIONS' || key === 'TRANSFORMATIONS')) {
                throw ("error: invalid query");
            }
        }
        var where = query.WHERE;
        var options = query.OPTIONS;
        var transformations = query.TRANSFORMATIONS;
        var invalidList = [];
        var id = this.getId(query);
        this.validateHelperWhere(where, id, invalidList);
        this.validateHelperOptions(query, id, invalidList);
        if (!util_1.isNullOrUndefined(transformations)) {
            this.validateHelperTransform(transformations, id, invalidList);
        }
        if (invalidList.length != 0) {
            throw ({ "424": invalidList });
        }
        return id;
    };
    InsightFacade.prototype.getId = function (query) {
        var id = null;
        var key = Object.keys(query.WHERE)[0];
        if (!util_1.isNullOrUndefined((key))) {
            var where = query.WHERE;
            while (["AND", "OR", "NOT"].indexOf(Object.keys(where)[0]) > -1) {
                if (Object.keys(where)[0].toUpperCase() === "NOT") {
                    where = where[Object.keys(where)[0]];
                }
                else {
                    where = where[Object.keys(where)[0]][0];
                }
            }
            var key_2 = Object.keys(where)[0];
            if (["GT", "LT", "IS", "EQ"].indexOf(key_2) > -1) {
                id = Object.keys(where[key_2])[0];
            }
            else {
                throw ("error: invalid query");
            }
            var idArray = id.split("_");
            if (idArray.length != 2) {
                throw ("error: invalid query");
            }
            else {
                id = idArray[0];
            }
        }
        else {
            var columns = query.OPTIONS["COLUMNS"];
            if (columns.length === 0) {
                throw ("error: columns empty");
            }
            for (var i in columns) {
                var idArray = columns[i].split("_");
                if (idArray.length > 2) {
                    throw ("error: invalid key");
                }
                else if (idArray.length === 2) {
                    id = idArray[0];
                }
            }
            if (!util_1.isNullOrUndefined(query.TRANSFORMATIONS)) {
                var group = query.TRANSFORMATIONS["GROUP"];
                if (group.length === 0) {
                    throw ("error: group is empty");
                }
                for (var i in group) {
                    var idArray = group[i].split("_");
                    if (idArray.length > 2) {
                        throw ("error: invalid key");
                    }
                    else if (idArray.length === 2) {
                        id = idArray[0];
                    }
                }
            }
        }
        if (util_1.isNullOrUndefined(id)) {
            throw ("error: invalid query");
        }
        return id;
    };
    InsightFacade.prototype.validateHelperWhere = function (query, id, invalidList) {
        for (var index in query) {
            var key = index.toUpperCase();
            if (["GT", "LT", "EQ", "IS"].indexOf(key) > -1) {
                var qkey = Object.keys(query[key])[0].split("_")[0];
                if (qkey === id) {
                    continue;
                }
                else if (datasetList.indexOf(qkey) > -1) {
                    throw ("error: query on 2 datasets");
                }
                else if (invalidList.indexOf(qkey) < 0) {
                    invalidList.push(qkey);
                }
            }
            else if (["AND", "OR"].indexOf(key) > -1) {
                var qArray = query[key];
                for (var statement in qArray)
                    this.validateHelperWhere(qArray[statement], id, invalidList);
            }
            else if (key === "NOT") {
                this.validateHelperWhere(query[key], id, invalidList);
            }
            else {
                throw ("error: invalid query");
            }
        }
    };
    InsightFacade.prototype.validateHelperOptions = function (query, id, invalidList) {
        var originalQuery = query;
        query = query.OPTIONS;
        for (var key in query) {
            if (key === "COLUMNS") {
                for (var i in query[key]) {
                    var qarr = query[key][i].split("_");
                    if (qarr.length === 1) {
                        continue;
                    }
                    if (qarr.length > 2) {
                        throw ("error: invalid query");
                    }
                    if (qarr.length === 2 && datasetList.indexOf(qarr[0]) > -1 && qarr[0] != id) {
                        throw ("error: query on 2 datasets");
                    }
                    else if (qarr[0] != id && invalidList.indexOf(qarr[0]) < 0) {
                        invalidList.push(qarr[0]);
                    }
                }
            }
            else if (key === "ORDER") {
                var order = query[key];
                if (typeof (order) === "string") {
                    var os = order.split("_");
                    if (os.length === 2) {
                        if (os[0] === id) {
                        }
                        else if (datasetList.indexOf(os[0]) > -1) {
                            throw ("error: query on 2 datasets");
                        }
                        else if (invalidList.indexOf(os[0]) < 0) {
                            invalidList.push(os[0]);
                        }
                    }
                    else if (os.length > 2) {
                        throw ("error: invalid query");
                    }
                }
                else {
                    try {
                        if (Object.keys(order).length != 2 || util_1.isNullOrUndefined(order["dir"] || order["keys"].length <= 0)) {
                            throw ("error: invalid order");
                        }
                        if (!(order["dir"] === "UP" || order["dir"] === "DOWN")) {
                            throw ("error: invalid order");
                        }
                    }
                    catch (err) {
                        throw ("error: " + err);
                    }
                    for (var okey in order["keys"]) {
                        var os = okey.split("_");
                        if (os.length === 2) {
                            if (os[0] === id) {
                            }
                            else if (datasetList.indexOf(os[0]) > -1) {
                                throw ("error: query on 2 datasets");
                            }
                            else if (invalidList.indexOf(os[0]) < 0) {
                                invalidList.push(os[0]);
                            }
                        }
                        else if (os.length > 2) {
                            throw ("error: invalid query");
                        }
                    }
                }
            }
            else if (key != "FORM") {
                throw ("error: invalid query");
            }
        }
    };
    InsightFacade.prototype.validateHelperTransform = function (query, id, invalidList) {
        if (Object.keys(query).length != 2) {
            throw ("error: invalid transformations");
        }
        for (var key in query) {
            if (!(key === "APPLY" || key === "GROUP")) {
                throw ("error: invalid transformations");
            }
        }
        for (var i in query["APPLY"]) {
            if (Object.keys(query["APPLY"][i]).length != 1) {
                throw ("error: malformed apply");
            }
            if (Object.keys(query["APPLY"][i])[0].includes("_")) {
                throw ("error: invalid apply name");
            }
            var aobj = query["APPLY"][i][Object.keys(query["APPLY"][i])[0]];
            var field = aobj[Object.keys(aobj)[0]];
            if (field.split("_").length != 2) {
                throw ("error: invalid query");
            }
            else {
                var key = field.split("_")[0];
                if (key === id) {
                    continue;
                }
                else if (datasetList.indexOf(key) > -1) {
                    throw ("error: invalid query");
                }
                else if (invalidList.indexOf(key) < 0) {
                    invalidList.push(key);
                }
            }
        }
        for (var i in query["GROUP"]) {
            var fields = query["GROUP"][i].split("_");
            if (fields.length != 2) {
                throw ("error: invalid group key");
            }
            else if (fields[0] === id) {
                continue;
            }
            else if (datasetList.indexOf(fields[0]) > -1) {
                throw ("error: invalid query");
            }
            else if (invalidList.indexOf(fields[0] < 0)) {
                invalidList.push(fields[0]);
            }
        }
    };
    InsightFacade.prototype.handleOrderComplex = function (arrObjs, order) {
        try {
            for (var i = order["keys"].length - 1; i >= 0; i--) {
                arrObjs = this.handleOrder(arrObjs, order["keys"][i]);
            }
            if (order["dir"] === "DOWN") {
                arrObjs = arrObjs.reverse();
            }
        }
        catch (err) {
            throw ("error: " + err);
        }
        return arrObjs;
    };
    InsightFacade.prototype.handleOrder = function (arrObjs, order) {
        var sortArray = arrObjs.map(function (data, index) {
            return { index: index, data: data };
        });
        sortArray.sort(function (a, b) {
            if (util_1.isNullOrUndefined(a.data[order]) || util_1.isNullOrUndefined(b.data[order])) {
                throw ("error: order must be in columns");
            }
            if (a.data[order] < b.data[order])
                return -1;
            if (a.data[order] > b.data[order])
                return 1;
            return a.index - b.index;
        });
        var answer = sortArray.map(function (val) {
            return val.data;
        });
        return answer;
    };
    InsightFacade.prototype.gatherData = function (order, form, data, columnsToReturn) {
        console.log("gathering");
        var arrObjs = [];
        var i = 0;
        for (var key in data) {
            var dataObject = data[key];
            var NewObject = {};
            for (var col in columnsToReturn) {
                NewObject[columnsToReturn[col]] = dataObject[dict[columnsToReturn[col]]];
                if (util_1.isNullOrUndefined(NewObject[columnsToReturn[col]])) {
                    throw ("error: invalid query");
                }
            }
            arrObjs.push(NewObject);
        }
        return arrObjs;
    };
    InsightFacade.prototype.filterData = function (filter, id) {
        var data = memory.contents;
        var resultSet = [];
        var invalidList = [];
        console.log("id:", id);
        if (data.length === 0 || util_1.isNullOrUndefined(memory.contents) || memory.id != id) {
            console.log("here");
            try {
                data = fs.readFileSync(id + ".json", "utf-8");
                data = JSON.parse(data);
                memory.contents = data;
                memory.id = id;
            }
            catch (err) {
                console.log("here");
                invalidList.push(id);
                id = null;
            }
        }
        try {
            if (invalidList.length != 0) {
                throw ({ "424": invalidList });
            }
            for (var i in data) {
                if (filter === {}) {
                    resultSet.push(data[i]);
                }
                else if (this.compare(data[i], filter, invalidList, id)) {
                    if (invalidList.length != 0) {
                        throw ({ "424": invalidList });
                    }
                    if (id === "courses") {
                        data[i].id = data[i].id.toString();
                    }
                    resultSet.push(data[i]);
                }
            }
            return resultSet;
        }
        catch (err) {
            if (invalidList.length != 0) {
                throw ({ "424": invalidList });
            }
            else {
                throw (err);
            }
        }
    };
    InsightFacade.prototype.compare = function (data, filter, invalidList, id) {
        var flag = true;
        for (var i in filter) {
            var value = filter[i];
            var field = Object.keys(value)[0];
            var operation = i;
            value = value[field];
            if (operation === 'GT') {
                if (!(field.startsWith(id + "_"))) {
                    if (invalidList.indexOf(field.split('_')[0]) < 0) {
                        invalidList.push(field.split('_')[0]);
                    }
                    continue;
                }
                field = dict[field];
                flag = this.compareHelper(data[field], value, function (a, b) {
                    return (a > b);
                });
            }
            else if (operation === 'LT') {
                if (!(field.startsWith(id + "_"))) {
                    if (invalidList.indexOf(field.split('_')[0]) < 0) {
                        invalidList.push(field.split('_')[0]);
                    }
                    continue;
                }
                field = dict[field];
                flag = this.compareHelper(data[field], value, function (a, b) {
                    return (a < b);
                });
            }
            else if (operation === 'EQ') {
                if (!(field.startsWith(id + "_"))) {
                    if (invalidList.indexOf(field.split('_')[0]) < 0) {
                        invalidList.push(field.split('_')[0]);
                    }
                    continue;
                }
                field = dict[field];
                flag = this.compareHelper(data[field], value, function (a, b) {
                    return (a === b);
                });
            }
            else if (operation === 'IS') {
                if (!(field.startsWith(id + "_"))) {
                    if (invalidList.indexOf(field.split('_')[0]) < 0) {
                        invalidList.push(field.split('_')[0]);
                    }
                    continue;
                }
                field = dict[field];
                try {
                    var result = void 0;
                    if (field === 'id') {
                        result = data[field].toString();
                    }
                    else {
                        result = data[field];
                    }
                    if (value.charAt(0) === '*' && value.charAt(value.length - 1) === '*') {
                        value = value.substring(1, value.length - 1);
                        if (!(result.includes(value))) {
                            flag = false;
                        }
                    }
                    else if (value.charAt(0) === '*') {
                        value = value.substring(1, value.length);
                        if (!(result.endsWith(value))) {
                            flag = false;
                        }
                    }
                    else if (value.charAt(value.length - 1) === '*') {
                        value = value.substring(0, value.length - 1);
                        if (!(result.startsWith(value))) {
                            flag = false;
                        }
                    }
                    else {
                        if (!(result.match(value))) {
                            flag = false;
                        }
                    }
                }
                catch (e) {
                    throw ("error: invalid IS comparison");
                }
            }
            else if (operation === 'AND') {
                var fArray = filter[i];
                if (fArray.length === 0) {
                    throw ("error: empty AND statement");
                }
                for (var j in fArray) {
                    flag = this.compare(data, fArray[j], invalidList, id) && flag;
                }
            }
            else if (operation === 'OR') {
                flag = false;
                var fArray = filter[i];
                if (fArray.length === 0) {
                    throw ("error: empty OR statement");
                }
                for (var j in fArray) {
                    flag = this.compare(data, fArray[j], invalidList, id) || flag;
                    if (flag === true) {
                        break;
                    }
                }
            }
            else if (operation == 'NOT') {
                flag = !(this.compare(data, filter[i], invalidList, id));
            }
            else {
                throw ("error: unexpected argument");
            }
        }
        return flag;
    };
    InsightFacade.prototype.compareHelper = function (result, value, cmp) {
        if (typeof (result) != 'number' || typeof (value) != 'number') {
            throw ("error: invalid comparison");
        }
        try {
            if (cmp(result, value)) {
                return true;
            }
            return false;
        }
        catch (e) {
            throw ("error: invalid comparison");
        }
    };
    InsightFacade.prototype.getColumns = function (query) {
        var optionQuery = query.OPTIONS;
        for (var key in optionQuery) {
            if (!optionQuery.hasOwnProperty(key))
                continue;
            var obj = optionQuery[key];
            if (key === "COLUMNS") {
                return optionQuery.COLUMNS;
            }
        }
        return null;
    };
    InsightFacade.prototype.getOrder = function (query) {
        var optionQuery = query.OPTIONS;
        console.log(optionQuery);
        for (var key in optionQuery) {
            if (!optionQuery.hasOwnProperty(key))
                continue;
            var obj = optionQuery[key];
            if (key === "ORDER") {
                return optionQuery.ORDER;
            }
        }
        return null;
    };
    InsightFacade.prototype.getForm = function (query) {
        var optionQuery = query.OPTIONS;
        for (var key in optionQuery) {
            if (!optionQuery.hasOwnProperty(key))
                continue;
            var obj = optionQuery[key];
            if (key === "FORM") {
                return optionQuery.FORM;
            }
        }
        throw ("Invalid Query: No Form");
    };
    InsightFacade.prototype.getColumnNames = function (col, arr) {
        var colObj = col;
        for (var key in colObj) {
            if (!colObj.hasOwnProperty(key))
                continue;
            if (dict.hasOwnProperty(key))
                continue;
            arr.push(colObj[key]);
        }
    };
    InsightFacade.prototype.getGroupBy = function (query) {
        var Transformation = query.TRANSFORMATIONS;
        var groupByArray = [];
        for (var key in Transformation) {
            var inside = Transformation[key];
            for (var key2 in inside) {
                if (dict.hasOwnProperty(inside[key2])) {
                    groupByArray.push(inside[key2]);
                }
            }
        }
        return groupByArray;
    };
    InsightFacade.prototype.getApply = function (query) {
        var Transformation = query.TRANSFORMATIONS;
        var applyColumns = [];
        var nameArray = [];
        for (var key in Transformation) {
            var inside = Transformation[key];
            if (key === "APPLY") {
                for (var key2 in inside) {
                    for (var name in inside[key2]) {
                        if (nameArray.includes(name)) {
                            throw "Duplicate name inside APPLY";
                        }
                        nameArray.push(name);
                    }
                    applyColumns.push(inside[key2]);
                }
            }
        }
        return applyColumns;
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map