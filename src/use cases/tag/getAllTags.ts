import type { TagService } from "../../ports/tagService";
import type { Tag } from "../../types/tags";

class GetAllTagUseCase {
    private tagService: TagService;
        constructor (tagService: TagService) {
        this.tagService  = tagService;
    }
    async execute (): Promise<Tag[]> {
        return await this.tagService.getAllTags();
    }
}

export default GetAllTagUseCase;