import { Schema } from "mongoose";

import { EntryDocument } from "../types/document";
import { tagCollectionName } from "../models/tag";

const entrySchemaTypes = {
    type: { type: String, required: true},
    sharedID: { type: String, default: null},
    tags: [{ type: Schema.Types.ObjectId, ref: tagCollectionName, required: true }],
    subject: {type: String,  default: null},
    quote: { type: String,  default: null},
    content: { 
        type: Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function(v: unknown) {
                return typeof v === "string" || (Array.isArray(v) && v.every(item => typeof item === "string"));
            },
            message: (props: {value: unknown} & unknown) => `${props.value} is not a valid content type! Content should be a string or an array of strings.`
        }
    },
    datetime: { type: Date, required: true},
};

const entrySchema = new Schema<EntryDocument>(entrySchemaTypes);


export default entrySchema;