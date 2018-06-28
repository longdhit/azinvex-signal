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
const mongoose_1 = require("mongoose");
const helpers_1 = require("../lib/helpers");
const SignalSchema = new mongoose_1.Schema({
    typeSignal: { type: Number, required: true },
    openPrice: { type: Number, default: 0, required: true },
    closePrice: { type: Number, default: 0 },
    startAt: { type: Number, default: 0 },
    closeAt: { type: Number, default: 0 },
    stoploss: { type: Number, default: 0 },
    takeprofit: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    ticket: { type: Number, required: true, unique: true },
    trigger: { type: Boolean, default: false },
    symbol: { type: String, trim: true, uppercase: true, required: true }
}, { versionKey: false });
const SignalModel = mongoose_1.model('Signal', SignalSchema);
class Signal extends SignalModel {
    static calProfit(ticket) {
        return __awaiter(this, void 0, void 0, function* () {
            const signal = yield Signal.findOne({ ticket });
            let symbol = signal.symbol;
            let digits = 5;
            let first = symbol;
            let last = symbol;
            first = first.slice(0, 3);
            last = last.slice(3, 6);
            if (first == "JPY" || last == "JPY")
                digits = 3;
            if (first == "XAU" || last == "XAU")
                digits = 3;
            if (first == "XAG" || last == "XAG")
                digits = 3;
            const isBuy = !signal.typeSignal;
            const calprofit = helpers_1.getPips(isBuy, signal.openPrice, signal.closePrice, digits);
            yield Signal.findOneAndUpdate({ ticket }, { profit: calprofit });
            return calprofit;
        });
    }
}
exports.Signal = Signal;
