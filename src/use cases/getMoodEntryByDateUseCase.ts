import { EntryService } from "../ports/entryService";
import { MoodEntry } from "../types/entries";

class GetMoodEntryByDateUseCase {
    private entryService: EntryService;
        constructor (entryService: EntryService) {
        this.entryService  = entryService;
    }
    async execute (date: Date): Promise<MoodEntry[] | []> {
        return await this.entryService.getMoodEntryByDate(date)
    }
}

export default GetMoodEntryByDateUseCase;