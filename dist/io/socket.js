"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketIo = require("socket.io");
const app_1 = require("../app");
exports.io = socketIo(app_1.server);
