/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse, QueryRequest, GeoResponse} from "./IInsightFacade";
import Log from "../Util";
import {isUndefined, isNullOrUndefined} from "util";
import {isNull} from "util";

var htmlFilePaths: any[] = [];

let count = 0;
let datasetList: any = [];
let JSZip = require("jszip");
let fs = require("fs");
let memory: any = {"id": null, "contents": []}; // need to be global when caching is not needed
let dict: any = {
    courses_dept: 'Subject', courses_id: 'Course', courses_avg: 'Avg', courses_fail:'Fail',
    courses_instructor: 'Professor', courses_title: 'Title', courses_pass: 'Pass',
    courses_audit: 'Audit', courses_uuid: 'id', courses_year: 'Year', courses_size: 'size', rooms_fullname: 'rooms_fullname',
    rooms_shortname: 'rooms_shortname', rooms_number: 'rooms_number', rooms_name: 'rooms_name',
    rooms_address: 'rooms_address', rooms_lat: 'lat',
    rooms_lon: 'lon', rooms_seats: 'rooms_seats', rooms_type: 'rooms_type', rooms_furniture: 'rooms_furniture',
    rooms_href: 'rooms_href'
};
let parse5 = require("parse5");
let http = require("http");


export default class InsightFacade implements IInsightFacade {

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise <InsightResponse> {
        Log.info("In addDataset");
        let that = this;    // trick to keep track of async for scoping issues
        let fileName = id.concat(".json");
        let resultDoesNotExist = false;

        return new Promise(function (fulfill, reject) {
            if(!(id === "courses" || id === "rooms")) {
                reject({
                    code: 400,
                    body: {"error": "invalid id for addDataset"}
                })
            }
            //console.log("content: ", content);
            that.parseZip(content, id).then(function (objectArray: any[]) {
                //console.log("objectArray: ", objectArray);

                if (id !== "rooms") {
                    if (fs.existsSync(fileName)) {

                        memory.contents = [];    // wipe memory to overwrite
                        memory.id = id;
                        for (let jsonObject of objectArray) {
                            if (jsonObject.hasOwnProperty("result")) {
                                if (jsonObject.result.length !== 0) {
                                    for (let courseFields of jsonObject.result) {
                                        courseFields["Year"] = parseInt(courseFields["Year"])
                                        if(courseFields["Section"] === "overall"){
                                            courseFields["Year"] = 1900
                                        }
                                        courseFields["size"] = courseFields["Fail"] + courseFields["Pass"];
                                        memory.contents.push(courseFields);
                                    }
                                }
                            }
                        }
                        // console.log("memory: ", memory.contents);
                        that.cacheFile(id, memory.contents).then(function () {
                            fulfill({
                                code: 201,
                                body: {"success": "the operation was successful and the id already existed (was added in this session or was previously cached)."}
                            });
                        });
                    } else {
                        memory.contents = [];    // wipe memory for new id
                        memory.id = id;
                        for (let jsonObject of objectArray) {

                            if (jsonObject.hasOwnProperty("result")) {
                                if (jsonObject.result.length !== 0) {
                                    for (let courseFields of jsonObject.result) {
                                        courseFields["Year"] = parseInt(courseFields["Year"])
                                        if(courseFields["Section"] === "overall"){
                                            courseFields["Year"] = 1900
                                        }
                                        memory.contents.push(courseFields);

                                    }
                                }
                            } else {
                                resultDoesNotExist = true;
                            }
                        }
                        if (memory.contents.length === 0 || resultDoesNotExist === true) {
                            reject({
                                code: 400,
                                body: {"error": "memory is empty or result does not exists."}
                            });
                        } else {
                            // console.log("memory: ", memory);
                            that.cacheFile(id, memory.contents).then(function () {
                                datasetList.push(id);
                                fulfill({
                                    code: 204,
                                    body: {"success": "the operation was successful and the id was new (not added in this session or was previously cached)."}
                                });
                            });
                        }
                    }

                } else if (id === "rooms") {
                    if (fs.existsSync(fileName)) {
                        memory.contents = [];    // wipe memory to overwrite
                        memory.id = id;
                        for (let htmlObject of objectArray) {
                            for(let i in Object.keys(htmlObject["rooms_number"])){

                                memory.contents.push({
                                    rooms_fullname: htmlObject["rooms_fullname"],
                                    rooms_shortname:htmlObject["rooms_shortname"],
                                    rooms_address:htmlObject["rooms_address"],
                                    rooms_number:htmlObject["rooms_number"][i],
                                    rooms_seats:parseInt(htmlObject["rooms_seats"][i]),
                                    rooms_furniture:htmlObject["rooms_furniture"][i],
                                    rooms_name:htmlObject["rooms_shortname"] + "_" + htmlObject["rooms_number"][i],
                                    rooms_type:htmlObject["rooms_type"][i],
                                    rooms_href:htmlObject["rooms_href"][i],
                                    lat: htmlObject["lat"],
                                    lon: htmlObject["lon"]
                                });

                            }
                        }
                        if (memory.contents.length === 0) {
                            reject({
                                code: 400,
                                body: {"error": "memory is empty or result does not exists."}
                            });
                        } else {
                            console.log("memory: ", memory.contents);
                            that.cacheFile(id, memory.contents).then(function () {
                                fulfill({
                                    code: 201,
                                    body: {"success": "the operation was successful and the id already existed (was added in this session or was previously cached)."}
                                });
                            });
                        }
                    } else {
                        memory.contents = [];    // wipe memory for new id
                        memory.id = id;
                        for (let htmlObject of objectArray) {
                            for(let i in Object.keys(htmlObject["rooms_number"])){
                                if(htmlObject["lat"] === null || htmlObject["lon"] === null)
                                {
                                    console.log(htmlObject)
                                }
                                memory.contents.push({
                                    rooms_fullname: htmlObject["rooms_fullname"],
                                    rooms_shortname:htmlObject["rooms_shortname"],
                                    rooms_address:htmlObject["rooms_address"],
                                    rooms_number: htmlObject["rooms_number"][i],
                                    rooms_seats:parseInt(htmlObject["rooms_seats"][i]),
                                    rooms_furniture:htmlObject["rooms_furniture"][i],
                                    rooms_name:htmlObject["rooms_shortname"] + "_" + htmlObject["rooms_number"][i],
                                    rooms_type:htmlObject["rooms_type"][i],
                                    rooms_href:htmlObject["rooms_href"][i],
                                    lat: htmlObject["lat"],
                                    lon: htmlObject["lon"]
                                });

                            }
                        }
                        if (memory.contents.length === 0) {
                            reject({
                                code: 400,
                                body: {"error": "memory is empty or result does not exists."}
                            });
                        } else {
                            console.log("memory: ", memory.contents);
                            that.cacheFile(id, memory.contents).then(function () {
                                datasetList.push(id);
                                fulfill({
                                    code: 204,
                                    body: {"success": "the operation was successful and the id was new (not added in this session or was previously cached)."}
                                });
                            });
                        }
                    }
                }
            }).catch(function (err) {   // rejection from parseZip, JSZip.loadAsync
                reject(err);
            });
        });
    }

