import mongoose from "mongoose";

import { CustomMoodEntry, MoodEntry } from "../types/entries";
import { EntryService } from "../ports/entryService";

class UpdateMoodEntryUseCase {
    private entryService: EntryService;
        constructor (entryService: EntryService) {
        this.entryService  = entryService;
    }
    async execute (id: mongoose.Types.ObjectId, update: CustomMoodEntry): Promise<MoodEntry> {
        return await this.entryService.updateMoodEntry(id, update)
    }
}

export default UpdateMoodEntryUseCase;