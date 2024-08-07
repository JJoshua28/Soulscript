import { NewTag, Tag, TagUpdates } from "../types/tags";

export interface TagService {
    addTag(tag: NewTag): Promise<Tag>;
    doAllTagsExist(tags: string[]): Promise<boolean>;
    getAllTags(): Promise<Tag[]>;
    updateTag(tagId: string, updates: TagUpdates): Promise<Tag>;
    deleteTag(tagId: string): Promise<Tag>;
}