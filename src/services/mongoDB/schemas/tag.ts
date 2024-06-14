import { Schema } from "mongoose";
import { TagDocument } from "../types/document";


const tagSchemaType = {
    name: { type: String, required: true},
    description: { type: String},
    createdAt: { type: Date, required: true},
};

const tagSchema = new Schema<TagDocument>(tagSchemaType);

export default tagSchema;