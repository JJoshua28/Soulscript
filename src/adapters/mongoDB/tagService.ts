import { Model } from "mongoose";

import { TagDocument } from "../../services/mongoDB/types/document";
import { NewTag, Tag } from "../../types/tags";
import CustomErrors from "../../types/error";
import { TagService } from "../../ports/tagService";

import { mapDocumentToTag } from "../../mappers/mongoDB/documents";

class MongoDBTagService implements TagService {
    private model: Model<TagDocument>;
    constructor(model: Model<TagDocument>) {
        this.model = model;
    }
    async addTag(tag: NewTag): Promise<Tag> {
        try {
            const isTagNameUsed = await this.isTagNameTaken(tag.name);
            if (isTagNameUsed) throw new Error(CustomErrors.INVALID_TAG_NAME);
   
            const response = await this.model.create({...tag});

            if(!response) throw new Error();
            const mappedTagEntry = mapDocumentToTag(response);
            return mappedTagEntry;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomErrors.INVALID_TAG_NAME) throw new Error(error.message);
                throw new Error(`Something went wrong trying to create this tag.\n Entry: ${JSON.stringify(tag)}\nError: ${error.message }`)
            }
            throw Error(`Something went wrong trying to create this tag.\n Entry: ${JSON.stringify(tag)}\nError: ${error}`)
        }
    }
    async isTagNameTaken ( name: string ): Promise<boolean> {
        try {
            return !!await this.model.exists({name});
        } catch (error) {
            throw new Error(`Something went wrong trying to check if this Tag name is taken.\nTag Name: ${name}\nError: ${error}`);
        }
    }
        
}

export default MongoDBTagService;