import mongoose from "mongoose";

import { MoodEntry } from "../types/entries";
import { EntryService } from "../ports/entryService";

class DeleteMoodEntryUseCase {
    private entryService: EntryService;
        constructor (entryService: EntryService) {
        this.entryService  = entryService;
    }
    async execute (id: mongoose.Types.ObjectId): Promise<MoodEntry| null> {
        return await this.entryService.deleteMoodEntry(id);
    }
}

export default DeleteMoodEntryUseCase;