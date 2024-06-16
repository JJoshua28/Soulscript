import { Model } from "mongoose";

import { TagDocument } from "../../services/mongoDB/types/document";
import { NewTag, Tag } from "../../types/tags";
import CustomErrors from "../../types/error";
import { TagService } from "../../ports/tagService";

import { mapDocumentToTag, mapDocumentsToTags } from "../../mappers/mongoDB/documents";

class MongoDBTagService implements TagService {
    private model: Model<TagDocument>;
    constructor(model: Model<TagDocument>) {
        this.model = model;
    }
    async addTag(tag: NewTag): Promise<Tag> {
        try {
            const isTagNameUsed = !!await this.model.exists({name: tag.name});

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
    async doAllTagsExist(tagNames: string[]): Promise<boolean> {
        for (const name of tagNames) {
            const result = !!await this.model.exists({name});
            if (!result) return false;
        }
        return true;
    }
    async getAllTags(): Promise<Tag[] | []> {
        try {
            const tags: TagDocument[] | [] = await this.model.find({});
            if(tags.length < 1) return [];
            return mapDocumentsToTags(tags);
        } catch (error) {
            throw Error(`Something went wrong trying to retrieve all tags.\nError: ${error}`);
        }
    }
        
}

export default MongoDBTagService;