import { Request } from "express";

import type { Tag } from "../../types/tags";
import CustomErrors from "../../types/error";

import DeleteTagUseCase from "../../use cases/tag/deleteTag";
import MongoDBEntryService from "../../adapters/mongoDB/entryService";
import entryModel from "../../services/mongoDB/models/entry";
import MongoDBTagService from "../../adapters/mongoDB/tagService";
import tagModel from "../../services/mongoDB/models/tag";
import validObjectIDs from "../../helpers/mongoDB/validateObjectId";



const handleDeleteTag = async (req: Request): Promise<Tag> => {
    const {body: {id}} = req as {
        body: { 
        id: string, 
        };
    };
    
    if(!id || !validObjectIDs([id]) ) throw  new Error(CustomErrors.INVALID_REQUEST);


    const entryService = new MongoDBEntryService( { entryModel });
    const tagService = new MongoDBTagService({tagModel: tagModel, entryService});
    const deleteTagUseCase = new DeleteTagUseCase(tagService);
    
    return await deleteTagUseCase.execute(id);
}

export default handleDeleteTag;