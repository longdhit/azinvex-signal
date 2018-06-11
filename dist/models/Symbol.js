"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SymbolSchema = new mongoose_1.Schema({
    name: { type: String, required: true, uppercase: true, unique: true }
}, { versionKey: false });
const SymbolModel = mongoose_1.model('Symbol', SymbolSchema);
class Symbol extends SymbolModel {
}
exports.Symbol = Symbol;