    removeDataset(id: string): Promise <InsightResponse> {
        Log.info("In removeDataset");
        let that = this;    // trick to keep track of async for scoping issues
        let fileName = id.concat(".json");
        // console.log("fileName: ", fileName);

        return new Promise(function (fulfill, reject) {
            // check if cached file already exists
            if (fs.existsSync(fileName)) {
                memory.contents = [];
                memory.id = null;
                // remove cached file
                fs.unlinkSync(fileName, function (err: any) {
                    console.log("Remove Error: ", err);
                });
                let index = datasetList.indexOf(id);
                datasetList.splice(index,1);
                fulfill({
                    code: 204,
                    body: {"success": "the operation was successful."}
                });
            } else {
                reject({
                    code: 404,
                    body: {"error": "the operation was unsuccessful because the delete was for a resource that was not previously added."}
                });
            }
        });
    }

    processCourses(zip: JSZip): Promise<any> {
        Log.info("In processCourses");
        let processList: Promise<any>[] = [];
        let jsonArray: any [] = [];

        return new Promise(function (fulfill, reject) {
            for (let filePath in zip.files) {
                //console.log(filePath);   // shows all the files in the zip
                if (!filePath.match("courses/")) {
                    reject({
                        code: 400,
                        body: {"error": "Wrong ID given"}
                    });
                }
                let file = zip.file(filePath);
                //console.log("course: ", file);
                if (file) {
                    processList.push(file.async("string"));
                }
            }

            Promise.all(processList).then(function (files: any[]) {
                Log.info("In Promise.all");
                for (let file of files) {
                    try {
                        if (!isUndefined(file)) {
                            let jsonObject = JSON.parse(file);    // parse course if defined
                            //console.log("jsonObject: ", jsonObject);
                            jsonArray.push(jsonObject);
                        }
                    } catch (err) {
                        console.log(err);
                        reject({
                            code: 400,
                            body: {"error": "Unexpected token"}
                        });
                    }
                }
                fulfill(jsonArray);
            }).catch(function (err) {
                console.log(err);
                reject({
                    code: 400,
                    body: {"error": "file is not a valid zip file."}
                });
            })
        })
    }

