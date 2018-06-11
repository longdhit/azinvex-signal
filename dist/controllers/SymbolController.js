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
const Symbol_1 = require("../models/Symbol");
exports.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const { asset } = req.body;
        const newSymbol = new Symbol_1.Symbol({ name: asset });
        yield newSymbol.save();
        res.redirect('/admin');
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
