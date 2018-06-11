"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./startDb");
require("./io/socket");
const app_1 = require("./app");
process.setMaxListeners(0);
app_1.server.listen(process.env.PORT || 3000, () => console.log(`Server started at ${app_1.server.address().port}`));
