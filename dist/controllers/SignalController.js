"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Signal_1 = require("../models/Signal");
const Symbol_1 = require("../models/Symbol");
const socket_1 = require("../io/socket");
const MQL_1 = require("../models/MQL");
const jwt_1 = require("../lib/jwt");
const delay = require("delay");
const moment = require('moment');
var lastestSignal;
exports.mt4_check = (req, res) => __awaiter(this, void 0, void 0, function* () {
    if (!lastestSignal)
        return res.send("-1");
    res.send(lastestSignal);
});
exports.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
    let { type, stoploss, takeprofit, symbol } = req.body;
    symbol = symbol.slice(0, 6).toUpperCase();
    let symbols = yield Symbol_1.Symbol.findOneAndUpdate({ name: symbol }, { name: symbol }, { upsert: true });
    MQL_1.sendOrder(type, symbol, stoploss, takeprofit)
        .then((signal) => __awaiter(this, void 0, void 0, function* () {
        socket_1.io.emit("new-signal", signal);
        lastestSignal = `OPEN|${signal.ticket}|${type}|${symbol}|${stoploss}|${takeprofit}`;
        yield delay(2000);
        res.json(signal);
    }))
        .catch(error => res.status(400).send({ message: error }));
});
exports.closeSignal = (req, res) => {
    MQL_1.closeOrder(req.params.ticket);
    res.sendStatus(200);
};
exports.modifySignal = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { ticket } = req.params;
    const { stoploss, takeprofit } = req.body;
    MQL_1.modifyOrder(ticket, stoploss, takeprofit)
        .then((signal) => {
        lastestSignal = `MODIFY|${signal.ticket}|${stoploss}|${takeprofit}`;
        socket_1.io.emit("modify-signal", signal);
        res.json({ sucess: true, signal });
    })
        .catch(error => res.status(400).send({ success: false, message: error }));
});
exports.closeOrderByMT = (req, res) => {
    const correctToken = 'Ln45CD872e#@$@DCAAS@#43';
    const { ticket, ask, bid, token } = req.body;
    if (token !== correctToken)
        return res.status(401).send('GO AWAY!');
    res.send("ok");
    Signal_1.Signal.findOne({ ticket: ticket })
        .then((signal) => __awaiter(this, void 0, void 0, function* () {
        const closePrice = signal.typeSignal ? ask : bid;
        const openPrice = signal.typeSignal ? bid : ask;
        if (signal.startAt + 2000 < Date.now()) {
            let updated = yield Signal_1.Signal.findByIdAndUpdate(signal._id, { closeAt: Date.now(), closePrice });
            updated = updated.toObject();
            updated.closeAt = Date.now();
            updated.closePrice = closePrice;
            updated.profit = parseFloat(yield Signal_1.Signal.calProfit(ticket));
            socket_1.io.emit("result-signal", updated);
            lastestSignal = `CLOSE|${signal.ticket}`;
        }
        else {
            if (signal.openPrice == 0)
                yield Signal_1.Signal.findByIdAndUpdate(signal._id, { openPrice });
        }
    })).catch(error => { return; });
};
exports.trigger = (req, res) => {
    const signal = Signal_1.Signal.findOneAndUpdate({ ticket: req.params.ticket }, { trigger: 1 });
    if (!signal)
        return res.redirect("/admin");
    return res.json(signal);
};
/////// VIEWS
exports.pushSignal = (req, res) => __awaiter(this, void 0, void 0, function* () {
    moment.locale('vi');
    const listSignal = yield Signal_1.Signal.find({ closeAt: { $lte: 1 } }).sort({ ticket: 'desc' });
    const listSymbol = yield Symbol_1.Symbol.find({}, 'name');
    const symbolList = [];
    listSymbol.forEach((e) => {
        symbolList.push(`"${e.name}"`);
    });
    res.render('push_signal.ejs', { listSignal, moment, symbolList });
});
exports.viewActive = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const currentTime = new Date(Date.now());
    const day = currentTime.getDate();
    const month = currentTime.getMonth();
    const year = currentTime.getFullYear();
    const date = new Date(year, month, day);
    const { token } = req.cookies;
    moment.locale('vi');
    const listAcitve = yield Signal_1.Signal.find({ closeAt: { $lte: 1 } }).sort({ ticket: 'desc' });
    const listResult = yield Signal_1.Signal.find({
        closeAt: { $gt: 1 }, startAt: {
            $gte: date.getTime()
        }
    }).sort({ ticket: 'desc' });
    const signalList = listAcitve.concat(listResult);
    res.render('signal_active.ejs', { signalList, moment, token });
});
//LOGIN
exports.viewLogin = (req, res) => __awaiter(this, void 0, void 0, function* () {
    res.render('login.ejs');
});
exports.signIn = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (username === 'cuoicuoiyeu' && password === 'Bzz3bu7x') {
        const token = yield jwt_1.createToken({ message: 'You are fool' });
        return res.cookie('token', token).redirect('/admin');
    }
    res.redirect('/login');
});
exports.viewResult = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const currentTime = new Date(Date.now());
    const day = currentTime.getDate();
    const month = currentTime.getMonth();
    const year = currentTime.getFullYear();
    const date = new Date(year, month, day);
    var preDate = new Date(date);
    preDate.setDate(date.getDate() - 1);
    const { token } = req.cookies;
    const allSignal = yield Signal_1.Signal.find({ closeAt: { $gt: 1 } });
    var won = 0, lost = 0, profit = 0;
    allSignal.forEach((e) => {
        if (e.profit >= 0)
            won++;
        if (e.profit < 0)
            lost++;
        profit += e.profit;
    });
    profit = Math.round(profit * 1000) / 1000;
    const infoUser = {
        won, lost, profit
    };
    const signalList = yield Signal_1.Signal.find({ closeAt: { $gt: 1 }, startAt: {
            $gte: preDate.getTime(),
            $lt: date.getTime()
        } }).sort({ ticket: 'desc' });
    var dailyProfit = 0;
    dailyProfit = signalList.reduce(function (a, b) { return a + +b.profit; }, 0);
    dailyProfit = parseFloat(dailyProfit.toFixed(2));
    res.render('signal_result.ejs', { signalList, infoUser, moment, token, dailyProfit });
});
exports.viewResultByDate = (req, res) => __awaiter(this, void 0, void 0, function* () {
    let { day, month, year } = req.params;
    const date = new Date(year, month - 1, day);
    let nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    const { token } = req.cookies;
    moment.locale('vi');
    const signalList = yield Signal_1.Signal.find({
        closeAt: { $gt: 1 }, startAt: {
            $gte: date.getTime(),
            $lt: nextDay.getTime()
        }
    }).sort({ ticket: 'desc' });
    let day_profit = 0;
    day_profit = signalList.reduce(function (a, b) { return a + +b.profit; }, 0);
    day_profit = parseFloat(day_profit.toFixed(2));
    res.json({ signalList, dailyProfit: day_profit });
});
