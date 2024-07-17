export interface NewTag {
    name: string,
    description?: string,
    createdAt: Date,
}

export interface Tag extends NewTag {
    id: string
}

export interface TagResponse extends Omit<Tag, "createdAt"> {
    createdAt: string;
}
export interface TagUpdates {
    name?: string,
    description?: string
}
