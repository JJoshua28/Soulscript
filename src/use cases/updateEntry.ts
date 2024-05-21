import mongoose from "mongoose";

import { CustomEntry, Entry } from "../types/entries";
import { EntryService } from "../ports/entryService";

class UpdateEntryUseCase {
    private entryService: EntryService;
        constructor (entryService: EntryService) {
        this.entryService  = entryService;
    }
    async execute (id: mongoose.Types.ObjectId, update: CustomEntry): Promise<Entry> {
        return await this.entryService.updateEntry(id, update)
    }
}

export default UpdateEntryUseCase;