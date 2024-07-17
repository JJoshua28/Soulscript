import type mongoose from "mongoose";
import type { TagService } from "../../ports/tagService";
import type { Tag, TagUpdates } from "../../types/tags";

class UpdateTagUseCase {
    private tagService: TagService<mongoose.Types.ObjectId>;
        constructor (tagService: TagService<mongoose.Types.ObjectId>) {
        this.tagService  = tagService;
    }
    async execute (tagID: string, updates: TagUpdates): Promise<Tag> {
        return await this.tagService.updateTag(tagID, updates)
    }
}

export default UpdateTagUseCase;