import { Entry, NewCustomEntry } from "../../types/entries";
import { EntryService } from "../../ports/entryService";

class UpdateEntryUseCase {
    private entryService: EntryService;
        constructor (entryService: EntryService) {
        this.entryService  = entryService;
    }
    async execute (id: string, update: NewCustomEntry): Promise<Entry> {
        return await this.entryService.updateEntry(id, update)
    }
}

export default UpdateEntryUseCase;