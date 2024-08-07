import moment from "moment";
import type { Request } from "express";

import CustomErrors from "../../types/error";
import type { NewTag, Tag } from "../../types/tags";
import MongoDBTagService from "../../adapters/mongoDB/tagService";
import tagModel from "../../services/mongoDB/models/tag";
import AddTagUseCase from "../../use cases/tag/addTag";


const handleAddTag = async (req: Request): Promise<Tag> => {

    if(!req.body?.name || typeof req.body?.name != "string" || req?.body?.content === " ") throw new Error(CustomErrors.INVALID_REQUEST);

    if(req.body?.description && typeof req.body?.description != "string" || req?.body?.description === " ") throw new Error(CustomErrors.INVALID_REQUEST);

    const tagService = new MongoDBTagService({tagModel});
    const addTagUseCase = new AddTagUseCase(tagService);

    
    const formatedDate = moment().format("YYYY-MM-DD HH:mm:ss");

    const tag: NewTag = {
        name: req.body.name,
        description: req?.body?.description,
        createdAt: new Date(formatedDate),
    }
    
    return await addTagUseCase.execute(tag);
}

export default handleAddTag;