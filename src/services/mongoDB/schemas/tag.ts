import { Schema } from "mongoose";
import { TagDocument } from "../types/document";


const tagSchemaType = {
    type: { type: String, required: true},
    description: { type: String, required: true},
    createdAt: { type: Date, required: true},
};

const tagSchema = new Schema<TagDocument>(tagSchemaType);

export default tagSchema;