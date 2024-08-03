import mongoose, { Model } from "mongoose";

import { TagDocument } from "../../services/mongoDB/types/document";
import { NewTag, Tag, TagUpdates } from "../../types/tags";
import CustomErrors from "../../types/error";
import { TagService } from "../../ports/tagService";

import { mapDocumentToTag, mapDocumentsToTags } from "../../mappers/mongoDB/documents";
import { EntryService } from "../../ports/entryService";
import DeleteTagFromAllEntriesUseCase from "../../use cases/entries/deleteTagFromAllEntries";

class MongoDBTagService implements TagService<mongoose.Types.ObjectId> {
    private tagServiceModel: Model<TagDocument>;
    private entryService?: EntryService;
    constructor({tagModel, entryService}: {tagModel: Model<TagDocument>, entryService?: EntryService}) {
        if(entryService) this.entryService = entryService;
        this.tagServiceModel = tagModel;
    }
    async addTag(tag: NewTag): Promise<Tag> {
        try {
            const isTagNameUsed = !!await this.tagServiceModel.exists({name: tag.name});

            if (isTagNameUsed) throw new Error(CustomErrors.INVALID_TAG_EXISTS);
   
            const response = await this.tagServiceModel.create({...tag});

            if(!response) throw new Error();
            const mappedTagEntry = mapDocumentToTag(response);
            return mappedTagEntry;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomErrors.INVALID_TAG_EXISTS) throw new Error(error.message);
                throw new Error(`Something went wrong trying to create this tag.\n Entry: ${JSON.stringify(tag)}\nError: ${error.message }`)
            }
            throw Error(`Something went wrong trying to create this tag.\n Entry: ${JSON.stringify(tag)}\nError: ${error}`)
        }
    }
    async doAllTagsExist(tagIDs: mongoose.Types.ObjectId[]): Promise<boolean> {
        for (const id of tagIDs) {
            const result = !!await this.tagServiceModel.exists({_id: id});
            if (!result) return false;
        }
        return true;
    }
    async getAllTags(): Promise<Tag[] | []> {
        try {
            const tags: TagDocument[] | [] = await this.tagServiceModel.find({});
            if(tags.length < 1) return [];
            return mapDocumentsToTags(tags);
        } catch (error) {
            throw Error(`Something went wrong trying to retrieve all tags.\nError: ${error}`);
        }
    }
    async updateTag(tagId: string, updates: TagUpdates): Promise<Tag> {
        try {
            const isTagPresentWithID = !! await this.tagServiceModel.exists({_id: tagId});
            if (!isTagPresentWithID) throw new Error(CustomErrors.VOID_TAG);
            
            const {name} = updates;
            if (name) {
                const isTagNameUsed = !!await this.tagServiceModel.exists({name});
                if (isTagNameUsed) throw new Error(CustomErrors.INVALID_TAG_EXISTS);
            }
            
            const response = await this.tagServiceModel.findByIdAndUpdate(tagId, updates, {new: true});
            if(!response) throw new Error();

            const mappedTagEntry = mapDocumentToTag(response);
            return mappedTagEntry;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomErrors.VOID_TAG || error.message === CustomErrors.INVALID_TAG_EXISTS) throw new Error(error.message);
                throw new Error(`Something went wrong trying to update this tag.\n Entry: ${JSON.stringify(updates)}\nError: ${error.message }`);
            }
            throw Error("Something went wrong trying to update this tag.\n Entry: ${JSON.stringify(updates)}\nError: ${error}");
        }
        
    }
    async deleteTag(tagId: string): Promise<Tag> {
        try {
            if(!this.entryService) throw new Error(CustomErrors.VOID_ENTRY_SERVICE);
            
            const isTagPresentWithID = !! await this.tagServiceModel.exists({_id: tagId});
            if (!isTagPresentWithID) throw new Error(CustomErrors.INVALID_TAG);

            const response: TagDocument | null = await this.tagServiceModel.findByIdAndDelete(tagId);
            if(!response) throw new Error();

            const removeTagFromAllEntries = new DeleteTagFromAllEntriesUseCase(this.entryService);
            removeTagFromAllEntries.execute(tagId);

            const mappedTagEntry = mapDocumentToTag(response);
            return mappedTagEntry;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomErrors.INVALID_TAG || error.message === CustomErrors.VOID_ENTRY_SERVICE) throw new Error(error.message);
                throw new Error(`Something went wrong trying to remove this tag.\n Entry ID: ${tagId}\nError: ${error.message }`);
            }
            throw Error(`Something went wrong trying to remove this tag.\n Entry ID: ${tagId}\nError: ${error}`);
        }
    }
}

export default MongoDBTagService;