"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var AuthController_1 = require("../controller/AuthController");
var checkJwt_1 = require("../middlewares/checkJwt");
var router = express_1.Router();
router.post("/login", AuthController_1.default.login);
router.post("/chang-password", [checkJwt_1.checkJwt], AuthController_1.default.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map