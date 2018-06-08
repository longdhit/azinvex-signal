"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
require('mongoose').Promise = global.Promise;
const databaseUri = 'mongodb://azinvex:Bzz3bu7x@ds161164.mlab.com:61164/azsignal';
mongoose_1.connect(databaseUri)
    .catch(() => console.log('Cannot connect database'));
