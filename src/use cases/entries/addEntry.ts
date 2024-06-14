import { EntryService } from "../../ports/entryService";
import { Entry, NewEntry } from "../../types/entries";

class AddEntryUseCase {
    private entryService: EntryService;
        constructor (entryService: EntryService) {
        this.entryService  = entryService;
    }
    async execute (entry: NewEntry): Promise<Entry> {
        return await this.entryService.addEntry(entry)
    }
}

export default AddEntryUseCase;