    processRooms(zip: JSZip): Promise<any> {
        Log.info("In processRooms");
        let that = this;
        let processList: Promise<any>[] = [];
        htmlFilePaths = [];

        return new Promise(function (fulfill, reject) {
            for (let filePath in zip.files) {
                //console.log(filePath);
                if (!filePath.match("campus/") && !filePath.match("index")) {
                    reject({
                        code: 400,
                        body: {"error": "Wrong ID given"}
                    });
                }
                if (filePath === "index.htm") {
                    //console.log(filePath);
                    let index = zip.file(filePath);
                    //console.log(index);
                    if (index) {
                        (index.async("string").then(function (data: any) {
                            //console.log("data", data);
                            let IndexDoc: Document = parse5.parse(data);
                            //console.log("IndexDoc", IndexDoc);
                            that.findBuildingNames(IndexDoc);
                            for (let htmlFilePath of htmlFilePaths) {
                                //console.log("buildingPath: ", htmlFilePath);
                                let htmlFile = zip.file(htmlFilePath);
                                //console.log("htmFile: ", htmlFile);
                                if (htmlFile) {
                                    processList.push(htmlFile.async("string"));
                                }
                            }

                            Promise.all(processList).then(function (htmlFiles: any[]) {
                                let roomsObjectList :any = [];
                                Log.info("In Promise.all");
                                //console.log("htmlFiles", htmlFiles);
                                for (let htmlFile of htmlFiles) {
                                    try {
                                        if (!isUndefined(htmlFile)) {
                                            let htmlObject = parse5.parse(htmlFile);
                                            //console.log("htmlObject: ", htmlObject);
                                            that.findBuildingDetails(htmlObject, roomsObjectList);
                                            count++;
                                        }
                                        else {
                                            console.log(htmlFile);
                                        }
                                    } catch (err) {
                                        console.log(err);
                                        reject(err);
                                    }
                                }

                                let promiseList = [];
                                for (let index in roomsObjectList) {
                                  //  console.log("Object:",roomsObjectList[object]);
                                    promiseList.push(new Promise(function (fulfill, reject) {
                                        let object :number = parseInt(index);
                                        that.getLatLon((<any>roomsObjectList[object])["rooms_address"]).then(function (geo: GeoResponse) {
                                            (<any>roomsObjectList[object])["lat"] = geo.lat;
                                            (<any>roomsObjectList[object])["lon"] = geo.lon;
                                            fulfill(roomsObjectList[object])
                                        }).catch(function (err: GeoResponse) {
                                            reject(err.error)
                                        });
                                    }));
                                }
                                Promise.all(promiseList).then(function (roomsList) {
                                    //console.log("FULFILL")
                                    //console.log(roomsObjectList)
                                    //console.log("roomslist:",roomsList)
                                    fulfill(roomsList)
                                }).catch(function (err) {
                                    //console.log("REJECT: ", err)
                                    reject(err);
                                });

                            }).catch(function (err) {
                                console.log(err);
                                reject(err);
                            });

                            //console.log(processList);
                            //fulfill();
                        }).catch(function (err) {
                            console.log(err);
                            reject(err);
                        }));
                    }
                }
            }
        })
    }

    parseZip(zip: string, id: string): Promise < Object > {
        Log.info("In parseZip");
        let that = this;

        return new Promise(function (fulfill, reject) {
            // read  zip file from base64 string

            JSZip.loadAsync(zip, {base64: true}).then(function (zip: JSZip) {

                if (id !== "rooms") {
                    that.processCourses(zip).then(function (objectArray: any[]) {
                        fulfill(objectArray);
                    }).catch(function (err: any) {
                        console.log(err);
                        reject(err);
                    })
                } else if (id === "rooms") {
                    that.processRooms(zip).then(function (objectArray: any[]) {
                        //console.log(objectArray);
                        fulfill(objectArray);
                    }).catch(function (err: any) {
                        console.log(err);
                        reject(err);
                    });
                }
            }).catch(function () {
                reject({
                    code: 400,
                    body: {"error": "file is not a valid zip file."}
                });
            });
        })
    }

    // Cache data to disk as a json file
    cacheFile(id: string, cachedArray: Object[]) {
        Log.warn("In cacheFile");
        let fileName = id.concat(".json");
        console.log("filename: ", fileName);
        let cacheArrayString = JSON.stringify(cachedArray);   // need to stringify for fs.writeFile

        return new Promise(function (fulfill, reject) {
            fs.writeFile(fileName, cacheArrayString, function (err: any) {
                if (err) {
                    console.log("cache error: ", err);
                    reject(err);
                } else {
                    fulfill();
                }
            });
            Log.warn("cached file");
        });
    }

    findBuildingNames(doc: Document) {
        this.findNode(doc, "tbody", "tr", htmlFilePaths);
        //console.log(htmlFilePaths);
    }

