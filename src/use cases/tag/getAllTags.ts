import type mongoose from "mongoose";
import type { TagService } from "../../ports/tagService";
import type { Tag } from "../../types/tags";

class GetAllTagUseCase {
    private tagService: TagService<mongoose.Types.ObjectId>;
        constructor (tagService: TagService<mongoose.Types.ObjectId>) {
        this.tagService  = tagService;
    }
    async execute (): Promise<Tag[]> {
        return await this.tagService.getAllTags();
    }
}

export default GetAllTagUseCase;