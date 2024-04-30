"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var addEntry_1 = __importDefault(require("../handler/addEntry"));
var app = (0, express_1.default)();
app.use(express_1.default.json());
var router = express_1.default.Router();
router.post("/mood", function (req, res) {
    (0, addEntry_1.default)(req)
        .then(function (response) { return res.send(response).status(200); })
        .catch(function (error) { return res.status(500).send(error.message); });
});
exports.default = router;
//# sourceMappingURL=addEntry.js.map