export interface NewTag {
    name: string,
    description?: string,
    createdAt: Date,
}

export interface Tag extends NewTag {
    id: string
}
export interface TagUpdates {
    name?: string,
    description?: string
}
