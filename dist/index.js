"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./startDb");
require("./io/socket");
const app_1 = require("./app");
app_1.server.listen(process.env.PORT || 80, () => console.log(`Server started at ${app_1.server.address().port}`));
