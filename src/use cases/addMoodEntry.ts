import { EntryService } from "../ports/entryService";
import { MoodEntry } from "../types/entries";

class AddMoodEntryUseCase {
    private entryService: EntryService;
    constructor (entryService: EntryService) {
        this.entryService  = entryService;
    }
    async execute (entry: MoodEntry): Promise<MoodEntry> {
        return await this.entryService.addMoodEntry(entry)
    }
}

export default AddMoodEntryUseCase;