    findBuildingDetails(doc: Document, roomsObjectList:any) {
        let blockSystemMain: any[] = [];
        let buildingInfo: any[] = [];
        let fieldContent: any[] = [];
        let buildingName = null;
        let buildingAddress = null;

        let viewTable: any[] = [];
        let viewBody = null;
        let roomNum: any[] = [];
        //let roomDetails: any[] = [];
        let roomNumValue: any[] = [];
        let roomCap: any[] = [];
        let roomCapValue: any[] = [];
        let roomFurn: any[] = [];
        let roomFurnValue: any[] = [];
        let roomType: any[] = [];
        let roomTypeValue: any[] = [];
        let roomLink: any[] = [];
        let roomLinkValue: any[] = [];
        let roomShortNameValue = null;


        this.getNodeDetails(doc, "block block-system block-odd", blockSystemMain);
        //console.log(blockSystemMain);
        if (blockSystemMain.length === 0){
            this.getNodeDetails(doc, "block block-system block-even", blockSystemMain);
        }

        if (blockSystemMain.length !== 0) {
            this.getNodeDetails(blockSystemMain[0], "building-info", buildingInfo);
            //console.log(buildingInfo);
            this.getNodeDetails(buildingInfo[0], "field-content", fieldContent);
            //console.log(fieldContent);
            buildingName = fieldContent[0].childNodes[0].value;
            buildingAddress = fieldContent[1].childNodes[0].value;

            this.getNodeDetails(blockSystemMain[0], "views-table cols-5 table", viewTable);
            //console.log(viewTable);
            if (viewTable.length !== 0) {
                if (viewTable[0].childNodes[3].nodeName === "tbody") {
                    viewBody = viewTable[0].childNodes[3];
                    //console.log(viewBody);
                    this.getNodeDetails(viewBody, "views-field views-field-field-room-number", roomNum);
                    //console.log(roomNum);
                    for (let node of roomNum) {
                        //this.getNodeDetails(node, "Room Details", roomDetails);
                        roomNumValue.push(node.childNodes[1].childNodes[0].value);
                        //console.log(roomNumValue);
                    }
                    this.getNodeDetails(viewBody, "views-field views-field-field-room-capacity", roomCap);
                    //console.log(roomCap);
                    for (let node of roomCap) {
                        roomCapValue.push(node.childNodes[0].value.trim());
                        //console.log(roomCapValue);
                    }
                    this.getNodeDetails(viewBody, "views-field views-field-field-room-furniture", roomFurn);
                    //console.log(roomFurn);
                    for (let node of roomFurn) {
                        roomFurnValue.push(node.childNodes[0].value.trim());
                        //console.log(roomFurnValue);
                    }
                    this.getNodeDetails(viewBody, "views-field views-field-field-room-type", roomType);
                    //console.log(roomType);
                    for (let node of roomType) {
                        roomTypeValue.push(node.childNodes[0].value.trim());
                        //console.log(roomFurnValue);
                    }
                    this.getNodeDetails(viewBody, "views-field views-field-nothing", roomLink);
                    //console.log(roomLink);
                    for (let node of roomLink) {
                        roomLinkValue.push(node.childNodes[1].attrs[0].value);
                        //console.log(roomLinkValue);
                    }
                    let subStr = (roomLink[0].childNodes[1].attrs[0].value.split("http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/").join(""));
                    roomShortNameValue = subStr.substring(0, subStr.indexOf("-"));
                    //console.log(roomShortNameValue);
                }
            }

            let roomsObject: Object = new Object({
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
            // console.log(roomsObjectList);
        }
    }

    getNodeDetails(node: any, name: string, array: any[]) {
        if (isUndefined(node.childNodes)) {
            return;
        }
        for (let att in node.attrs) {
            if (node.attrs[att].value === name) {
                array.push(node);
            }
        }

        for (let child in node.childNodes) {
            this.getNodeDetails(node.childNodes[child], name, array);
        }
    }

    findNode(root: Node, nodeName1: string, nodeName2: string, array: any[]): any {
        if (isUndefined(root.childNodes)) {
            return;
        }
        if (root.nodeName === nodeName1) {
            for (let node in root.childNodes) {
                if (root.childNodes[node].nodeName === nodeName2) {
                    array.push(this.getPath(root.childNodes[node].childNodes[9]));
                }
            }
            return;
        }
        for (let child in root.childNodes) {
            this.findNode(root.childNodes[child], nodeName1, nodeName2, array);
        }
    }

    // Gets directory path of each building in index.htm
    getPath(node: any): any {
        if (node.childNodes[0].nodeName === "#text") {
            //console.log(node.childNodes[1].attrs[0].value);
            let path = node.childNodes[1].attrs[0].value.split('./').join("");
            //console.log("path: ", path);
            return path;
        }
    }

    //Given a Building Name in Correct Format ie (6245%20Agronomy%20Road%20V6T%201Z4), returns GeoResponse
    getLatLon(roomname: String): Promise<GeoResponse> {
        //http://nodejs.org/dist/index.json
        //http://skaha.cs.ubc.ca:11316/api/v1/team48/6245%20Agronomy%20Road%20V6T%201Z4

        return new Promise(function (fulfill, reject) {
            var validroomName: String = roomname;

            roomname = roomname.replace(" ", "%20");

            var url: String = "http://skaha.cs.ubc.ca:11316/api/v1/team48/" + validroomName;
            try {
                http.get(url, (res: any) => {
                    const statusCode = res.statusCode;
                    const contentType = res.headers['content-type'];
                    let geo: GeoResponse;
                    let error;
                    if (statusCode !== 200) {
                        error = new Error(`Request Failed.\n` +
                            `Status Code: ${statusCode}`);
                        geo = {error: "failed response"};
                        reject(geo);
                    } else if (!/^application\/json/.test(contentType)) {
                        error = new Error(`Invalid content-type.\n` +
                            `Expected application/json but received ${contentType}`);
                        geo = {error: "failed response"};
                        reject(geo);
                    }
                    if (error) {
                        console.log(error.message);
                        // consume response data to free up memory
                        res.resume();
                        return;
                    }

                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk: any) => rawData += chunk);
                    res.on('end', () => {
                        try {
                            let parsedData = JSON.parse(rawData);
                            geo = {
                                lat: parsedData.lat,
                                lon: parsedData.lon
                            };
                            fulfill(geo);
                        } catch (e) {
                            geo = {error: "failed response"};
                            reject(geo);
                            //console.log(e.message);
                        }
                    });

                }).on('error', (e: any) => {
                    console.log(`Got error: ${e.message}`);
                    var geo: GeoResponse;
                    geo = {error: "failed response"};
                    reject(geo);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    performQuery(query: QueryRequest): Promise < InsightResponse > {
        let that = this;

        return new Promise(function (fulfill, reject) {
            try {

                let id = that.validateQuery(query);

                var apply: any;
                apply = that.getApply(query);

                console.log(apply);
                var columnsToReturn: any = [];
                var columns: any;
                columns = that.getColumns(query);
                that.getColumnNames(columns, columnsToReturn);
                var order: any;
                order = that.getOrder(query);
                var form: any;
                form = that.getForm(query);
                var obj1: any = query.OPTIONS;
                // let data = that.filterData(query.WHERE, id);
                let data = that.filterData(query.WHERE, id);

                let arrObjs: any = [];

                if(data.length != 0) {
                    console.log("done order");
                    //transformation
                    if (!isNullOrUndefined(query.TRANSFORMATIONS)) {
                        console.log("no")
                        var groupBy: any;
                        groupBy = that.getGroupBy(query);
                        var apply: any;
                        apply = that.getApply(query);

                        arrObjs = that.transformData(data, groupBy, apply, columnsToReturn);
                    }
                    else {
                        arrObjs = that.gatherData(order, form, data, columnsToReturn);
                    }

                    if (isNullOrUndefined(order)) {
                        //do nothing
                    }
                    else if (typeof(order) === "string") {
                        arrObjs = that.handleOrder(arrObjs, order);
                    }
                    else {
                        arrObjs = that.handleOrderComplex(arrObjs, order);
                    }
                }

                if (form != "TABLE") {
                    let invalidFormResponse: InsightResponse = {code: 400, body: {"error": "Query is not valid"}};
                    reject(invalidFormResponse);
                }

                var queryRequestToReturn: any = {};
                queryRequestToReturn["render"] = form;
                queryRequestToReturn["result"] = arrObjs;

                let ir: InsightResponse = {code: 200, body: ""};
                ir.body = queryRequestToReturn;
                fulfill(ir);

            } catch (e) {
                let ir: InsightResponse;
                if (Object.keys(e)[0] === '424') {
                    ir = {code: 424, body: {"error": "the operation failed."}};
                    ir.body = {'missing': e['424']}
                }
                else {
                    ir = {code: 400, body: {"error": "the operation failed."}};
                    ir.body = {error: e};
                }
                reject(ir);
            }
        });
    }



    transformData(data: any, groupBy: any, apply: any, columns:any) {
        let table: any = {};
        let applyres: any = {};
        let key = "";

        for (let i in data) {
            key = "";
            for (let groupKey in groupBy) {
                key += data[i][(<any>dict)[groupBy[groupKey]]] + ",,,";
            }
            key = key.substring(0, key.length - 3);

            if (isNullOrUndefined(table[key])) {
                table[key] = [];
                applyres[key] = [];
            }
            table[key].push(data[i]);
        }

        for (let key in table) {

            for (let object in apply) {
                let colname = Object.keys(apply[object])[0];
                let operation = Object.keys(apply[object][colname])[0];
                let field = apply[object][colname][operation]
                let result: number = 0;


                //calculate value

                if (operation === "AVG") {
                    result = this.getAvg(table[key], (<any>dict)[field])
                }
                else if (operation === "MAX") {
                    result = this.getMax(table[key], (<any>dict)[field])

                }
                else if (operation === "MIN") {
                    result = this.getMin(table[key], (<any>dict)[field])

                }
                else if (operation === "COUNT") {
                    result = this.getCount(table[key], (<any>dict)[field])

                }
                else if (operation === "SUM") {
                    result = this.getSum(table[key], (<any>dict)[field])

                }
                else {
                    throw("error: invalid apply operation")
                }


                let newobj: any = {}
                newobj[colname] = result; // assign value
                applyres[key].push(newobj)
            }
        }

        return this.gatherGroupBy(table, applyres, columns, groupBy)

    }

    gatherGroupBy(data: any, apply: any, columns: any, groupBy: any)
    {
        let ret: any = [];
        for(let value in data) {
            let newobj: any = {};
            let values = value.split(',,,');
            for(let i in values){
                newobj[groupBy[i]] = values[i];
            }

            values = apply[value];
            for(let i in values){
                newobj[Object.keys(values[i])[0]] = values[i][<any>Object.keys(values[i])[0]]
            }

            ret.push(newobj)
        }

        return this.buildResult(ret, columns);
    }

    buildResult(data: any, columns: any){
        let result = [];
        for(let key in data) {
            let newobj: any = {}
            for(let i in columns){
                let column = columns[i];
                if(isNullOrUndefined(data[key][column])){
                    throw("error: column must be in group or apply")
                }
                newobj[column] = data[key][column];
            }

            result.push(newobj)
        }
        return result;
    }

    getAvg(data: any, field: string) {
        let sum = 0
        let count = 0;
        for(let i in data){
            if(typeof(data[i][field]) === "number") {
                let x = data[i][field] * 10;
                x = Number(x.toFixed(0));
                sum += x;
                count++;
            }
            else{
                throw("error: invalid type for summing")
            }
        }

        let avg = sum/count;
        avg = avg/10;
        return Number(avg.toFixed(2));
    }

    getSum(data: any, field: string) {
        let sum = 0
        for(let i in data){
            if(typeof(data[i][field]) === "number") {
                sum += data[i][field]
            }
            else{
                throw("error: invalid type for summing")
            }
        }
        return sum;
    }

    getMin(data: any, field: string) {
        let min = Infinity;
        for(let i in data){
            if(typeof(data[i][field]) === "number") {
                if(data[i][field] < min){
                    min = data[i][field]
                }
            }
            else{
                throw("error: invalid type for min")
            }
        }
        return min;
    }

    getMax(data: any, field: string) {
        let max = 0;
        for(let i in data){
            if(typeof(data[i][field]) === "number") {
                if(data[i][field] > max){
                    max = data[i][field]
                }
            }
            else{
                throw("error: invalid type for max")
            }
        }

        return max;
    }

    getCount(data: any, field: string) {
        let uniqueArray :any = []
        count = 0;
        for(let i in data){
            let value = data[i][field]
            if(uniqueArray.indexOf(value) < 0){
                uniqueArray.push(value);
                count++;
            }
        }
        return count;
    }


    validateQuery(query: QueryRequest) {

        if (isNullOrUndefined(query.WHERE) || isNullOrUndefined(query.OPTIONS)) {
            throw("error: invalid query");
        }

        for (let key in query) {
            if (!(key === 'WHERE' || key === 'OPTIONS' || key === 'TRANSFORMATIONS')) {
                throw("error: invalid query");
            }
        }

        let where = query.WHERE;
        let options = query.OPTIONS;
        let transformations = query.TRANSFORMATIONS;
        let invalidList:any = [];

        let id = this.getId(query);

        this.validateHelperWhere(where, id, invalidList);
        this.validateHelperOptions(query, id, invalidList);
        if(!isNullOrUndefined(transformations)){
            this.validateHelperTransform(transformations, id, invalidList);
        }

        if (invalidList.length != 0) {
            throw({"424": invalidList});
        }

        return id;
    }

    getId(query: QueryRequest) {

        let id = null;

        let key = Object.keys(query.WHERE)[0];

        if(!isNullOrUndefined((key))) {
            let where = query.WHERE
            while (["AND", "OR", "NOT"].indexOf(Object.keys(where)[0]) > -1) { //if query is AND/OR/NOT
                if (Object.keys(where)[0].toUpperCase() === "NOT") {
                    where = (<any>where)[Object.keys(where)[0]]
                }
                else {
                    where = (<any>where)[Object.keys(where)[0]][0]
                }
            }

            let key = Object.keys(where)[0];

            if (["GT", "LT", "IS", "EQ"].indexOf(key) > -1) {
                id = Object.keys((<any>where)[key])[0]
            }
            else {
                throw("error: invalid query");
            }

            let idArray = id.split("_");
            if (idArray.length != 2) {
                throw("error: invalid query");
            }
            else {
                id = idArray[0];
            }
        }
        else
        {
            let columns = (<any>query.OPTIONS)["COLUMNS"];
            if(columns.length === 0){
                throw("error: columns empty");
            }
            for(let i in columns){
                let idArray = columns[i].split("_")
                if(idArray.length > 2) {
                    throw("error: invalid key");
                }
                else if(idArray.length === 2){
                    id = idArray[0]
                }
            }
            if(!isNullOrUndefined(query.TRANSFORMATIONS)) {
                let group = (<any>query.TRANSFORMATIONS)["GROUP"]
                if(group.length === 0){
                    throw("error: group is empty")
                }
                for(let i in group){
                    let idArray = group[i].split("_")
                    if(idArray.length > 2) {
                        throw("error: invalid key");
                    }
                    else if(idArray.length === 2){
                        id = idArray[0]
                    }
                }
            }

        }

        if(isNullOrUndefined(id)){
            throw("error: invalid query")
        }
        return id;
    }

    validateHelperWhere(query: any, id: string, invalidList :any)
    {
        for(let index in query)
        {
            let key = index.toUpperCase();
            if(["GT","LT","EQ","IS"].indexOf(key) > -1){
                let qkey = Object.keys(query[key])[0].split("_")[0];
                if(qkey === id){
                    continue;
                }
                else if(datasetList.indexOf(qkey) > -1) {
                    throw("error: query on 2 datasets")
                }
                else if(invalidList.indexOf(qkey) < 0){
                    invalidList.push(qkey);
                }

            }
            else if(["AND", "OR"].indexOf(key) > -1){
                let qArray = (<any>query)[key];
                for(let statement in qArray)
                    this.validateHelperWhere(qArray[statement], id, invalidList);
            }
            else if(key === "NOT"){
                this.validateHelperWhere((<any>query)[key], id, invalidList);
            }
            else{
                throw("error: invalid query");
            }
        }
    }

    validateHelperOptions(query: any, id: string, invalidList: any)
    {
        let originalQuery = query;
        query = query.OPTIONS;
        for(let key in query)
        {
            if(key === "COLUMNS"){
                for(let i in query[key]){
                    let qarr = query[key][i].split("_")
                    if(qarr.length === 1){
                        continue;
                    }
                    if(qarr.length > 2){
                        throw("error: invalid query");
                    }
                    if(qarr.length === 2 && datasetList.indexOf(qarr[0]) > -1 && qarr[0] != id){
                        throw("error: query on 2 datasets");
                    }
                    else if(qarr[0] != id && invalidList.indexOf(qarr[0]) < 0){
                        invalidList.push(qarr[0]);
                    }
                }
            }
            else if(key === "ORDER"){
                let order = query[key]
                if(typeof(order) === "string"){
                    let os = order.split("_")
                    if(os.length === 2){
                        if(os[0] === id){
                            //do nothing
                        }
                        else if(datasetList.indexOf(os[0]) > -1){
                            throw("error: query on 2 datasets");
                        }
                        else if(invalidList.indexOf(os[0]) < 0) {
                            invalidList.push(os[0])
                        }
                    }
                    else if(os.length > 2) {
                        throw("error: invalid query")
                    }
                }
                else{
                    try{
                        if (Object.keys(order).length != 2 || isNullOrUndefined(order["dir"] || order["keys"].length <= 0)) {
                            throw("error: invalid order")
                        }
                        if (!(order["dir"] === "UP" || order["dir"] === "DOWN")) {
                            throw("error: invalid order")
                        }
                    }
                    catch(err){
                        throw("error: " + err)
                    }

                    for(let okey in order["keys"]) {
                        let os = okey.split("_")
                        if(os.length === 2){
                            if(os[0] === id){
                                //do nothing
                            }
                            else if(datasetList.indexOf(os[0]) > -1){
                                throw("error: query on 2 datasets");
                            }
                            else if(invalidList.indexOf(os[0]) < 0) {
                                invalidList.push(os[0])
                            }
                        }
                        else if(os.length > 2) {
                            throw("error: invalid query")
                        }
                    }

                }
            }
            else if(key != "FORM"){
                throw("error: invalid query")
            }
        }
    }

    validateHelperTransform(query: any, id: string, invalidList: any){

        if(Object.keys(query).length != 2) {
            throw("error: invalid transformations")
        }
        for(let key in query){
            if(!(key === "APPLY" || key === "GROUP")){
                throw("error: invalid transformations")
            }
        }

        for(let i in query["APPLY"]){
            if(Object.keys(query["APPLY"][i]).length != 1){
                throw("error: malformed apply")
            }
            if(Object.keys(query["APPLY"][i])[0].includes("_")){
                throw("error: invalid apply name")
            }
            let aobj = query["APPLY"][i][Object.keys(query["APPLY"][i])[0]]
            let field = aobj[Object.keys(aobj)[0]]
            if(field.split("_").length != 2){
                throw("error: invalid query")
            }
            else{
                let key = field.split("_")[0];
                if(key === id) {
                    continue;
                }
                else if(datasetList.indexOf(key) > -1) {
                    throw("error: invalid query")
                }
                else if(invalidList.indexOf(key) < 0) {
                    invalidList.push(key);
                }
            }
        }
        for(let i in query["GROUP"]){
            let fields = query["GROUP"][i].split("_");
            if(fields.length != 2){
                throw("error: invalid group key")
            }
            else if(fields[0] === id){
                continue
            }
            else if(datasetList.indexOf(fields[0]) > -1) {
                throw("error: invalid query")
            }
            else if(invalidList.indexOf(fields[0] < 0)) {
                invalidList.push(fields[0]);
            }
        }
    }


    handleOrderComplex(arrObjs: any, order: any) {
        try {

            for (let i = order["keys"].length - 1; i >= 0; i--) {
                arrObjs = this.handleOrder(arrObjs, order["keys"][i])
            }

            if(order["dir"] === "DOWN"){
                arrObjs = arrObjs.reverse();
            }

        }
        catch(err){
            throw("error: " + err)
        }

        return arrObjs

    }

    //sort array and preserve order of equal elements
    //credit to: http://stackoverflow.com/questions/31213696/sort-array-items-and-preserve-order-of-same-elements
    handleOrder(arrObjs: any, order: any) {
        let sortArray = arrObjs.map(function (data: any, index: any) {
            return {index: index, data: data}
        });

        sortArray.sort(function (a: any, b: any) {
            if(isNullOrUndefined(a.data[order]) || isNullOrUndefined(b.data[order]))
            {
                throw("error: order must be in columns")
            }
            if (a.data[order] < b.data[order]) return -1;
            if (a.data[order] > b.data[order]) return 1;
            return a.index - b.index
        });

        var answer = sortArray.map(function (val: any) {
            return val.data
        });
        return answer;
    }


    gatherData(order: any, form: any, data: any, columnsToReturn: any) {
        console.log("gathering")
        var arrObjs = [];
        let i = 0;
        for (var key in data) {
            var dataObject = data[key];
            var NewObject: any = {};

            for(let col in columnsToReturn){
                NewObject[columnsToReturn[col]] = dataObject[dict[columnsToReturn[col]]];
                if(isNullOrUndefined(NewObject[columnsToReturn[col]])) {
                    throw("error: invalid query");
                }
            }

            arrObjs.push(NewObject);
        }

        return arrObjs;
    }


    filterData(filter: Object, id: string): any {
        let data: any = memory.contents;
        let resultSet: any = [];
        let invalidList: any = [];

        console.log("id:", id);

        if (data.length === 0 || isNullOrUndefined(memory.contents) || memory.id != id) {
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

        //console.log("CACHEARRY: ", memory.contents);


        //replace with test data to run
        // data = memory.contents;
        //console.log(data);


        try {
            if (invalidList.length != 0) {
                throw({"424": invalidList});
            }
            for (let i in data) {
                if(filter === {}){
                    resultSet.push(data[i]);
                }
                else if (this.compare(data[i], filter, invalidList, id)) {
                    if (invalidList.length != 0) {
                        throw({"424": invalidList});
                    }
                    if (id === "courses") {
                        data[i].id = data[i].id.toString()
                    }
                    //console.log(data[i]);
                    resultSet.push(data[i]);
                }
            }
            return resultSet;
        }
        catch (err) {
            if (invalidList.length != 0) {
                throw({"424": invalidList});
            }
            else {
                throw(err)
            }
        }

    }

    compare(data: Object, filter: Object, invalidList: any, id: string): boolean {
        let flag = true;

        for (let i in filter) {

            let value = (<any>filter)[i];
            let field = Object.keys(value)[0];
            let operation = i;
            value = value[field];

            if (operation === 'GT') {
                if (!(field.startsWith(id + "_"))) {
                    if (invalidList.indexOf(field.split('_')[0]) < 0) {
                       invalidList.push(field.split('_')[0]);
                    }
                    continue;
                }
                field = (<any>dict)[field];
                flag = this.compareHelper((<any>data)[field], value, function (a: any, b: any) {
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
                field = (<any>dict)[field];
                flag = this.compareHelper((<any>data)[field], value, function (a: any, b: any) {
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
                field = (<any>dict)[field];
                flag = this.compareHelper((<any>data)[field], value, function (a: any, b: any) {
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
                field = (<any>dict)[field];
                try {
                    let result: string;
                    if (field === 'id') {
                        result = (<any>data)[field].toString();
                    }
                    else{
                        result = (<any>data)[field]
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
                        if (!(result === value)) {
                            flag = false;
                        }
                    }
                }
                catch (e) {
                    throw("error: invalid IS comparison");
                }
            }
            else if (operation === 'AND') {
                let fArray = (<any>filter)[i];
                if (fArray.length === 0) {
                    throw("error: empty AND statement");
                }
                for (let j in fArray) {
                    flag = this.compare(data, fArray[j], invalidList, id) && flag;
                }
            }
            else if (operation === 'OR') {
                flag = false;
                let fArray = (<any>filter)[i];
                if (fArray.length === 0) {
                    throw("error: empty OR statement");
                }
                for (let j in fArray) {
                    flag = this.compare(data, fArray[j], invalidList, id) || flag;
                    if(flag === true){
                        break;
                    }
                }
            }
            else if (operation == 'NOT') {
                flag = !(this.compare(data, (<any>filter)[i], invalidList, id));
            }
            else {
                throw("error: unexpected argument");
            }

        }

        return flag;

    }

    compareHelper(result: any, value: any, cmp: any) {
        if (typeof(result) != 'number' || typeof(value) != 'number') {
            throw("error: invalid comparison");
        }
        try {
            if (cmp(result, value)) {
                return true;
            }
            return false;
        }
        catch (e) {
            throw("error: invalid comparison");
        }
    }

    getColumns(query: QueryRequest): any {
        var optionQuery: any = query.OPTIONS;
        for (var key in optionQuery) {
            if (!optionQuery.hasOwnProperty(key)) continue;
            var obj = optionQuery[key];
            if (key === "COLUMNS") {
                return optionQuery.COLUMNS;
            }
        }
        return null;
    }

    getOrder(query: QueryRequest): any {
        var optionQuery: any = query.OPTIONS;
        console.log(optionQuery);
        for (var key in optionQuery) {
            if (!optionQuery.hasOwnProperty(key)) continue;
            var obj = optionQuery[key];
            if (key === "ORDER") {
                return optionQuery.ORDER;
            }
        }
        return null;
    }

    getForm(query: QueryRequest): any {
        var optionQuery: any = query.OPTIONS;
        for (var key in optionQuery) {
            if (!optionQuery.hasOwnProperty(key)) continue;
            var obj = optionQuery[key];
            if (key === "FORM") {
                return optionQuery.FORM;
            }
        }
        throw("Invalid Query: No Form");
    }

    getColumnNames(col: Object, arr: any): any {
        var colObj: any = col;
        for (var key in colObj) {
            if (!colObj.hasOwnProperty(key)) continue;
            if (dict.hasOwnProperty(key)) continue;
            //if (key === "courses_dept" || key === "courses_id" || key === "courses_instructor" ||
            //    key === "courses_title" || key === "courses_uuid") continue;
            arr.push(colObj[key]);
        }
    }

    //returns dict key of the groupBy value or false for no groupBy
    getGroupBy(query: QueryRequest): any {
        var Transformation: any = query.TRANSFORMATIONS;
        var groupByArray = [];
        for (var key in Transformation) {
            var inside: any = Transformation[key];
            for (var key2 in inside) {
                if (dict.hasOwnProperty(inside[key2])) {
                    groupByArray.push(inside[key2]);
                }
            }
        }
        return groupByArray;
    }

    //make an Object with Object Key = APPLYTOKEN && Object Value = DICT KEY TO APPLY TO
    // i.e. {maxSeats: {"MAX": "rooms_seats"} },
    //      {furnitureCount: {"COUNT": "rooms_furniture"} }
    // false otherwise
    getApply(query: QueryRequest): any {
        var Transformation: any = query.TRANSFORMATIONS;
        var applyColumns:any = [];
        var nameArray:any = [];
        for (var key in Transformation) {
            var inside: any = Transformation[key];
            if (key === "APPLY") {
                for (var key2 in inside){
                    for(var name in inside[key2]){
                        if(nameArray.includes(name)){
                            throw "Duplicate name inside APPLY";
                        }
                        nameArray.push(name);
                    }
                    applyColumns.push(inside[key2]);
                }
            }
        }
        return applyColumns;
    }

}