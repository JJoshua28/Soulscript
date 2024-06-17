import { NewTag, Tag } from "../types/tags";

export interface TagService {
    addTag(tag: NewTag): Promise<Tag>;
    doAllTagsExist(tags: string[]): Promise<boolean>;
    getAllTags(): Promise<Tag[]>;
}