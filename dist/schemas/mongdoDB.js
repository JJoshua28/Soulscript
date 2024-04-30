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
exports.MultipleEntrySchema = exports.GratitudeEntrySchema = exports.JournalEntrySchema = exports.MoodEntrySchema = void 0;
var EntrySchema = {
    type: { type: [String], required: true },
    tags: { type: [String] },
    subject: { type: String },
    quote: { type: String },
    datetime: { type: Date, required: true },
};
var MoodEntrySchema = __assign(__assign({}, EntrySchema), { mood: { type: String, required: true } });
exports.MoodEntrySchema = MoodEntrySchema;
var JournalEntrySchema = __assign(__assign({}, EntrySchema), { journal: { type: String, required: true } });
exports.JournalEntrySchema = JournalEntrySchema;
var GratitudeEntrySchema = __assign(__assign({}, EntrySchema), { gratitude: { type: [String], required: true } });
exports.GratitudeEntrySchema = GratitudeEntrySchema;
var MultipleEntrySchema = __assign(__assign({}, EntrySchema), { gratitude: { type: [String] }, journal: { type: String }, mood: { type: String } });
exports.MultipleEntrySchema = MultipleEntrySchema;
//# sourceMappingURL=mongdoDB.js.map