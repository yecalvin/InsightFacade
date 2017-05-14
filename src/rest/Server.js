"use strict";
var restify = require("restify");
var Util_1 = require("../Util");
var InsightFacade_1 = require("../controller/InsightFacade");
var fs = require("fs");
var Server = (function () {
    function Server(port) {
        Util_1.default.info("Server::<init>( " + port + " )");
        this.port = port;
    }
    Server.prototype.stop = function () {
        Util_1.default.info('Server::close()');
        var that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    };
    Server.prototype.start = function () {
        var that = this;
        return new Promise(function (fulfill, reject) {
            try {
                console.log("startingg");
                Util_1.default.info('Server::start() - start');
                that.rest = restify.createServer({
                    name: 'insightUBC'
                });
                that.rest.use(restify.bodyParser({ mapParams: true, mapFiles: true }));
                that.rest.get("/.*", restify.serveStatic({
                    directory: "./src/rest",
                    default: 'view/index.html'
                }));
                that.rest.get('/echo/:msg', Server.echo);
                that.rest.put('/dataset/:id', function (req, res, next) {
                    console.log(req.body);
                    var dataStr = new Buffer(req.params.body).toString('base64');
                    Server.facade.addDataset(req.params.id, dataStr).then(function (insightResponse) {
                        res.json(insightResponse.code, insightResponse.body);
                        return next();
                    }).catch(function (err) {
                        Util_1.default.trace('catch:');
                        console.log(err);
                        res.send(err.code);
                        return next();
                    });
                });
                that.rest.del('/dataset/:id', function (req, res, next) {
                    Server.facade.removeDataset(req.params.id).then(function (insightResponse) {
                        res.json(insightResponse.code, insightResponse.body);
                        return next();
                    }).catch(function (err) {
                        res.send(err.code);
                        return next();
                    });
                });
                that.rest.post('/query', function (req, res, next) {
                    console.warn(req.body);
                    Server.facade.performQuery(req.body).then(function (insightResponse) {
                        console.log("IN POST");
                        res.json(insightResponse.code, insightResponse.body);
                        return next();
                    }).catch(function (err) {
                        res.send(err.code);
                        console.error("ERROR", err.code);
                        console.error(err.message);
                        return next();
                    });
                });
                that.rest.listen(that.port, function () {
                    Util_1.default.info('Server::start() - restify listening: ' + that.rest.url);
                    fulfill(true);
                });
                that.rest.on('error', function (err) {
                    Util_1.default.info('Server::start() - restify ERROR: ' + err);
                    reject(err);
                });
            }
            catch (err) {
                Util_1.default.error('Server::start() - ERROR: ' + err);
                reject(err);
            }
        });
    };
    Server.echo = function (req, res, next) {
        Util_1.default.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));
        try {
            var result = Server.performEcho(req.params.msg);
            Util_1.default.info('Server::echo(..) - responding ' + result.code);
            res.json(result.code, result.body);
        }
        catch (err) {
            Util_1.default.error('Server::echo(..) - responding 400');
            res.json(400, { error: err.message });
        }
        return next();
    };
    Server.performEcho = function (msg) {
        if (typeof msg !== 'undefined' && msg !== null) {
            return { code: 200, body: { message: msg + '...' + msg } };
        }
        else {
            return { code: 400, body: { error: 'Message not provided' } };
        }
    };
    return Server;
}());
Server.facade = new InsightFacade_1.default();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Server;
//# sourceMappingURL=Server.js.map