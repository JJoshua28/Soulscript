import type mongoose from "mongoose";
import type { TagService } from "../../ports/tagService";
import type { Tag } from "../../types/tags";

class DeleteTagUseCase {
    private tagService: TagService;
        constructor (tagService: TagService) {
        this.tagService  = tagService;
    }
    async execute (id: string): Promise<Tag> {
        return await this.tagService.deleteTag(id);
    }
}

export default DeleteTagUseCase;