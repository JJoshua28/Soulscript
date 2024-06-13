import mongoose from "mongoose";

import { TagDocument } from "../../../src/services/mongoDB/types/document";
import { NewTag, Tag } from "../../../src/types/tags";

export const createTagDocument = (tag: NewTag | Tag): TagDocument => {
    return {
        _id: new mongoose.Types.ObjectId(),
        name: tag.name,
        description: tag.description,
        createdAt: tag.createdAt
    } as TagDocument;
}