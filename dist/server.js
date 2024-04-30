"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var config_1 = __importDefault(require("./integrations/mongoDB/config"));
var addEntry_1 = __importDefault(require("./routes/addEntry"));
var serverPort = 3001;
var app = (0, express_1.default)();
app.use(express_1.default.json());
(0, config_1.default)();
app.use("/api/add-entry", addEntry_1.default);
app.get("/", function (req, res) {
    res.send("Girl get comfortable!");
});
app.listen(serverPort, function () {
    console.log("Server running on port ".concat(serverPort));
});
//# sourceMappingURL=server.js.map