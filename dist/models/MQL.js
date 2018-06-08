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
const zmq = require("zeromq");
const Signal_1 = require("./Signal");
const uid = require("uid");
const reqSocket = zmq.socket('req');
reqSocket.connect('tcp://127.0.0.1:6666');
function sendOrder(typeSignal, symbol, stoploss, takeprofit) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        reqSocket.on('message', (msgInBuffer) => __awaiter(this, void 0, void 0, function* () {
            const msg = msgInBuffer.toString();
            if (msg.includes('S') && msg.includes(rand)) {
                try {
                    let [y, ticket, openPrice, u] = msg.split('|');
                    const signal = new Signal_1.Signal({ typeSignal, symbol, stoploss, takeprofit, startAt: Date.now(), openPrice: parseFloat(openPrice), ticket: parseInt(ticket) });
                    yield signal.save();
                    return resolve(signal);
                }
                catch (error) {
                    return reject(error.message);
                }
            }
            else if (msg.includes('ERROR') && msg.includes(rand)) {
                const [x, error_code, y] = msg.split('|');
                reject(error_code);
            }
        }));
        const rand = uid(3);
        reqSocket.send(`TRADE|OPEN|${typeSignal}|${symbol.toUpperCase()}|0|${stoploss}|${takeprofit}|${rand}`);
    }));
}
exports.sendOrder = sendOrder;
function closeOrder(ticket) {
    reqSocket.send(`TRADE|CLOSE|${ticket}`);
}
exports.closeOrder = closeOrder;
function modifyOrder(ticket, stoploss, takeprofit) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        reqSocket.on('message', (msgInBuffer) => __awaiter(this, void 0, void 0, function* () {
            const msg = msgInBuffer.toString();
            if (msg.includes('UPDATED') && msg.includes(ticket)) {
                let signal = yield Signal_1.Signal.findOneAndUpdate({ ticket }, { stoploss, takeprofit });
                signal = signal.toObject();
                signal.stoploss = stoploss;
                signal.takeprofit = takeprofit;
                return resolve(signal);
            }
            else if (msg.includes('ERROR') && msg.includes(ticket)) {
                const [x, error_code, y] = msg.split('|');
                if (error_code == 4756)
                    return reject("Invalid Stop");
                reject(error_code);
            }
        }));
        reqSocket.send(`MODIFY|${stoploss}|${takeprofit}|${ticket}`);
    }));
}
exports.modifyOrder = modifyOrder;
