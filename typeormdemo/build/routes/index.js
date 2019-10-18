"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_1 = require("./auth");
var user_1 = require("./user");
var routes = express_1.Router();
routes.use("/auth", auth_1.default);
routes.use("/user", user_1.default);
exports.default = routes;
//# sourceMappingURL=index.js.map