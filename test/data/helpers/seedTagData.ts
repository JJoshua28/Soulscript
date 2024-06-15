import { Model } from "mongoose";

import { TagDocument } from "../../../src/services/mongoDB/types/document";

export const seedTagData = async (model: Model<TagDocument>, name: string) => {
    const tag = {
        name,
        createdAt: new Date()
    };
    await model.create(tag);
}