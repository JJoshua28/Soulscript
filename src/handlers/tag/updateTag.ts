import type { Request } from "express";

import type { Tag, TagUpdates } from "../../types/tags";
import CustomErrors from "../../types/error";

import MongoDBTagService from "../../adapters/mongoDB/tagService";
import UpdateTagUseCase from "../../use cases/tag/updateTag";
import tagModel from "../../services/mongoDB/models/tag";


const handleUpdateTag = async (req: Request): Promise<Tag> => {

    const { id, updates } = req.body;

    if (!id || typeof id !== "string" || id === " ") throw new Error(CustomErrors.INVALID_REQUEST);
    

    if (!updates || !(updates instanceof Object))throw new Error(CustomErrors.INVALID_REQUEST);
    
    const { name, description } = updates;

    if (!name && !description) throw new Error(CustomErrors.INVALID_REQUEST);
    
    if (name && typeof name !== "string" || name === " ") throw new Error(CustomErrors.INVALID_REQUEST);
    
    if (description && typeof description !== "string" || description === " ") {
        throw new Error(CustomErrors.INVALID_REQUEST);
    }

    const tagService = new MongoDBTagService(tagModel);
    const updateTagUseCase = new UpdateTagUseCase(tagService);

    const filteredUpdates: TagUpdates = {};

    if (name) filteredUpdates.name = name;
    
    if (description) filteredUpdates.description = description;

    return await updateTagUseCase.execute(id, filteredUpdates);
}

export default handleUpdateTag;