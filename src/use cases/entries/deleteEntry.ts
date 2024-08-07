import type { Entry } from "../../types/entries";
import type { EntryService } from "../../ports/entryService";

class DeleteEntryUseCase {
    private entryService: EntryService;
        constructor (entryService: EntryService) {
        this.entryService  = entryService;
    }
    async execute (id: string): Promise<Entry> {
        return await this.entryService.deleteEntry(id);
    }
}

export default DeleteEntryUseCase;