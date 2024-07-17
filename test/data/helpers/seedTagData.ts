import { Model } from "mongoose";

import type { TagDocument } from "../../../src/services/mongoDB/types/document";
import type { Tag } from "../../../src/types/tags";

import { mapDocumentToTag } from "../../../src/mappers/mongoDB/documents";

export const seedTagData = async (model: Model<TagDocument>, name: string): Promise<Tag> => {
    const tag = {
        name,
        createdAt: new Date()
    };
   const response = await model.create(tag);
   return mapDocumentToTag(response);
}