import type mongoose from "mongoose";
import type { TagService } from "../../ports/tagService";
import type { NewTag, Tag } from "../../types/tags";

class AddTagUseCase {
    private tagService: TagService<mongoose.Types.ObjectId>;
        constructor (tagService: TagService<mongoose.Types.ObjectId>) {
        this.tagService  = tagService;
    }
    async execute (tag: NewTag): Promise<Tag> {
        return await this.tagService.addTag(tag)
    }
}

export default AddTagUseCase;