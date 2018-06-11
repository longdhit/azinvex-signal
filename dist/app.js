"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cookieParser = require("cookie-parser");
const SignalController = require("./controllers/SignalController");
const SymbolController = require("./controllers/SymbolController");
const body_parser_1 = require("body-parser");
const middleware_1 = require("./controllers/middleware");
exports.app = express();
exports.server = require('http').Server(exports.app);
const jsonParser = body_parser_1.json();
const urlEncodeParser = body_parser_1.urlencoded({ extended: false });
exports.app.use(jsonParser);
exports.app.use(urlEncodeParser);
exports.app.use(cookieParser());
exports.app.set('view engine', 'ejs');
exports.app.set('views', './views');
exports.app.use(express.static('./public'));
//Metatrader Route
exports.app.post('/api/signal/close', SignalController.closeOrderByMT);
//Home Route
exports.app.get('/', SignalController.viewActive);
exports.app.get('/admin', middleware_1.mustBeAdmin, SignalController.pushSignal);
exports.app.post('/admin', middleware_1.mustBeAdmin, SignalController.create);
exports.app.post('/symbol', middleware_1.mustBeAdmin, SymbolController.create);
exports.app.patch('/admin/:ticket', middleware_1.mustBeAdmin, SignalController.closeSignal);
exports.app.put('/admin/:ticket', middleware_1.mustBeAdmin, SignalController.modifySignal);
exports.app.get('/result', SignalController.viewResult);
exports.app.get('/result/:day/:month/:year', SignalController.viewResultByDate);
exports.app.get('/login', middleware_1.cannotBeAdmin, SignalController.viewLogin);
exports.app.post('/login', middleware_1.cannotBeAdmin, SignalController.signIn);
exports.app.get('/mt4', SignalController.mt4_check);
exports.app.get('/ping', function (req, res) {
    res.sendStatus(200);
});
exports.app.get('/*', function (req, res) {
    res.sendStatus(404);
});
exports.default = exports.app;
