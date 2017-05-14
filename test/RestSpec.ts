/**
 * Created by yecalvin on 2017-03-06.
 */
import Log from "../src/Util";
import {expect} from "chai";
import Server from "../src/rest/Server";
let chaiHttp = require("chai-http");
let chai = require("chai");
let fs = require("fs");
let URL = "http://localhost:4321/";

describe("RESTIFY", function () {
    chai.use(chaiHttp);

    let server = new Server(4321);

    // returns a base64 string of the zip file being read
    function readZip(name: string): string {
        Log.info("In readZip");
        try {
            let zip = fs.readFileSync(name).toString("base64");
            return zip;
        } catch (err) {
            Log.error(err);
            console.log("ERROR: ", err);
        }
    }

    before(function (done) {
        Log.test('Before: ' + (<any>this).test.parent.title);
        server.start().then(function (status) {
            Log.error("Sever started");
            expect(status).to.equal(true);
            done();
        }).catch(function (err) {
            console.log(err);
            Log.error("Error");
            expect(status).to.equal(false);
            done(err);
        });
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
    });

    after(function (done) {
        Log.test('After: ' + (<any>this).test.parent.title);
        server.stop().then(function (status) {
            Log.error("Sever stopped");
            expect(status).to.equal(true);
            done();
        }).catch(function (err) {
            console.log(err);
            Log.error("Error");
            expect(err).to.equal(false);
            done(err);
        });
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });

    it("GET request to server", function (done) {
        chai.request("http://localhost:4321").get("/").then(function (res: any) {
            console.log(res.status);
            expect(res.status).to.equal(200);
            done();
        }).catch(function (err: any) {
            console.log(err);
            expect.fail();
            done();
        });
    });

    it("GET request to echo", function (done) {
        chai.request("http://localhost:4321").get("/echo/msg").then(function (res: any) {
            console.log(res.status);
            expect(res.status).to.equal(200);
            done();
        }).catch(function (err: any) {
            console.log(err);
            expect.fail();
            done();
        })
    });

    it("send PUT request to server: id being new", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("courses.zip"), "courses.zip")
            .then(function (res: any) {
                Log.trace('then:');
                //console.log(res);
                expect(res.status).to.equal(204);
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                console.log(err);
                expect.fail();
                done();
            });
    });

    it("send PUT request to server: id already exists", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("courses.zip"), "courses.zip")
            .then(function (res: any) {
                Log.trace('then:');
                //console.log(res);
                expect(res.status).to.equal(201);
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                console.log(err);
                expect.fail();
                done();
            });
    });

    it("send DELETE request to server", function (done) {
        chai.request(URL)
            .del('/dataset/courses')
            .attach("body", fs.readFileSync("courses.zip"), "courses.zip")
            .then(function (res: any) {
                Log.trace('then:');
                //console.log(res);
                expect(res.status).to.equal(204);
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                console.log(err);
                expect.fail();
                done();
            });
    });

    it("send DELETE request to server: Error 404", function (done) {
        chai.request(URL)
            .del('/dataset/courses')
            .attach("body", fs.readFileSync("courses.zip"), "courses.zip")
            .then(function (res: any) {
                Log.trace('then:');
                expect.fail();
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                console.log(err);
                expect(err.status).to.equal(404);
                done();
            });
    });

    it("send PUT request to server: Error 400", function (done) {
        chai.request(URL)
            .put('/dataset/testFile_4')
            .attach("body", fs.readFileSync("testFile_4.zip"), "testFile_4.zip")
            .then(function (res: any) {
                Log.trace('then:');
                expect.fail();
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                console.log(err);
                expect(err.status).to.equal(400);
                done();
            });
    });

    let testQuery: any = {
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

    let invalidQuery = {
        "WHERE": {
            "GT": {"courses_avg": 40}

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
            .then(function (res: any) {
                Log.trace('then:');
                expect.fail();
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                //console.log(res);
                expect(err.status).to.equal(424);
                done();
            });
    });

    it("send PUT request to server: Rooms", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip"), "rooms.zip")
            .then(function (res: any) {
                Log.trace('then:');
                //console.log(res);
                expect(res.status).to.equal(204);
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                console.log(err);
                expect.fail();
                done();
            });
    });

    it("send POST request to server: Response 200", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .post('/query')
            .send(testQuery)
            .then(function (res: any) {
                Log.trace('then:');
                expect(res.status).to.equal(200);
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                //console.log(res);
                expect.fail();
                done();
            });
    });

    it("send DELETE request to server: Rooms", function (done) {
        chai.request(URL)
            .del('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip"), "rooms.zip")
            .then(function (res: any) {
                Log.trace('then:');
                //console.log(res);
                expect(res.status).to.equal(204);
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                console.log(err);
                expect.fail();
                done();
            });
    });

    it("send PUT request to server: for queryResonse 400", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip"), "rooms.zip")
            .then(function (res: any) {
                Log.trace('then:');
                //console.log(res);
                expect(res.status).to.equal(204);
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                console.log(err);
                expect.fail();
                done();
            });
    });

    it("send POST request to server: Response 400", function (done) {
        this.timeout(30000);
        chai.request(URL)
            .post('/query')
            .send(invalidQuery)
            .then(function (res: any) {
                Log.trace('then:');
                expect.fail();
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                //console.log(res);
                expect(err.status).to.equal(400);
                done();
            });
    });

    it("send DELETE request to server: for queryResonse 400", function (done) {
        chai.request(URL)
            .del('/dataset/rooms')
            .attach("body", fs.readFileSync("rooms.zip"), "rooms.zip")
            .then(function (res: any) {
                Log.trace('then:');
                //console.log(res);
                expect(res.status).to.equal(204);
                done();
            })
            .catch(function (err: any) {
                Log.trace('catch:');
                console.log(err);
                expect.fail();
                done();
            });
    });
});