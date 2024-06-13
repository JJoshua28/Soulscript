import { NewTag, Tag } from "../types/tags";

export interface TagService {
    addTag(tag: NewTag): Promise<Tag>;
}