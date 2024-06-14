export const tagExpectation = {
    name: expect.any(String),
    description: expect.any(String),
    createdAt: expect.any(Date)
}

export const existingTagExpectation = {
    ...tagExpectation,
    id: expect.any(String),
    createdAt: expect.any(String)
}