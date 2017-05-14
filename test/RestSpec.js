"use strict";
var Util_1 = require("../src/Util");
var chai_1 = require("chai");
var Server_1 = require("../src/rest/Server");
var chaiHttp = require("chai-http");
var chai = require("chai");
var fs = require("fs");
var URL = "http://localhost:4321/";
describe("RESTIFY", function () {
    chai.use(chaiHttp);
    var server = new Server_1.default(4321);
    function readZip(name) {
        Util_1.default.info("In readZip");
        try {
            var zip = fs.readFileSync(name).toString("base64");
            return zip;
        }
        catch (err) {
            Util_1.default.error(err);
            console.log("ERROR: ", err);
        }
    }
    before(function (done) {
        Util_1.default.test('Before: ' + this.test.parent.title);
        server.start().then(function (status) {
            Util_1.default.error("Sever started");
            chai_1.expect(status).to.equal(true);
            done();
        }).catch(function (err) {
            console.log(err);
            Util_1.default.error("Error");
            chai_1.expect(status).to.equal(false);
            done(err);
        });
    });
    beforeEach(function () {
        Util_1.default.test('BeforeTest: ' + this.currentTest.title);
    });
    after(function (done) {
        Util_1.default.test('After: ' + this.test.parent.title);
        server.stop().then(function (status) {
            Util_1.default.error("Sever stopped");
            chai_1.expect(status).to.equal(true);
            done();
        }).catch(function (err) {
            console.log(err);
            Util_1.default.error("Error");
            chai_1.expect(err).to.equal(false);
            done(err);
        });
    });
    afterEach(function () {
        Util_1.default.test('AfterTest: ' + this.currentTest.title);
    });
    it("GET request to server", function (done) {
        chai.request("http://localhost:4321").get("/").then(function (res) {
            console.log(res.status);
            chai_1.expect(res.status).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("GET request to echo", function (done) {
        chai.request("http://localhost:4321").get("/echo/msg").then(function (res) {
            console.log(res.status);
            chai_1.expect(res.status).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("send PUT request to server: id being new", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("courses.zip"), "courses.zip")
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(204);
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("send PUT request to server: id already exists", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("courses.zip"), "courses.zip")
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(201);
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("send DELETE request to server", function (done) {
        chai.request(URL)
            .del('/dataset/courses')
            .attach("body", fs.readFileSync("courses.zip"), "courses.zip")
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(204);
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("send DELETE request to server: Error 404", function (done) {
        chai.request(URL)
            .del('/dataset/courses')
            .attach("body", fs.readFileSync("courses.zip"), "courses.zip")
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect(err.status).to.equal(404);
            done();
        });
    });
    it("send PUT request to server: Error 400", function (done) {
        chai.request(URL)
            .put('/dataset/testFile_4')
            .attach("body", fs.readFileSync("testFile_4.zip"), "testFile_4.zip")
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect(err.status).to.equal(400);
            done();
        });
    });
    var testQuery = {
        "WHERE": {
            "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
        },
        "OPTIONS": {
            "COLUMNS": [
                "rooms_shortname",
                "maxSeats"
            ],
            "ORDER": {
                "dir": "DOWN",
                "keys": ["maxSeats"]
            },
            "FORM": "TABLE"
        },
        "TRANSFORMATIONS": {
            "GROUP": ["rooms_shortname"],
            "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
        }
    };
    var invalidQuery = {
        "WHERE": {
            "GT": { "courses_avg": 40 }
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
            "ORDER": "courses_instructor",
        }
    };
    it("send POST request to server: Response 424", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .post('/query')
            .send(testQuery)
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect(err.status).to.equal(424);
            done();
        });
    });
    it("send PUT request to server: Rooms", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip"), "rooms.zip")
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(204);
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("send POST request to server: Response 200", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .post('/query')
            .send(testQuery)
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(200);
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect.fail();
            done();
        });
    });
    it("send DELETE request to server: Rooms", function (done) {
        chai.request(URL)
            .del('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip"), "rooms.zip")
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(204);
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("send PUT request to server: for queryResonse 400", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip"), "rooms.zip")
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(204);
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("send POST request to server: Response 400", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .post('/query')
            .send(invalidQuery)
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect.fail();
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect(err.status).to.equal(400);
            done();
        });
    });
    it("send DELETE request to server: for queryResonse 400", function (done) {
        chai.request(URL)
            .del('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip"), "rooms.zip")
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(204);
            done();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
});
//# sourceMappingURL=RestSpec.js.map