import { NewTag, Tag, TagUpdates } from "../types/tags";

export interface TagService <T> {
    addTag(tag: NewTag): Promise<Tag>;
    doAllTagsExist(tags: T[]): Promise<boolean>;
    getAllTags(): Promise<Tag[]>;
    updateTag(tagId: string, updates: TagUpdates): Promise<Tag>;
}