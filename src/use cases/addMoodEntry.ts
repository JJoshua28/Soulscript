import { MoodEntry, NewMoodEntry } from "../types/entries";
import { EntryService } from "../ports/entryService";

class AddMoodEntryUseCase {
    private entryService: EntryService;
        constructor (entryService: EntryService) {
        this.entryService  = entryService;
    }
    async execute (entry: NewMoodEntry): Promise<MoodEntry> {
        return await this.entryService.addMoodEntry(entry)
    }
}

export default AddMoodEntryUseCase;