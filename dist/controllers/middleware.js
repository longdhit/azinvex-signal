"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("../lib/jwt");
exports.cannotBeAdmin = (req, res, next) => {
    const { token } = req.cookies;
    jwt_1.verifyToken(token)
        .then(() => res.redirect('/'))
        .catch(() => next());
};
exports.mustBeAdmin = (req, res, next) => {
    const { token } = req.cookies;
    jwt_1.verifyToken(token)
        .then(() => next())
        .catch(() => res.redirect('/login'));
};
