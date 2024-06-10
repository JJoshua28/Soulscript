import { EntryService } from "../ports/entryService";
import { Entry } from "../types/entries";

class GetEntryByDateUseCase {
    private entryService: EntryService;
    constructor (entryService: EntryService) {
        this.entryService  = entryService;
    }
    async execute (date: Date): Promise<Entry[] | []> {
        return await this.entryService.getEntryByDate(date)
    }
}

export default GetEntryByDateUseCase;