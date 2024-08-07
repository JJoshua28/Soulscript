import { Model, UpdateWriteOpResult } from "mongoose";

import type { Entry, EntryTypes, NewCustomEntry, NewEntry } from "../../types/entries";
import CustomErrors from "../../types/error";
import type { EntryService } from "../../ports/entryService";
import type { EntryDocument, TagDocument } from "../../services/mongoDB/types/document";
import { TagService } from "../../ports/tagService";

import { mapDocumentToEntry, mapDocumentsToEntries } from "../../mappers/mongoDB/documents";
import { getByDateQuery } from "../../services/mongoDB/queries/queries";

class MongoDBEntryService implements EntryService {
    private entryServiceModel: Model<EntryDocument>;
    private entryType?: EntryTypes;
    private tagService?: TagService;

    constructor(
        { entryModel, tagService }: { entryModel: Model<EntryDocument>; tagService?: TagService; },
        entryType?: EntryTypes
    ) {
        this.entryServiceModel = entryModel;
        if (tagService) this.tagService = tagService;
        this.entryType = entryType;
    }

    async addEntry(entry: NewEntry): Promise<Entry> {
        try {
            if(entry.tags.length > 0) {
                if (!this.tagService) throw new Error(CustomErrors.VOID_TAG_SERVICE);
                const doAllTagsExist = await this.tagService.doAllTagsExist(entry.tags);
                if(!doAllTagsExist) throw new Error(CustomErrors.INVALID_TAG); 
            }
            if(entry.type !== this.entryType) throw new Error(CustomErrors.INVALID_ENTRY_TYPE);

            const response = await this.entryServiceModel.create(entry);
            const populatedResponse:EntryDocument = await response.populate<{ tags: TagDocument[] }>("tags");
            
            if(!response.populated("tags")) throw new Error(CustomErrors.INTERNAL_TAG_REF_ERROR);
            
            const mappedMoodEntry = mapDocumentToEntry(populatedResponse);
            return mappedMoodEntry;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomErrors.INVALID_TAG || error.message === CustomErrors.VOID_TAG_SERVICE || error.message === CustomErrors.INVALID_ENTRY_TYPE) throw new Error(error.message);
                throw new Error(`Something went wrong trying to create this Entry.\n Entry: ${entry}\nError: ${error.message}`);
            } else {
                throw new Error(`An unknown error occurred.\n Entry Request: ${entry}`);
            }        }
    }

    async getEntryByDate(date: Date): Promise<Entry[] | []> {
        try {
            if(!this.entryType) throw new Error(CustomErrors.VOID_ENTRY_TYPE);
            const dateQuery = getByDateQuery(date, this.entryType);
    
            const response:EntryDocument[] = await this.entryServiceModel.find(dateQuery).populate<{ tags: TagDocument[] }>("tags");

            for (const entry of response) {
                if (!await entry.populated("tags")) {
                    throw new Error(CustomErrors.INTERNAL_TAG_REF_ERROR);
                }
            }

            const mappedEntries = mapDocumentsToEntries(response);

            return mappedEntries;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomErrors.VOID_ENTRY_TYPE) throw new Error(error.message);
                throw new Error(`Something went wrong trying to retrieve an entry.\n Date query: ${date}\nError: ${error.message}`);
            }
            throw Error(`Something went wrong trying to retrieve and a mood entry.\n Date query: ${date}\nError: ${error}`);
        }
    }

    async updateEntry(id: string, update: NewCustomEntry): Promise<Entry> {
        try {
            const entryToUpdate = await this.entryServiceModel.findById(id);
            if (!entryToUpdate) throw new Error(CustomErrors.INVALID_ENTRY_ID);
            if (entryToUpdate.type != this.entryType) throw new Error(CustomErrors.INVALID_ENTRY_TYPE);
            
            const {tags} = update;
            if(tags && tags?.length > 0) {

                if (!this.tagService) throw new Error(CustomErrors.VOID_TAG_SERVICE);
                
                if(!await this.tagService.doAllTagsExist(tags)) throw new Error(CustomErrors.INVALID_TAG);   
            }

            const options = {
                new: true,
                runValidators: true,
                returnDocument: "after" as const
            };
            const response = await this.entryServiceModel.findByIdAndUpdate(id, update, options).populate<{ tags: TagDocument[] }>("tags").orFail();
            
            if(!response) throw new Error();

            if(!response.populated("tags")) throw new Error(CustomErrors.INTERNAL_TAG_REF_ERROR);

            const mappedMoodEntry = mapDocumentToEntry(response);
            return mappedMoodEntry;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomErrors.INVALID_ENTRY_ID || 
                    error.message === CustomErrors.INVALID_ENTRY_TYPE ||
                    error.message === CustomErrors.INVALID_TAG
                ) throw new Error(error.message);
                throw new Error(`Something went wrong trying to update this Entry.\n Entry ID: ${id}\nError: ${error.message}`);
            } else {
                throw new Error(`An unknown error occurred.\n Entry ID: ${id}`);
            }
        }
    }

    async deleteEntry(id: string): Promise<Entry> {
        try {
            const entryToDelete = await this.entryServiceModel.findById(id);
            if (!entryToDelete) throw new Error(CustomErrors.INVALID_ENTRY_ID);
            if (entryToDelete.type != this.entryType) throw new Error(CustomErrors.INVALID_ENTRY_TYPE);

            const response = await this.entryServiceModel.findByIdAndDelete(id).populate<{ tags: TagDocument[] }>("tags").orFail();
            if (!response) throw new Error();

            if(!response.populated("tags")) throw new Error(CustomErrors.INTERNAL_TAG_REF_ERROR);

            return mapDocumentToEntry(response);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomErrors.INVALID_ENTRY_ID || error.message === CustomErrors.INVALID_ENTRY_TYPE, CustomErrors.INTERNAL_TAG_REF_ERROR) throw new Error(error.message);
                throw new Error(`Something went wrong trying to remove a document with ID: ${id}`);
            } else {
                throw new Error(`An unknown error occurred.\n Entry ID: ${id}`);
            }
        }
    }
    
    async updateEntries(entryField: object, update: object): Promise<boolean> {
        try{
            const response: UpdateWriteOpResult = await this.entryServiceModel.updateMany(entryField, update);

            if(!response || !response.acknowledged) throw new Error();
            return response.acknowledged;
        } catch (error) {
            throw new Error(`An error trying to update Entry field: ${entryField}\nUpdate: ${update}\nError: ${error}`);
        }
    } 
}

export default MongoDBEntryService;
