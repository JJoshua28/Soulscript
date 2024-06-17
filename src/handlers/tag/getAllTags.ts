import type { Tag } from "../../types/tags";

import MongoDBTagService from "../../adapters/mongoDB/tagService";
import tagModel from "../../services/mongoDB/models/tag";
import GetAllTagUseCase from "../../use cases/tag/getAllTags";

const handleGetAllTags = async (): Promise<Tag[]> => {

    const tagService = new MongoDBTagService(tagModel);
    const addTagUseCase = new GetAllTagUseCase(tagService);
    
    return await addTagUseCase.execute();
}

export default handleGetAllTags;