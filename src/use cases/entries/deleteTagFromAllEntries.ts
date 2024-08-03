import type { EntryService } from "../../ports/entryService";
import { fieldIncludesElementQuery, removeArrayElementQuery } from "../../services/mongoDB/queries/queries";

class DeleteTagFromAllEntriesUseCase {
    private entryService: EntryService;
        constructor (entryService: EntryService,) {
        this.entryService  = entryService;
    }
    async execute (elementToDelete: string): Promise<boolean> {
        const fieldName = "tags";

        const fieldQuery = fieldIncludesElementQuery(fieldName, elementToDelete);
        const fieldUpdate = removeArrayElementQuery(fieldName, elementToDelete);

        return await this.entryService.updateEntries(fieldQuery, fieldUpdate);
    }
}

export default DeleteTagFromAllEntriesUseCase;