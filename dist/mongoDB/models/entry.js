"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moodEntryModel = void 0;
var mongoose_1 = require("mongoose");
var mongdoDB_1 = require("../../schemas/mongdoDB");
/*MongoDB converts the collection name into lowercase and pluralizes it.
The collection name will really be "entries". */
var collectionName = "Entry";
var moodEntrySchema = new mongoose_1.Schema(__assign({}, mongdoDB_1.MoodEntrySchema));
var moodEntryModel = (0, mongoose_1.model)(collectionName, moodEntrySchema);
exports.moodEntryModel = moodEntryModel;
//# sourceMappingURL=entry.js.map