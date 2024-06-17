import type { TagService } from "../../ports/tagService";
import type { Tag, TagUpdates } from "../../types/tags";

class UpdateTagUseCase {
    private tagService: TagService;
        constructor (tagService: TagService) {
        this.tagService  = tagService;
    }
    async execute (tagID: string, updates: TagUpdates): Promise<Tag> {
        return await this.tagService.updateTag(tagID, updates)
    }
}

export default UpdateTagUseCase;