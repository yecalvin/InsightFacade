"use strict";
var Util_1 = require("../src/Util");
var InsightFacade_1 = require("../src/controller/InsightFacade");
var chai_1 = require("chai");
var fs = require("fs");
describe("InsightFacadeSpec", function () {
    var insightFacade = null;
    function sanityCheck(response) {
        chai_1.expect(response).to.have.property('code');
        chai_1.expect(response).to.have.property('body');
        chai_1.expect(response.code).to.be.a('number');
    }
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
    before(function () {
        Util_1.default.test('Before: ' + this.test.parent.title);
    });
    beforeEach(function () {
        insightFacade = new InsightFacade_1.default();
        Util_1.default.test('BeforeTest: ' + this.currentTest.title);
    });
    after(function () {
        Util_1.default.test('After: ' + this.test.parent.title);
    });
    afterEach(function () {
        insightFacade = null;
        Util_1.default.test('AfterTest: ' + this.currentTest.title);
    });
    it("test query with no dataset", function (done) {
        var simpleQuery = {
            "WHERE": {
                "GT": {
                    "courses_avg": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(simpleQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect(err.code).to.equal(424);
            done();
        });
    });
    it("Courses: test valid zip with empty result array, ResponseCode 400", function (done) {
        insightFacade.addDataset("testFile_3", readZip("testFile_3.zip")).then(function () {
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            sanityCheck(err);
            console.log(err.code, err.body);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("Courses: test valid zip that is empty, ResponseCode 400", function (done) {
        insightFacade.addDataset("testFile_4", readZip("testFile_4.zip")).then(function () {
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            sanityCheck(err);
            Util_1.default.error("Error");
            console.log(err.code, err.body);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("Courses: test remove valid zip that is not previously added, ResponseCode 404", function (done) {
        insightFacade.removeDataset("testFile_5").then(function () {
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            sanityCheck(err);
            console.log(err.code, err.body);
            chai_1.expect(err.code).to.equal(404);
            done();
        });
    });
    it("Courses: test file that is not a zip file, ResponseCode 400", function (done) {
        insightFacade.addDataset("testFile_7", readZip("testFile_7.rtf")).then(function () {
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            sanityCheck(err);
            console.log(err.code, err.body);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("Courses: test file that has no result key, ResponseCode 400", function (done) {
        insightFacade.addDataset("testFile_8", readZip("testFile_8.zip")).then(function () {
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            sanityCheck(err);
            console.log(err.code, err.body);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("Courses: test courses.zip addDataset, ResponseCode 204", function (done) {
        this.timeout(30000);
        insightFacade.addDataset("courses", readZip("courses.zip")).then(function (value) {
            console.log(value.code, value.body);
            sanityCheck(value);
            chai_1.expect(value.code).to.equal(204);
            done();
        }).catch(function (err) {
            console.log("Error: ", err);
            chai_1.expect.fail();
            done();
        });
    });
    it("Wrong ID rooms: test addDataset with wrong id, ResponseCode 400", function (done) {
        this.timeout(30000);
        insightFacade.addDataset("courses", readZip("rooms.zip")).then(function (value) {
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            console.log("Error: ", err);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("Wrong ID courses: test addDataset with wrong id, ResponseCode 400", function (done) {
        this.timeout(30000);
        insightFacade.addDataset("rooms", readZip("courses.zip")).then(function (value) {
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            console.log("Error: ", err);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("Courses: test courses.zip removeDataset, ResponseCode 204", function (done) {
        insightFacade.removeDataset("courses").then(function (value) {
            console.log(value.code, value.body);
            sanityCheck(value);
            chai_1.expect(value.code).to.equal(204);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("Courses PerformQuery: test courses.zip addDataset, ResponseCode 204", function (done) {
        this.timeout(30000);
        insightFacade.addDataset("courses", readZip("courses.zip")).then(function (value) {
            console.log(value.code, value.body);
            sanityCheck(value);
            chai_1.expect(value.code).to.equal(204);
            done();
        }).catch(function (err) {
            console.log("Error: ", err);
            chai_1.expect.fail();
            done();
        });
    });
    it("Rooms PerformQuery: test id being new, ResponseCode 204", function (done) {
        this.timeout(30000);
        insightFacade.addDataset("rooms", readZip("rooms.zip")).then(function (value) {
            console.log(value.code, value.body);
            sanityCheck(value);
            chai_1.expect(value.code).to.equal(204);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("Rooms: test id already existing, ResponseCode 201", function (done) {
        this.timeout(10000);
        insightFacade.addDataset("rooms", readZip("rooms.zip")).then(function (value) {
            console.log(value.code, value.body);
            sanityCheck(value);
            chai_1.expect(value.code).to.equal(201);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("Get All Courses Data", function (done) {
        this.timeout(30000);
        var testQuery = {
            "WHERE": {
                "GT": {
                    "courses_avg": -999
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg",
                    "courses_instructor",
                    "courses_title",
                    "courses_pass",
                    "courses_audit",
                    "courses_uuid",
                    "courses_year",
                    "courses_fail"
                ],
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code);
            console.log(value.body);
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("test getting column names", function () {
        var simpleQuery = {
            "WHERE": {
                "GT": {
                    "courses_avg": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        var columnsToReturn = [];
        var columns;
        columns = insightFacade.getColumns(simpleQuery);
        insightFacade.getColumnNames(columns, columnsToReturn);
        console.log(columnsToReturn);
    });
    it("test returning form", function () {
        var simpleQuery = {
            "WHERE": {
                "GT": {
                    "courses_avg": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        var columnsToReturn = [];
        var columns;
        columns = insightFacade.getColumns(simpleQuery);
        insightFacade.getColumnNames(columns, columnsToReturn);
    });
    it("Complex query with OR, AND, NOT, IS, GT, EQ", function (done) {
        var testQuery = {
            "WHERE": {
                "OR": [
                    {
                        "AND": [
                            {
                                "GT": {
                                    "courses_avg": 99
                                }
                            },
                            {
                                "NOT": {
                                    "IS": {
                                        "courses_dept": "adhe"
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "EQ": {
                            "courses_avg": 95
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg",
                    "courses_audit"
                ],
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("find all sections with avg over 90 taught by not taught by a specific instructor", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "NOT": { "IS": { "courses_instructor": "Harvey, nicholas" } }
                    },
                    {
                        "IS": { "courses_dept": "cpsc" }
                    },
                    {
                        "GT": { "courses_avg": 90 }
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
                "ORDER": "courses_instructor",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("find all courses in a dept with multiple instructors", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "IS": { "courses_instructor": "*;*" }
                    },
                    {
                        "IS": { "courses_dept": "cpsc" }
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
                "ORDER": "courses_instructor",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("find all sections with more than 20 auditors", function (done) {
        var testQuery = {
            "WHERE": {
                "GT": { "courses_audit": 20 }
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
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            chai_1.expect(value.code).to.equal(200);
            console.log(value.body);
            chai_1.expect(value.body).to.deep.equal({ "render": "TABLE", "result": [{ "courses_dept": "cpsc", "courses_id": "540", "courses_avg": 90.53, "courses_audit": 21, "courses_instructor": "", "courses_title": "machine learn i", "courses_pass": 59, "courses_uuid": "62475" }, { "courses_dept": "rhsc", "courses_id": "501", "courses_avg": 88.79, "courses_audit": 23, "courses_instructor": "", "courses_title": "eval src evidenc", "courses_pass": 14, "courses_uuid": "21789" }, { "courses_dept": "rhsc", "courses_id": "501", "courses_avg": 86.89, "courses_audit": 21, "courses_instructor": "", "courses_title": "eval src evidenc", "courses_pass": 18, "courses_uuid": "76489" }] });
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("complex query with AND, GT, EQ", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "GT": { "courses_avg": 75 },
                    },
                    {
                        "EQ": { "courses_avg": 76 }
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
                "ORDER": "courses_instructor",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("query with invalid IS", function (done) {
        var testQuery = {
            "WHERE": {
                "IS": { "courses_avg": "hello" }
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
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("OR query on different keys", function (done) {
        var testQuery = {
            "WHERE": {
                "OR": [
                    { "GT": { "courses_avg": 99 } },
                    { "GT": { "courses_pass": 2800 } },
                    { "GT": { "courses_audit": 20 } }
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
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("empty WHERE", function (done) {
        var testQuery = {
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
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("query on year", function (done) {
        var testQuery = {
            "WHERE": {
                "EQ": { "courses_year": 2012 }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_year"
                ],
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("query with invalid GT", function (done) {
        var testQuery = {
            "WHERE": {
                "GT": { "courses_instructor": 40 }
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
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("invalid query, no form", function (done) {
        var testQuery = {
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
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it.only("html test", function (done) {
        var testQuery = {
            "WHERE": {
                "IS": {
                    "rooms_fullname": "Allard Hall (LAW)"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_fullname"
                ],
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            done();
        }).catch(function (err) {
            chai_1.expect.fail();
            console.log(err);
            done();
        });
    });
    it("invalid query, no WHERE", function (done) {
        var testQuery = {
            "WHAT": {
                "GT": { "courses_foo": 40 }
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
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("testQuery, example includes order", function (done) {
        var testQuery1 = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 87
                        }
                    },
                    {
                        "IS": {
                            "courses_instructor": "cr*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_dept",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery1).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("testQuery, example includes order", function (done) {
        var testQuery1 = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 87
                        }
                    },
                    {
                        "IS": {
                            "courses_instructor": "cr*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg",
                    "courses_instructor"
                ],
                "ORDER": "courses_instructor",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery1).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("testQuery1", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 87
                        }
                    },
                    {
                        "IS": {
                            "courses_instructor": "cr*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("testQuery with no column name keys", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 87
                        }
                    },
                    {
                        "IS": {
                            "courses_instructor": "cr*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [""],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("testQuery with different column name keys", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 87
                        }
                    },
                    {
                        "IS": {
                            "courses_instructor": "cr*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": ["courses_dept",
                    "courses_id",
                    "courses_instructor",
                    "courses_title",
                    "courses_uuid"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("testQuery with invalid column name keys", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 87
                        }
                    },
                    {
                        "IS": {
                            "courses_instructor": "cr*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": ["courses_dept",
                    "courses_id",
                    "courses_pass",
                    "courses_audit",
                    "courses_fail",
                    "courses_avg"
                ],
                "ORDER": "courses_avg",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            done();
        });
    });
    it("test invalid Form", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 87
                        }
                    },
                    {
                        "IS": {
                            "courses_instructor": "cr*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": ["courses_dept"],
                "FORM": "notTable"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("test Order value not in Columns To return", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 87
                        }
                    },
                    {
                        "IS": {
                            "courses_instructor": "cr*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": ["courses_dept"],
                "ORDER": "courses_avg",
                "FORM": "notTable"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("test Order value not in Columns To return", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "courses_avg": 87
                        }
                    },
                    {
                        "IS": {
                            "courses_instructor": "cr*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": ["courses_dept"],
                "ORDER": "courses_avg",
                "FORM": "notTable"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect(err.code).to.equal(400);
            done();
        });
    });
    it("query 424", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "IS": { "rooms_name": "*;*" }
                    },
                    {
                        "IS": { "cou_dept": "cpsc" }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect(err.code).to.equal(424);
            done();
        });
    });
    it("test getlatlon (valid)", function (done) {
        insightFacade.getLatLon("6245%20Agronomy%20Road%20V6T%201Z4").then(function (value) {
            chai_1.expect(value.lat).to.equal(49.26125);
            chai_1.expect(value.lon).to.equal(-123.24807);
            console.log(value.lat);
            console.log(value.lon);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            done();
        });
    });
    it("test getlatlon (invalid)", function (done) {
        insightFacade.getLatLon("6245%20Agronomy%20Road%20V6T%201Z").then(function (value) {
            chai_1.expect.fail();
            console.log("should not be here");
            done();
        }).catch(function (err) {
            Util_1.default.error(err.error);
            console.log("in fail");
            chai_1.expect(err.error).to.equal("failed response");
            done();
        });
    });
    it("test getlatlon with spaces instead of %20 (valid)", function (done) {
        insightFacade.getLatLon("6245 Agronomy Road V6T 1Z4").then(function (value) {
            chai_1.expect(value.lat).to.equal(49.26125);
            chai_1.expect(value.lon).to.equal(-123.24807);
            console.log(value.lat);
            console.log(value.lon);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            done();
        });
    });
    it("test getlatlon with spaces instead of %20 (invalid)", function (done) {
        insightFacade.getLatLon("6245 Agronomy Road V6T 1Z").then(function (value) {
            chai_1.expect.fail();
            console.log("should not be here");
            done();
        }).catch(function (err) {
            Util_1.default.error(err.error);
            console.log("in fail");
            chai_1.expect(err.error).to.equal("failed response");
            done();
        });
    });
    it("query with IS on full name", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [{
                        "GT": {
                            "rooms_lat": 49.2612
                        }
                    },
                    {
                        "LT": {
                            "rooms_lat": 49.26129
                        }
                    },
                    {
                        "LT": {
                            "rooms_lon": -123.2480
                        }
                    },
                    {
                        "GT": {
                            "rooms_lon": -123.24809
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_fullname",
                    "rooms_name",
                    "rooms_shortname",
                    "rooms_address",
                    "rooms_lat",
                    "rooms_lon",
                    "rooms_seats",
                    "rooms_type",
                    "rooms_furniture",
                    "rooms_href"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("simpleQuery A from d2 specs", function (done) {
        var testQuery = {
            "WHERE": {
                "IS": {
                    "rooms_name": "DMP_*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("simpleQuery on furniture", function (done) {
        var testQuery = {
            "WHERE": {
                "IS": {
                    "rooms_number": "301"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_fullname",
                    "rooms_name",
                    "rooms_shortname",
                    "rooms_address",
                    "rooms_number",
                    "rooms_lat",
                    "rooms_lon",
                    "rooms_seats",
                    "rooms_type",
                    "rooms_furniture",
                    "rooms_href"
                ],
                "ORDER": "rooms_name",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("simpleQuery B from d2 specs", function (done) {
        var testQuery = {
            "WHERE": {
                "IS": {
                    "rooms_address": "*Agrono*"
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address", "rooms_name"
                ],
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("complex query", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "rooms_seats": 5
                        }
                    },
                    {
                        "IS": {
                            "rooms_address": "*Agrono*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address",
                    "rooms_lat",
                    "rooms_lon",
                    "rooms_seats"
                ],
                "ORDER": "rooms_seats",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("complex query (edge case with GT)", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "GT": {
                            "rooms_seats": 16
                        }
                    },
                    {
                        "IS": {
                            "rooms_address": "*Agrono*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address",
                    "rooms_lat",
                    "rooms_lon",
                    "rooms_seats"
                ],
                "ORDER": "rooms_seats",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            Util_1.default.error(err.code + " " + err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("complex query on seats and fullname", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    {
                        "LT": {
                            "rooms_seats": 150
                        }
                    },
                    {
                        "IS": {
                            "rooms_fullname": "*bio*"
                        }
                    }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_fullname",
                    "rooms_lat",
                    "rooms_lon",
                    "rooms_seats"
                ],
                "ORDER": "rooms_seats",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("find rooms in a building", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    { "NOT": { "IS": { "rooms_type": "Studio Lab" } } },
                    { "EQ": { "rooms_seats": 48 } },
                    { "NOT": { "IS": { "rooms_shortname": "MATH" } } }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address",
                    "rooms_lat",
                    "rooms_lon",
                    "rooms_type",
                    "rooms_seats"
                ],
                "ORDER": "rooms_address",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            chai_1.expect(value.code).to.equal(200);
            chai_1.expect(value.body).to.deep.equal({ "render": "TABLE", "result": [{ "rooms_address": "1866 Main Mall", "rooms_lat": 49.26826, "rooms_lon": -123.25468, "rooms_type": "Open Design General Purpose", "rooms_seats": 48 }, { "rooms_address": "6331 Crescent Road V6T 1Z1", "rooms_lat": 49.26867, "rooms_lon": -123.25692, "rooms_type": "Open Design General Purpose", "rooms_seats": 48 }, { "rooms_address": "6363 Agronomy Road", "rooms_lat": 49.26048, "rooms_lon": -123.24944, "rooms_type": "Active Learning", "rooms_seats": 48 }] });
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("find rooms in a building: only rooms address", function (done) {
        var testQuery = {
            "WHERE": {
                "AND": [
                    { "NOT": { "IS": { "rooms_type": "Studio Lab" } } },
                    { "EQ": { "rooms_seats": 48 } },
                    { "NOT": { "IS": { "rooms_shortname": "MATH" } } }
                ]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_address",
                ],
                "ORDER": "rooms_address",
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("TESTS 3", function (done) {
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
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code);
            chai_1.expect(value.body).to.deep.equal({ "render": "TABLE", "result": [{ "rooms_shortname": "OSBO", "maxSeats": 442 }, { "rooms_shortname": "HEBB", "maxSeats": 375 }, { "rooms_shortname": "LSC", "maxSeats": 350 }] });
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("GET ALL COURSES", function (done) {
        var testQuery = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "courses_avg",
                    "courses_instructor",
                    "courses_title",
                    "courses_pass",
                    "courses_fail",
                    "courses_audit",
                    "courses_uuid"
                ],
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("START OF HASHMAP IMPLEMENTATION TESTS 2", function (done) {
        var testQuery = {
            "WHERE": {
                "GT": {
                    "courses_avg": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "avgOfCourse"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept", "courses_id"],
                "APPLY": [{
                        "avgOfCourse": {
                            "AVG": "courses_avg"
                        }
                    }]
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code);
            console.log(value.body);
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            done();
        });
    });
    it("Test Group", function (done) {
        var testQuery = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_seats",
                    "rooms_href",
                    "avgseats"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_seats", "rooms_href"],
                "APPLY": [{
                        "avgseats": {
                            "AVG": "rooms_seats"
                        }
                    }]
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.body);
            chai_1.expect(JSON.stringify(value.body)).to.equal(JSON.stringify({ "render": "TABLE", "result": [{ "rooms_shortname": "WOOD", "rooms_seats": 12, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-G65", "avgseats": 12 }, { "rooms_shortname": "WOOD", "rooms_seats": 12, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-G57", "avgseats": 12 }, { "rooms_shortname": "WOOD", "rooms_seats": 10, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-G53", "avgseats": 10 }, { "rooms_shortname": "WOOD", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-G41", "avgseats": 30 }, { "rooms_shortname": "WOOD", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-B75", "avgseats": 30 }, { "rooms_shortname": "WOOD", "rooms_seats": 120, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-5", "avgseats": 120 }, { "rooms_shortname": "WOOD", "rooms_seats": 88, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-3", "avgseats": 88 }, { "rooms_shortname": "WOOD", "rooms_seats": 120, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-1", "avgseats": 120 }, { "rooms_shortname": "WOOD", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-G66", "avgseats": 16 }, { "rooms_shortname": "WOOD", "rooms_seats": 10, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-G59", "avgseats": 10 }, { "rooms_shortname": "WOOD", "rooms_seats": 10, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-G55", "avgseats": 10 }, { "rooms_shortname": "WOOD", "rooms_seats": 14, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-G44", "avgseats": 14 }, { "rooms_shortname": "WOOD", "rooms_seats": 21, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-B79", "avgseats": 21 }, { "rooms_shortname": "WOOD", "rooms_seats": 181, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-6", "avgseats": 181 }, { "rooms_shortname": "WOOD", "rooms_seats": 120, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-4", "avgseats": 120 }, { "rooms_shortname": "WOOD", "rooms_seats": 503, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WOOD-2", "avgseats": 503 }, { "rooms_shortname": "SWNG", "rooms_seats": 47, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-409", "avgseats": 47 }, { "rooms_shortname": "SWNG", "rooms_seats": 47, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-407", "avgseats": 47 }, { "rooms_shortname": "SWNG", "rooms_seats": 47, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-405", "avgseats": 47 }, { "rooms_shortname": "SWNG", "rooms_seats": 47, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-309", "avgseats": 47 }, { "rooms_shortname": "SWNG", "rooms_seats": 47, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-307", "avgseats": 47 }, { "rooms_shortname": "SWNG", "rooms_seats": 47, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-305", "avgseats": 47 }, { "rooms_shortname": "SWNG", "rooms_seats": 190, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-221", "avgseats": 190 }, { "rooms_shortname": "SWNG", "rooms_seats": 187, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-121", "avgseats": 187 }, { "rooms_shortname": "SWNG", "rooms_seats": 47, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-109", "avgseats": 47 }, { "rooms_shortname": "SWNG", "rooms_seats": 47, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-107", "avgseats": 47 }, { "rooms_shortname": "SWNG", "rooms_seats": 47, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-105", "avgseats": 47 }, { "rooms_shortname": "SWNG", "rooms_seats": 27, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-410", "avgseats": 27 }, { "rooms_shortname": "SWNG", "rooms_seats": 27, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-408", "avgseats": 27 }, { "rooms_shortname": "SWNG", "rooms_seats": 27, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-406", "avgseats": 27 }, { "rooms_shortname": "SWNG", "rooms_seats": 27, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-310", "avgseats": 27 }, { "rooms_shortname": "SWNG", "rooms_seats": 27, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-308", "avgseats": 27 }, { "rooms_shortname": "SWNG", "rooms_seats": 27, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-306", "avgseats": 27 }, { "rooms_shortname": "SWNG", "rooms_seats": 190, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-222", "avgseats": 190 }, { "rooms_shortname": "SWNG", "rooms_seats": 188, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-122", "avgseats": 188 }, { "rooms_shortname": "SWNG", "rooms_seats": 27, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-110", "avgseats": 27 }, { "rooms_shortname": "SWNG", "rooms_seats": 27, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-108", "avgseats": 27 }, { "rooms_shortname": "SWNG", "rooms_seats": 27, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SWNG-106", "avgseats": 27 }, { "rooms_shortname": "WESB", "rooms_seats": 325, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WESB-100", "avgseats": 325 }, { "rooms_shortname": "WESB", "rooms_seats": 102, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/WESB-201", "avgseats": 102 }, { "rooms_shortname": "MGYM", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MGYM-206", "avgseats": 25 }, { "rooms_shortname": "MGYM", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MGYM-208", "avgseats": 40 }, { "rooms_shortname": "UCLL", "rooms_seats": 48, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/UCLL-107", "avgseats": 48 }, { "rooms_shortname": "UCLL", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/UCLL-101", "avgseats": 30 }, { "rooms_shortname": "UCLL", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/UCLL-109", "avgseats": 30 }, { "rooms_shortname": "UCLL", "rooms_seats": 55, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/UCLL-103", "avgseats": 55 }, { "rooms_shortname": "SRC", "rooms_seats": 299, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SRC-220C", "avgseats": 299 }, { "rooms_shortname": "SRC", "rooms_seats": 299, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SRC-220A", "avgseats": 299 }, { "rooms_shortname": "SRC", "rooms_seats": 299, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SRC-220B", "avgseats": 299 }, { "rooms_shortname": "SPPH", "rooms_seats": 14, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-B138", "avgseats": 14 }, { "rooms_shortname": "SPPH", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-B112", "avgseats": 16 }, { "rooms_shortname": "SPPH", "rooms_seats": 28, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-143", "avgseats": 28 }, { "rooms_shortname": "SPPH", "rooms_seats": 66, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-B151", "avgseats": 66 }, { "rooms_shortname": "SPPH", "rooms_seats": 12, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-B136", "avgseats": 12 }, { "rooms_shortname": "SPPH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SPPH-B108", "avgseats": 30 }, { "rooms_shortname": "OSBO", "rooms_seats": 442, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/OSBO-A", "avgseats": 442 }, { "rooms_shortname": "OSBO", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/OSBO-203A", "avgseats": 40 }, { "rooms_shortname": "OSBO", "rooms_seats": 39, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/OSBO-203B", "avgseats": 39 }, { "rooms_shortname": "PCOH", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PCOH-1215", "avgseats": 24 }, { "rooms_shortname": "PCOH", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PCOH-1009", "avgseats": 24 }, { "rooms_shortname": "PCOH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PCOH-1003", "avgseats": 40 }, { "rooms_shortname": "PCOH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PCOH-1001", "avgseats": 40 }, { "rooms_shortname": "PCOH", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PCOH-1302", "avgseats": 24 }, { "rooms_shortname": "PCOH", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PCOH-1011", "avgseats": 24 }, { "rooms_shortname": "PCOH", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PCOH-1008", "avgseats": 24 }, { "rooms_shortname": "PCOH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PCOH-1002", "avgseats": 40 }, { "rooms_shortname": "PHRM", "rooms_seats": 72, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-3208", "avgseats": 72 }, { "rooms_shortname": "PHRM", "rooms_seats": 7, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-3122", "avgseats": 7 }, { "rooms_shortname": "PHRM", "rooms_seats": 7, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-3118", "avgseats": 7 }, { "rooms_shortname": "PHRM", "rooms_seats": 7, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-3115", "avgseats": 7 }, { "rooms_shortname": "PHRM", "rooms_seats": 7, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-3112", "avgseats": 7 }, { "rooms_shortname": "PHRM", "rooms_seats": 236, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-1101", "avgseats": 236 }, { "rooms_shortname": "PHRM", "rooms_seats": 7, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-3124", "avgseats": 7 }, { "rooms_shortname": "PHRM", "rooms_seats": 7, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-3120", "avgseats": 7 }, { "rooms_shortname": "PHRM", "rooms_seats": 14, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-3116", "avgseats": 14 }, { "rooms_shortname": "PHRM", "rooms_seats": 7, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-3114", "avgseats": 7 }, { "rooms_shortname": "PHRM", "rooms_seats": 167, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/PHRM-1201", "avgseats": 167 }, { "rooms_shortname": "ORCH", "rooms_seats": 72, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-4074", "avgseats": 72 }, { "rooms_shortname": "ORCH", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-4068", "avgseats": 16 }, { "rooms_shortname": "ORCH", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-4058", "avgseats": 25 }, { "rooms_shortname": "ORCH", "rooms_seats": 48, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-4018", "avgseats": 48 }, { "rooms_shortname": "ORCH", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-4004", "avgseats": 25 }, { "rooms_shortname": "ORCH", "rooms_seats": 72, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-3074", "avgseats": 72 }, { "rooms_shortname": "ORCH", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-3068", "avgseats": 16 }, { "rooms_shortname": "ORCH", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-3058", "avgseats": 25 }, { "rooms_shortname": "ORCH", "rooms_seats": 48, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-3018", "avgseats": 48 }, { "rooms_shortname": "ORCH", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-3004", "avgseats": 25 }, { "rooms_shortname": "ORCH", "rooms_seats": 72, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-1001", "avgseats": 72 }, { "rooms_shortname": "ORCH", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-4072", "avgseats": 20 }, { "rooms_shortname": "ORCH", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-4062", "avgseats": 16 }, { "rooms_shortname": "ORCH", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-4052", "avgseats": 25 }, { "rooms_shortname": "ORCH", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-4016", "avgseats": 25 }, { "rooms_shortname": "ORCH", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-4002", "avgseats": 25 }, { "rooms_shortname": "ORCH", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-3072", "avgseats": 16 }, { "rooms_shortname": "ORCH", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-3062", "avgseats": 16 }, { "rooms_shortname": "ORCH", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-3052", "avgseats": 25 }, { "rooms_shortname": "ORCH", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-3016", "avgseats": 25 }, { "rooms_shortname": "ORCH", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ORCH-3002", "avgseats": 25 }, { "rooms_shortname": "SCRF", "rooms_seats": 60, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-209", "avgseats": 60 }, { "rooms_shortname": "SCRF", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-207", "avgseats": 40 }, { "rooms_shortname": "SCRF", "rooms_seats": 34, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-205", "avgseats": 34 }, { "rooms_shortname": "SCRF", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-204", "avgseats": 40 }, { "rooms_shortname": "SCRF", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-202", "avgseats": 40 }, { "rooms_shortname": "SCRF", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-200", "avgseats": 40 }, { "rooms_shortname": "SCRF", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-1024", "avgseats": 20 }, { "rooms_shortname": "SCRF", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-1022", "avgseats": 20 }, { "rooms_shortname": "SCRF", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-1020", "avgseats": 24 }, { "rooms_shortname": "SCRF", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-1004", "avgseats": 40 }, { "rooms_shortname": "SCRF", "rooms_seats": 280, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-100", "avgseats": 280 }, { "rooms_shortname": "SCRF", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-210", "avgseats": 24 }, { "rooms_shortname": "SCRF", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-208", "avgseats": 40 }, { "rooms_shortname": "SCRF", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-206", "avgseats": 40 }, { "rooms_shortname": "SCRF", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-204A", "avgseats": 24 }, { "rooms_shortname": "SCRF", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-203", "avgseats": 40 }, { "rooms_shortname": "SCRF", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-201", "avgseats": 40 }, { "rooms_shortname": "SCRF", "rooms_seats": 38, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-1328", "avgseats": 38 }, { "rooms_shortname": "SCRF", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-1023", "avgseats": 20 }, { "rooms_shortname": "SCRF", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-1021", "avgseats": 20 }, { "rooms_shortname": "SCRF", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-1005", "avgseats": 40 }, { "rooms_shortname": "SCRF", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SCRF-1003", "avgseats": 40 }, { "rooms_shortname": "MATX", "rooms_seats": 106, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATX-1100", "avgseats": 106 }, { "rooms_shortname": "MATH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-204", "avgseats": 30 }, { "rooms_shortname": "MATH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-202", "avgseats": 30 }, { "rooms_shortname": "MATH", "rooms_seats": 48, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-104", "avgseats": 48 }, { "rooms_shortname": "MATH", "rooms_seats": 224, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-100", "avgseats": 224 }, { "rooms_shortname": "MATH", "rooms_seats": 25, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-225", "avgseats": 25 }, { "rooms_shortname": "MATH", "rooms_seats": 48, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-203", "avgseats": 48 }, { "rooms_shortname": "MATH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-105", "avgseats": 30 }, { "rooms_shortname": "MATH", "rooms_seats": 60, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MATH-102", "avgseats": 60 }, { "rooms_shortname": "MCML", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360M", "avgseats": 8 }, { "rooms_shortname": "MCML", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360K", "avgseats": 8 }, { "rooms_shortname": "MCML", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360H", "avgseats": 8 }, { "rooms_shortname": "MCML", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360F", "avgseats": 8 }, { "rooms_shortname": "MCML", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360D", "avgseats": 8 }, { "rooms_shortname": "MCML", "rooms_seats": 6, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360B", "avgseats": 6 }, { "rooms_shortname": "MCML", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-358", "avgseats": 24 }, { "rooms_shortname": "MCML", "rooms_seats": 32, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-256", "avgseats": 32 }, { "rooms_shortname": "MCML", "rooms_seats": 72, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-160", "avgseats": 72 }, { "rooms_shortname": "MCML", "rooms_seats": 47, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-154", "avgseats": 47 }, { "rooms_shortname": "MCML", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360L", "avgseats": 8 }, { "rooms_shortname": "MCML", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360J", "avgseats": 8 }, { "rooms_shortname": "MCML", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360G", "avgseats": 8 }, { "rooms_shortname": "MCML", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360E", "avgseats": 8 }, { "rooms_shortname": "MCML", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360C", "avgseats": 8 }, { "rooms_shortname": "MCML", "rooms_seats": 6, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-360A", "avgseats": 6 }, { "rooms_shortname": "MCML", "rooms_seats": 32, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-260", "avgseats": 32 }, { "rooms_shortname": "MCML", "rooms_seats": 200, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-166", "avgseats": 200 }, { "rooms_shortname": "MCML", "rooms_seats": 74, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCML-158", "avgseats": 74 }, { "rooms_shortname": "MCLD", "rooms_seats": 60, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCLD-242", "avgseats": 60 }, { "rooms_shortname": "MCLD", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCLD-220", "avgseats": 40 }, { "rooms_shortname": "MCLD", "rooms_seats": 123, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCLD-202", "avgseats": 123 }, { "rooms_shortname": "MCLD", "rooms_seats": 84, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCLD-254", "avgseats": 84 }, { "rooms_shortname": "MCLD", "rooms_seats": 136, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCLD-228", "avgseats": 136 }, { "rooms_shortname": "MCLD", "rooms_seats": 60, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/MCLD-214", "avgseats": 60 }, { "rooms_shortname": "LSC", "rooms_seats": 125, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LSC-1003", "avgseats": 125 }, { "rooms_shortname": "LSC", "rooms_seats": 350, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LSC-1001", "avgseats": 350 }, { "rooms_shortname": "LSC", "rooms_seats": 350, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LSC-1002", "avgseats": 350 }, { "rooms_shortname": "LSK", "rooms_seats": 75, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LSK-460", "avgseats": 75 }, { "rooms_shortname": "LSK", "rooms_seats": 205, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LSK-200", "avgseats": 205 }, { "rooms_shortname": "LSK", "rooms_seats": 42, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LSK-462", "avgseats": 42 }, { "rooms_shortname": "LSK", "rooms_seats": 183, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LSK-201", "avgseats": 183 }, { "rooms_shortname": "SOWK", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-326", "avgseats": 16 }, { "rooms_shortname": "SOWK", "rooms_seats": 31, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-224", "avgseats": 31 }, { "rooms_shortname": "SOWK", "rooms_seats": 29, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-222", "avgseats": 29 }, { "rooms_shortname": "SOWK", "rooms_seats": 12, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-122", "avgseats": 12 }, { "rooms_shortname": "SOWK", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-324", "avgseats": 16 }, { "rooms_shortname": "SOWK", "rooms_seats": 29, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-223", "avgseats": 29 }, { "rooms_shortname": "SOWK", "rooms_seats": 68, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-124", "avgseats": 68 }, { "rooms_shortname": "IBLC", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-460", "avgseats": 16 }, { "rooms_shortname": "IBLC", "rooms_seats": 10, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-265", "avgseats": 10 }, { "rooms_shortname": "IBLC", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-263", "avgseats": 8 }, { "rooms_shortname": "IBLC", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-195", "avgseats": 8 }, { "rooms_shortname": "IBLC", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-193", "avgseats": 8 }, { "rooms_shortname": "IBLC", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-191", "avgseats": 24 }, { "rooms_shortname": "IBLC", "rooms_seats": 154, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-182", "avgseats": 154 }, { "rooms_shortname": "IBLC", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-157", "avgseats": 24 }, { "rooms_shortname": "IBLC", "rooms_seats": 50, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-155", "avgseats": 50 }, { "rooms_shortname": "IBLC", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-461", "avgseats": 30 }, { "rooms_shortname": "IBLC", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-266", "avgseats": 8 }, { "rooms_shortname": "IBLC", "rooms_seats": 12, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-264", "avgseats": 12 }, { "rooms_shortname": "IBLC", "rooms_seats": 112, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-261", "avgseats": 112 }, { "rooms_shortname": "IBLC", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-194", "avgseats": 8 }, { "rooms_shortname": "IBLC", "rooms_seats": 8, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-192", "avgseats": 8 }, { "rooms_shortname": "IBLC", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-185", "avgseats": 40 }, { "rooms_shortname": "IBLC", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-158", "avgseats": 24 }, { "rooms_shortname": "IBLC", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IBLC-156", "avgseats": 24 }, { "rooms_shortname": "IONA", "rooms_seats": 100, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IONA-301", "avgseats": 100 }, { "rooms_shortname": "IONA", "rooms_seats": 50, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/IONA-633", "avgseats": 50 }, { "rooms_shortname": "DMP", "rooms_seats": 160, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-310", "avgseats": 160 }, { "rooms_shortname": "DMP", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-201", "avgseats": 40 }, { "rooms_shortname": "DMP", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-101", "avgseats": 40 }, { "rooms_shortname": "DMP", "rooms_seats": 80, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-301", "avgseats": 80 }, { "rooms_shortname": "DMP", "rooms_seats": 120, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-110", "avgseats": 120 }, { "rooms_shortname": "ANGU", "rooms_seats": 53, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-435", "avgseats": 53 }, { "rooms_shortname": "ANGU", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-432", "avgseats": 16 }, { "rooms_shortname": "ANGU", "rooms_seats": 58, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-350", "avgseats": 58 }, { "rooms_shortname": "ANGU", "rooms_seats": 68, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-345", "avgseats": 68 }, { "rooms_shortname": "ANGU", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-339", "avgseats": 20 }, { "rooms_shortname": "ANGU", "rooms_seats": 60, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-334", "avgseats": 60 }, { "rooms_shortname": "ANGU", "rooms_seats": 37, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-296", "avgseats": 37 }, { "rooms_shortname": "ANGU", "rooms_seats": 32, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-293", "avgseats": 32 }, { "rooms_shortname": "ANGU", "rooms_seats": 54, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-291", "avgseats": 54 }, { "rooms_shortname": "ANGU", "rooms_seats": 68, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-243", "avgseats": 68 }, { "rooms_shortname": "ANGU", "rooms_seats": 41, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-237", "avgseats": 41 }, { "rooms_shortname": "ANGU", "rooms_seats": 60, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-234", "avgseats": 60 }, { "rooms_shortname": "ANGU", "rooms_seats": 260, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-098", "avgseats": 260 }, { "rooms_shortname": "ANGU", "rooms_seats": 54, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-037", "avgseats": 54 }, { "rooms_shortname": "ANGU", "rooms_seats": 32, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-437", "avgseats": 32 }, { "rooms_shortname": "ANGU", "rooms_seats": 44, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-434", "avgseats": 44 }, { "rooms_shortname": "ANGU", "rooms_seats": 44, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-354", "avgseats": 44 }, { "rooms_shortname": "ANGU", "rooms_seats": 70, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-347", "avgseats": 70 }, { "rooms_shortname": "ANGU", "rooms_seats": 68, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-343", "avgseats": 68 }, { "rooms_shortname": "ANGU", "rooms_seats": 41, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-335", "avgseats": 41 }, { "rooms_shortname": "ANGU", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-332", "avgseats": 16 }, { "rooms_shortname": "ANGU", "rooms_seats": 54, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-295", "avgseats": 54 }, { "rooms_shortname": "ANGU", "rooms_seats": 35, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-292", "avgseats": 35 }, { "rooms_shortname": "ANGU", "rooms_seats": 80, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-254", "avgseats": 80 }, { "rooms_shortname": "ANGU", "rooms_seats": 70, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-241", "avgseats": 70 }, { "rooms_shortname": "ANGU", "rooms_seats": 41, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-235", "avgseats": 41 }, { "rooms_shortname": "ANGU", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-232", "avgseats": 16 }, { "rooms_shortname": "ANGU", "rooms_seats": 54, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANGU-039", "avgseats": 54 }, { "rooms_shortname": "HENN", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/HENN-302", "avgseats": 30 }, { "rooms_shortname": "HENN", "rooms_seats": 150, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/HENN-202", "avgseats": 150 }, { "rooms_shortname": "HENN", "rooms_seats": 257, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/HENN-200", "avgseats": 257 }, { "rooms_shortname": "HENN", "rooms_seats": 36, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/HENN-304", "avgseats": 36 }, { "rooms_shortname": "HENN", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/HENN-301", "avgseats": 30 }, { "rooms_shortname": "HENN", "rooms_seats": 155, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/HENN-201", "avgseats": 155 }, { "rooms_shortname": "HEBB", "rooms_seats": 54, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/HEBB-12", "avgseats": 54 }, { "rooms_shortname": "HEBB", "rooms_seats": 54, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/HEBB-10", "avgseats": 54 }, { "rooms_shortname": "HEBB", "rooms_seats": 54, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/HEBB-13", "avgseats": 54 }, { "rooms_shortname": "HEBB", "rooms_seats": 375, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/HEBB-100", "avgseats": 375 }, { "rooms_shortname": "GEOG", "rooms_seats": 39, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/GEOG-214", "avgseats": 39 }, { "rooms_shortname": "GEOG", "rooms_seats": 42, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/GEOG-201", "avgseats": 42 }, { "rooms_shortname": "GEOG", "rooms_seats": 60, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/GEOG-147", "avgseats": 60 }, { "rooms_shortname": "GEOG", "rooms_seats": 225, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/GEOG-100", "avgseats": 225 }, { "rooms_shortname": "GEOG", "rooms_seats": 21, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/GEOG-242", "avgseats": 21 }, { "rooms_shortname": "GEOG", "rooms_seats": 72, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/GEOG-212", "avgseats": 72 }, { "rooms_shortname": "GEOG", "rooms_seats": 100, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/GEOG-200", "avgseats": 100 }, { "rooms_shortname": "GEOG", "rooms_seats": 60, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/GEOG-101", "avgseats": 60 }, { "rooms_shortname": "FRDM", "rooms_seats": 160, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FRDM-153", "avgseats": 160 }, { "rooms_shortname": "LASR", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LASR-211", "avgseats": 20 }, { "rooms_shortname": "LASR", "rooms_seats": 60, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LASR-105", "avgseats": 60 }, { "rooms_shortname": "LASR", "rooms_seats": 80, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LASR-102", "avgseats": 80 }, { "rooms_shortname": "LASR", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LASR-5C", "avgseats": 20 }, { "rooms_shortname": "LASR", "rooms_seats": 51, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LASR-107", "avgseats": 51 }, { "rooms_shortname": "LASR", "rooms_seats": 94, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/LASR-104", "avgseats": 94 }, { "rooms_shortname": "FORW", "rooms_seats": 35, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FORW-519", "avgseats": 35 }, { "rooms_shortname": "FORW", "rooms_seats": 63, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FORW-303", "avgseats": 63 }, { "rooms_shortname": "FORW", "rooms_seats": 44, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FORW-317", "avgseats": 44 }, { "rooms_shortname": "FSC", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FSC-1615", "avgseats": 20 }, { "rooms_shortname": "FSC", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FSC-1611", "avgseats": 24 }, { "rooms_shortname": "FSC", "rooms_seats": 99, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FSC-1221", "avgseats": 99 }, { "rooms_shortname": "FSC", "rooms_seats": 65, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FSC-1003", "avgseats": 65 }, { "rooms_shortname": "FSC", "rooms_seats": 65, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FSC-1001", "avgseats": 65 }, { "rooms_shortname": "FSC", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FSC-1617", "avgseats": 20 }, { "rooms_shortname": "FSC", "rooms_seats": 36, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FSC-1613", "avgseats": 36 }, { "rooms_shortname": "FSC", "rooms_seats": 18, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FSC-1402", "avgseats": 18 }, { "rooms_shortname": "FSC", "rooms_seats": 250, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FSC-1005", "avgseats": 250 }, { "rooms_shortname": "FSC", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FSC-1002", "avgseats": 24 }, { "rooms_shortname": "FNH", "rooms_seats": 43, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FNH-50", "avgseats": 43 }, { "rooms_shortname": "FNH", "rooms_seats": 27, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FNH-320", "avgseats": 27 }, { "rooms_shortname": "FNH", "rooms_seats": 12, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FNH-20", "avgseats": 12 }, { "rooms_shortname": "FNH", "rooms_seats": 99, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FNH-60", "avgseats": 99 }, { "rooms_shortname": "FNH", "rooms_seats": 54, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FNH-40", "avgseats": 54 }, { "rooms_shortname": "FNH", "rooms_seats": 28, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/FNH-30", "avgseats": 28 }, { "rooms_shortname": "ESB", "rooms_seats": 80, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ESB-2012", "avgseats": 80 }, { "rooms_shortname": "ESB", "rooms_seats": 150, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ESB-1012", "avgseats": 150 }, { "rooms_shortname": "ESB", "rooms_seats": 350, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ESB-1013", "avgseats": 350 }, { "rooms_shortname": "EOSM", "rooms_seats": 50, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/EOSM-135", "avgseats": 50 }, { "rooms_shortname": "CEME", "rooms_seats": 34, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CEME-1212", "avgseats": 34 }, { "rooms_shortname": "CEME", "rooms_seats": 26, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CEME-1206", "avgseats": 26 }, { "rooms_shortname": "CEME", "rooms_seats": 100, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CEME-1202", "avgseats": 100 }, { "rooms_shortname": "CEME", "rooms_seats": 45, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CEME-1215", "avgseats": 45 }, { "rooms_shortname": "CEME", "rooms_seats": 22, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CEME-1210", "avgseats": 22 }, { "rooms_shortname": "CEME", "rooms_seats": 62, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CEME-1204", "avgseats": 62 }, { "rooms_shortname": "CHEM", "rooms_seats": 114, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CHEM-D200", "avgseats": 114 }, { "rooms_shortname": "CHEM", "rooms_seats": 90, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CHEM-C124", "avgseats": 90 }, { "rooms_shortname": "CHEM", "rooms_seats": 265, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CHEM-B150", "avgseats": 265 }, { "rooms_shortname": "CHEM", "rooms_seats": 114, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CHEM-D300", "avgseats": 114 }, { "rooms_shortname": "CHEM", "rooms_seats": 90, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CHEM-C126", "avgseats": 90 }, { "rooms_shortname": "CHEM", "rooms_seats": 240, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CHEM-B250", "avgseats": 240 }, { "rooms_shortname": "CHBE", "rooms_seats": 60, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CHBE-103", "avgseats": 60 }, { "rooms_shortname": "CHBE", "rooms_seats": 200, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CHBE-101", "avgseats": 200 }, { "rooms_shortname": "CHBE", "rooms_seats": 94, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CHBE-102", "avgseats": 94 }, { "rooms_shortname": "CIRS", "rooms_seats": 426, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/CIRS-1250", "avgseats": 426 }, { "rooms_shortname": "BUCH", "rooms_seats": 22, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D325", "avgseats": 22 }, { "rooms_shortname": "BUCH", "rooms_seats": 50, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D322", "avgseats": 50 }, { "rooms_shortname": "BUCH", "rooms_seats": 50, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D317", "avgseats": 50 }, { "rooms_shortname": "BUCH", "rooms_seats": 22, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D315", "avgseats": 22 }, { "rooms_shortname": "BUCH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D313", "avgseats": 30 }, { "rooms_shortname": "BUCH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D307", "avgseats": 30 }, { "rooms_shortname": "BUCH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D304", "avgseats": 30 }, { "rooms_shortname": "BUCH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D229", "avgseats": 30 }, { "rooms_shortname": "BUCH", "rooms_seats": 65, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D222", "avgseats": 65 }, { "rooms_shortname": "BUCH", "rooms_seats": 65, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D219", "avgseats": 65 }, { "rooms_shortname": "BUCH", "rooms_seats": 65, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D217", "avgseats": 65 }, { "rooms_shortname": "BUCH", "rooms_seats": 22, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D214", "avgseats": 22 }, { "rooms_shortname": "BUCH", "rooms_seats": 22, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D209", "avgseats": 22 }, { "rooms_shortname": "BUCH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D205", "avgseats": 30 }, { "rooms_shortname": "BUCH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D201", "avgseats": 40 }, { "rooms_shortname": "BUCH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B318", "avgseats": 40 }, { "rooms_shortname": "BUCH", "rooms_seats": 78, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B315", "avgseats": 78 }, { "rooms_shortname": "BUCH", "rooms_seats": 18, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B312", "avgseats": 18 }, { "rooms_shortname": "BUCH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B309", "avgseats": 40 }, { "rooms_shortname": "BUCH", "rooms_seats": 32, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B307", "avgseats": 32 }, { "rooms_shortname": "BUCH", "rooms_seats": 32, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B304", "avgseats": 32 }, { "rooms_shortname": "BUCH", "rooms_seats": 32, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B302", "avgseats": 32 }, { "rooms_shortname": "BUCH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B218", "avgseats": 40 }, { "rooms_shortname": "BUCH", "rooms_seats": 78, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B215", "avgseats": 78 }, { "rooms_shortname": "BUCH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B211", "avgseats": 40 }, { "rooms_shortname": "BUCH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B209", "avgseats": 40 }, { "rooms_shortname": "BUCH", "rooms_seats": 26, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B142", "avgseats": 26 }, { "rooms_shortname": "BUCH", "rooms_seats": 108, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-A203", "avgseats": 108 }, { "rooms_shortname": "BUCH", "rooms_seats": 181, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-A201", "avgseats": 181 }, { "rooms_shortname": "BUCH", "rooms_seats": 131, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-A103", "avgseats": 131 }, { "rooms_shortname": "BUCH", "rooms_seats": 275, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-A101", "avgseats": 275 }, { "rooms_shortname": "BUCH", "rooms_seats": 31, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D323", "avgseats": 31 }, { "rooms_shortname": "BUCH", "rooms_seats": 22, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D319", "avgseats": 22 }, { "rooms_shortname": "BUCH", "rooms_seats": 50, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D316", "avgseats": 50 }, { "rooms_shortname": "BUCH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D314", "avgseats": 40 }, { "rooms_shortname": "BUCH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D312", "avgseats": 40 }, { "rooms_shortname": "BUCH", "rooms_seats": 22, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D306", "avgseats": 22 }, { "rooms_shortname": "BUCH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D301", "avgseats": 40 }, { "rooms_shortname": "BUCH", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D228", "avgseats": 24 }, { "rooms_shortname": "BUCH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D221", "avgseats": 30 }, { "rooms_shortname": "BUCH", "rooms_seats": 65, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D218", "avgseats": 65 }, { "rooms_shortname": "BUCH", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D216", "avgseats": 24 }, { "rooms_shortname": "BUCH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D213", "avgseats": 30 }, { "rooms_shortname": "BUCH", "rooms_seats": 30, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D207", "avgseats": 30 }, { "rooms_shortname": "BUCH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-D204", "avgseats": 40 }, { "rooms_shortname": "BUCH", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B319", "avgseats": 24 }, { "rooms_shortname": "BUCH", "rooms_seats": 22, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B316", "avgseats": 22 }, { "rooms_shortname": "BUCH", "rooms_seats": 78, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B313", "avgseats": 78 }, { "rooms_shortname": "BUCH", "rooms_seats": 32, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B310", "avgseats": 32 }, { "rooms_shortname": "BUCH", "rooms_seats": 32, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B308", "avgseats": 32 }, { "rooms_shortname": "BUCH", "rooms_seats": 32, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B306", "avgseats": 32 }, { "rooms_shortname": "BUCH", "rooms_seats": 40, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B303", "avgseats": 40 }, { "rooms_shortname": "BUCH", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B219", "avgseats": 24 }, { "rooms_shortname": "BUCH", "rooms_seats": 22, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B216", "avgseats": 22 }, { "rooms_shortname": "BUCH", "rooms_seats": 78, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B213", "avgseats": 78 }, { "rooms_shortname": "BUCH", "rooms_seats": 48, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B210", "avgseats": 48 }, { "rooms_shortname": "BUCH", "rooms_seats": 56, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B208", "avgseats": 56 }, { "rooms_shortname": "BUCH", "rooms_seats": 42, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-B141", "avgseats": 42 }, { "rooms_shortname": "BUCH", "rooms_seats": 108, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-A202", "avgseats": 108 }, { "rooms_shortname": "BUCH", "rooms_seats": 150, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-A104", "avgseats": 150 }, { "rooms_shortname": "BUCH", "rooms_seats": 150, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BUCH-A102", "avgseats": 150 }, { "rooms_shortname": "BRKX", "rooms_seats": 70, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BRKX-2365", "avgseats": 70 }, { "rooms_shortname": "BRKX", "rooms_seats": 24, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BRKX-2367", "avgseats": 24 }, { "rooms_shortname": "BIOL", "rooms_seats": 76, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BIOL-2200", "avgseats": 76 }, { "rooms_shortname": "BIOL", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BIOL-1503", "avgseats": 16 }, { "rooms_shortname": "BIOL", "rooms_seats": 16, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BIOL-2519", "avgseats": 16 }, { "rooms_shortname": "BIOL", "rooms_seats": 228, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/BIOL-2000", "avgseats": 228 }, { "rooms_shortname": "AUDX", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/AUDX-142", "avgseats": 20 }, { "rooms_shortname": "AUDX", "rooms_seats": 21, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/AUDX-157", "avgseats": 21 }, { "rooms_shortname": "AERL", "rooms_seats": 144, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/AERL-120", "avgseats": 144 }, { "rooms_shortname": "ANSO", "rooms_seats": 37, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANSO-205", "avgseats": 37 }, { "rooms_shortname": "ANSO", "rooms_seats": 26, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANSO-202", "avgseats": 26 }, { "rooms_shortname": "ANSO", "rooms_seats": 90, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANSO-207", "avgseats": 90 }, { "rooms_shortname": "ANSO", "rooms_seats": 33, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ANSO-203", "avgseats": 33 }, { "rooms_shortname": "ALRD", "rooms_seats": 44, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ALRD-B101", "avgseats": 44 }, { "rooms_shortname": "ALRD", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ALRD-113", "avgseats": 20 }, { "rooms_shortname": "ALRD", "rooms_seats": 94, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ALRD-105", "avgseats": 94 }, { "rooms_shortname": "ALRD", "rooms_seats": 50, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ALRD-121", "avgseats": 50 }, { "rooms_shortname": "ALRD", "rooms_seats": 20, "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/ALRD-112", "avgseats": 20 }] }));
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            done();
        });
    });
    it("testing SUM fn", function (done) {
        var testQuery = {
            "WHERE": {
                "GT": {
                    "courses_pass": 100
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "courses_id",
                    "sumOfavg"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["courses_pass"]
                },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept", "courses_id", "rooms_seats"],
                "APPLY": [
                    { "sumOfavg": {
                            "SUM": "courses_avg"
                        } },
                    {
                        "maxOfpass": {
                            "MAX": "courses_pass"
                        }
                    }
                ]
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.body);
            chai_1.expect(value.body).to.deep.equal({ "render": "TABLE", "result": [{ "courses_dept": "cnps", "courses_id": "574", "sumOfavg": 294.13 }, { "courses_dept": "crwr", "courses_id": "599", "sumOfavg": 196 }, { "courses_dept": "educ", "courses_id": "500", "sumOfavg": 97.5 }, { "courses_dept": "eece", "courses_id": "541", "sumOfavg": 197.5 }, { "courses_dept": "epse", "courses_id": "421", "sumOfavg": 489.72 }, { "courses_dept": "epse", "courses_id": "449", "sumOfavg": 590.89 }, { "courses_dept": "epse", "courses_id": "519", "sumOfavg": 196.9 }, { "courses_dept": "epse", "courses_id": "534", "sumOfavg": 195.19 }, { "courses_dept": "epse", "courses_id": "549", "sumOfavg": 97.69 }, { "courses_dept": "epse", "courses_id": "596", "sumOfavg": 194.18 }, { "courses_dept": "epse", "courses_id": "606", "sumOfavg": 97.67 }, { "courses_dept": "math", "courses_id": "525", "sumOfavg": 194.5 }, { "courses_dept": "math", "courses_id": "527", "sumOfavg": 199.56 }, { "courses_dept": "math", "courses_id": "532", "sumOfavg": 194.96 }, { "courses_dept": "math", "courses_id": "541", "sumOfavg": 194.18 }, { "courses_dept": "nurs", "courses_id": "509", "sumOfavg": 393.84 }, { "courses_dept": "nurs", "courses_id": "578", "sumOfavg": 589.22 }, { "courses_dept": "nurs", "courses_id": "591", "sumOfavg": 194.66 }, { "courses_dept": "spph", "courses_id": "300", "sumOfavg": 197.96 }] });
            done();
        }).catch(function (err) {
            console.log(err);
            console.log(err.code, err.body);
            done();
        });
    });
    it("D3 specs Test", function (done) {
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
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code);
            console.log(value.body);
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("START OF HASHMAP IMPLEMENTATION TESTS", function (done) {
        var testQuery = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code);
            console.log(value.body);
            chai_1.expect(value.body).to.deep.equal({
                "render": "TABLE",
                "result": [{
                        "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs"
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs"
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs"
                    }, {
                        "rooms_furniture": "Classroom-Fixed Tablets"
                    }, {
                        "rooms_furniture": "Classroom-Hybrid Furniture"
                    }, {
                        "rooms_furniture": "Classroom-Learn Lab"
                    }, {
                        "rooms_furniture": "Classroom-Movable Tables & Chairs"
                    }, {
                        "rooms_furniture": "Classroom-Movable Tablets"
                    }, {
                        "rooms_furniture": "Classroom-Moveable Tables & Chairs"
                    }, {
                        "rooms_furniture": "Classroom-Moveable Tablets"
                    }]
            });
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            done();
        });
    });
    it("2 in apply with same name", function (done) {
        var testQuery = {
            "WHERE": {
                "GT": {
                    "courses_avg": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_dept",
                    "avgOfCourse",
                    "sumOfCourse",
                    "countOfCourse",
                    "minOfCourse",
                    "maxOfCourse"
                ],
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_dept"],
                "APPLY": [{
                        "avgOfCourse": {
                            "AVG": "courses_avg"
                        }
                    }, {
                        "sumOfCourse": {
                            "SUM": "courses_avg"
                        }
                    }, {
                        "countOfCourse": {
                            "COUNT": "courses_avg"
                        }
                    }, {
                        "minOfCourse": {
                            "MIN": "courses_avg"
                        }
                    }, {
                        "maxOfCourse": {
                            "MAX": "courses_avg"
                        }
                    }]
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code);
            console.log(value.body);
            chai_1.expect(value.body).to.deep.equal({ "render": "TABLE", "result": [{ "courses_dept": "cnps", "avgOfCourse": 98.07, "sumOfCourse": 294.13, "countOfCourse": 2, "minOfCourse": 97.47, "maxOfCourse": 99.19 }, { "courses_dept": "crwr", "avgOfCourse": 98, "sumOfCourse": 196, "countOfCourse": 1, "minOfCourse": 98, "maxOfCourse": 98 }, { "courses_dept": "educ", "avgOfCourse": 97.5, "sumOfCourse": 97.5, "countOfCourse": 1, "minOfCourse": 97.5, "maxOfCourse": 97.5 }, { "courses_dept": "eece", "avgOfCourse": 98.8, "sumOfCourse": 197.5, "countOfCourse": 1, "minOfCourse": 98.75, "maxOfCourse": 98.75 }, { "courses_dept": "epse", "avgOfCourse": 98.03, "sumOfCourse": 1862.2400000000002, "countOfCourse": 13, "minOfCourse": 97.09, "maxOfCourse": 98.8 }, { "courses_dept": "math", "avgOfCourse": 97.92, "sumOfCourse": 783.2, "countOfCourse": 4, "minOfCourse": 97.09, "maxOfCourse": 99.78 }, { "courses_dept": "nurs", "avgOfCourse": 98.13, "sumOfCourse": 1177.72, "countOfCourse": 6, "minOfCourse": 97.33, "maxOfCourse": 98.71 }, { "courses_dept": "spph", "avgOfCourse": 99, "sumOfCourse": 197.96, "countOfCourse": 1, "minOfCourse": 98.98, "maxOfCourse": 98.98 }] });
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            done();
        });
    });
    it("valid Empty Apply Query", function (done) {
        var testQuery = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code);
            console.log(value.body);
            chai_1.expect(value.body).to.deep.equal({ "render": "TABLE", "result": [{ "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs" }, { "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs" }, { "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs" }, { "rooms_furniture": "Classroom-Fixed Tablets" }, { "rooms_furniture": "Classroom-Hybrid Furniture" }, { "rooms_furniture": "Classroom-Learn Lab" }, { "rooms_furniture": "Classroom-Movable Tables & Chairs" }, { "rooms_furniture": "Classroom-Movable Tablets" }, { "rooms_furniture": "Classroom-Moveable Tables & Chairs" }, { "rooms_furniture": "Classroom-Moveable Tablets" }] });
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            done();
        });
    });
    it("invalid Query with no group one apply", function (done) {
        var testQuery = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture",
                    "num"
                ],
                "ORDER": "rooms_furniture",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": [],
                "APPLY": [{
                        "num": {
                            "COUNT": "rooms_seats"
                        }
                    }]
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code);
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect(err.code).equal(400);
            done();
        });
    });
    it.skip("test Query with more than ONE apply NUMERIC ONLY", function (done) {
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
                        "maxSeats": { "MAX": "rooms_seats" }
                    },
                    {
                        "minSeats": { "MIN": "rooms_seats" }
                    }
                ]
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            console.log(err);
            console.log(err.code, err.body);
            chai_1.expect(err.code).equal(400);
            done();
        });
    });
    it("test Query with GROUP", function (done) {
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
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("test Query B", function (done) {
        var testQuery = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            chai_1.expect(value.body).to.deep.equal({ "render": "TABLE", "result": [{ "rooms_furniture": "Classroom-Fixed Tables/Fixed Chairs" }, { "rooms_furniture": "Classroom-Fixed Tables/Movable Chairs" }, { "rooms_furniture": "Classroom-Fixed Tables/Moveable Chairs" }, { "rooms_furniture": "Classroom-Fixed Tablets" }, { "rooms_furniture": "Classroom-Hybrid Furniture" }, { "rooms_furniture": "Classroom-Learn Lab" }, { "rooms_furniture": "Classroom-Movable Tables & Chairs" }, { "rooms_furniture": "Classroom-Movable Tablets" }, { "rooms_furniture": "Classroom-Moveable Tables & Chairs" }, { "rooms_furniture": "Classroom-Moveable Tablets" }] });
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("group on uuid", function (done) {
        this.timeout(10000);
        var testQuery = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "courses_uuid",
                    "sumOf"
                ],
                "ORDER": "courses_uuid",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_uuid"],
                "APPLY": [{
                        "sumOf": {
                            "SUM": "courses_year"
                        }
                    }]
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect(value.code).to.equal(200);
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("group on instructor, courses_avg, sum courses year", function (done) {
        var testQuery = {
            "WHERE": {
                "GT": { "courses_avg": 98 }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "courses_instructor",
                    "sumOf"
                ],
                "ORDER": { "keys": ["courses_instructor", "sumOf"], "dir": "UP" },
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_instructor"],
                "APPLY": [{
                        "sumOf": {
                            "SUM": "courses_year"
                        }
                    }]
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code);
            console.log(value.body);
            chai_1.expect(value.body).to.deep.equal({ "render": "TABLE", "result": [{ "courses_instructor": "", "sumOf": 22910 }, { "courses_instructor": "brew, nancy", "sumOf": 2011 }, { "courses_instructor": "burrows, marlene;harding, jillian;krist, jennifer;mccuaig, fairleth", "sumOf": 2013 }, { "courses_instructor": "cannon, joanna", "sumOf": 2011 }, { "courses_instructor": "cole, kenneth", "sumOf": 4018 }, { "courses_instructor": "coria, lino", "sumOf": 2009 }, { "courses_instructor": "cox, daniel", "sumOf": 2012 }, { "courses_instructor": "frank, erica", "sumOf": 2015 }, { "courses_instructor": "gomez, jose", "sumOf": 2009 }, { "courses_instructor": "grow, laura", "sumOf": 6038 }, { "courses_instructor": "krist, jennifer", "sumOf": 2015 }] });
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("sum lat and lon", function (done) {
        var testQuery = {
            "WHERE": {
                "GT": {
                    "rooms_seats": 100
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_fullname",
                    "sumOfLat",
                    "sumOfLon",
                    "sumOfSeats"
                ],
                "ORDER": "sumOfSeats",
                "FORM": "TABLE"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_fullname"],
                "APPLY": [{
                        "sumOfLat": {
                            "SUM": "rooms_lat"
                        }
                    },
                    {
                        "sumOfLon": {
                            "SUM": "rooms_lon"
                        }
                    },
                    {
                        "sumOfSeats": {
                            "SUM": "rooms_seats"
                        }
                    }
                ]
            }
        };
        insightFacade.performQuery(testQuery).then(function (value) {
            console.log(value.code);
            console.log(value.body);
            done();
        }).catch(function (err) {
            console.log(err.code, err.body);
            chai_1.expect.fail();
            done();
        });
    });
    it("Courses: test remove valid zip that is added, ResponseCode 204", function (done) {
        insightFacade.removeDataset("courses").then(function (value) {
            console.log(value.code, value.body);
            sanityCheck(value);
            chai_1.expect(value.code).to.equal(204);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("Rooms: test remove valid zip that is added, ResponseCode 204", function (done) {
        insightFacade.removeDataset("rooms").then(function (value) {
            console.log(value.code, value.body);
            sanityCheck(value);
            chai_1.expect(value.code).to.equal(204);
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
            done();
        });
    });
    it("test query after removing", function (done) {
        var simpleQuery = {
            "WHERE": {
                "GT": {
                    "rooms_seats": 97
                }
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_seats"
                ],
                "FORM": "TABLE"
            }
        };
        insightFacade.performQuery(simpleQuery).then(function (value) {
            console.log(value.code, value.body);
            chai_1.expect.fail();
            done();
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect(err.code).to.equal(424);
            done();
        });
    });
});
//# sourceMappingURL=InsightFacadeSpec.js.map