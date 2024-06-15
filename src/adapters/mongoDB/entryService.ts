import { Model } from "mongoose";

import type { CustomEntry, Entry, EntryTypes, NewEntry } from "../../types/entries";
import CustomErrors from "../../types/error";
import type { EntryService } from "../../ports/entryService";
import type { EntryDocument } from "../../services/mongoDB/types/document";
import { TagService } from "../../ports/tagService";

import { mapDocumentToEntry, mapDocumentsToEntry } from "../../mappers/mongoDB/documents";
import { getByDateQuery } from "../../services/mongoDB/queries/moodEntry";

class MongoDBEntryService implements EntryService {
    private entryServiceModel: Model<EntryDocument>;
    private entryType: EntryTypes;
    private tagService?: TagService;

    constructor(
        { entryModel, tagService }: { entryModel: Model<EntryDocument>; tagService?: TagService; },
        entryType: EntryTypes
    ) {
        this.entryServiceModel = entryModel;
        if (tagService) this.tagService = tagService;
        this.entryType = entryType;
    }

    async addEntry(entry: NewEntry): Promise<Entry> {
        try {
            if(entry.tags.length > 0) {
                if (!this.tagService) throw new Error(CustomErrors.VOID_TAG_SERVICE);
                if(!await this.tagService.doAllTagsExist(entry.tags)) throw new Error(CustomErrors.INVALID_TAG_NAME);   
            }
            if(entry.type !== this.entryType) throw new Error(CustomErrors.INVALID_ENTRY_TYPE);

            const response = await this.entryServiceModel.create({ ...entry });
            const mappedMoodEntry = mapDocumentToEntry(response);
            return mappedMoodEntry;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomErrors.INVALID_TAG_NAME || error.message === CustomErrors.VOID_TAG_SERVICE || error.message === CustomErrors.INVALID_ENTRY_TYPE) throw new Error(error.message);
                throw new Error(`Something went wrong trying to create this Entry.\n Entry: ${entry}\nError: ${error.message}`);
            } else {
                throw new Error(`An unknown error occurred.\n Entry Request: ${entry}`);
            }        }
    }

    async getEntryByDate(date: Date): Promise<Entry[] | []> {
        try {
            const dateQuery = getByDateQuery(date, this.entryType);
            const response = await this.entryServiceModel.find(dateQuery);
            return mapDocumentsToEntry(response);
        } catch (error) {
            throw Error(`Something went wrong trying to retrieve and a mood entry.\n Date query: ${date}\nError: ${error}`);
        }
    }

    async updateEntry(id: string, update: CustomEntry): Promise<Entry> {
        try {
            const entryToUpdate = await this.entryServiceModel.findById(id);
            if (!entryToUpdate) throw new Error(CustomErrors.INVALID_ENTRY_ID);
            if (entryToUpdate.type != this.entryType) throw new Error(CustomErrors.INVALID_ENTRY_TYPE);

            const options = {
                new: true,
                runValidators: true,
                returnDocument: "after" as const
            };
            const response = await this.entryServiceModel.findByIdAndUpdate(id, update, options);
            if (!response) throw new Error();

            const mappedMoodEntry = mapDocumentToEntry(response);
            return mappedMoodEntry;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomErrors.INVALID_ENTRY_ID || error.message === CustomErrors.INVALID_ENTRY_TYPE) throw new Error(error.message);
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

            const response = await this.entryServiceModel.findByIdAndDelete(id);
            if (!response) throw new Error();

            return mapDocumentToEntry(response);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomErrors.INVALID_ENTRY_ID || error.message === CustomErrors.INVALID_ENTRY_TYPE) throw new Error(error.message);
                throw new Error(`Something went wrong trying to remove a document with ID: ${id}`);
            } else {
                throw new Error(`An unknown error occurred.\n Entry ID: ${id}`);
            }
        }
    }
}

export default MongoDBEntryService;
