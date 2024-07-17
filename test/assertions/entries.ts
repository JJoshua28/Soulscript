import mongoose from "mongoose"

export const defaultEntryExpectation = {
    id: expect.any(String),
    sharedID: expect.any(String), 
    type: expect.any(String),
    subject: expect.any(String),
    quote: expect.any(String),
    tags: expect.arrayContaining([expect.any(Object)]),
    content: expect.any(String),
    datetime: expect.anything() 
}

export const gratitudeEntryExpectation = {
    ...defaultEntryExpectation,
    content: expect.arrayContaining([expect.any(String)])
}

export const entryDocumentExpectation = {
    _id: expect.any(mongoose.Types.ObjectId),
    sharedID: expect.any(String), 
    type: expect.any(String),
    subject: expect.any(String),
    quote: expect.any(String),
    tags: expect.arrayContaining([expect.any(Object)]),
    content: expect.any(String),
    datetime: expect.anything() 
}

export const gratitudeEntryDocumentExpectation = {
    ...entryDocumentExpectation,
    content: expect.arrayContaining([expect.any(String)])
}

export const httpEntryExpectation = {
    id: expect.any(String),
    sharedID: expect.any(String),  
    datetime: expect.any(String),
    content: expect.any(String),
    quote: expect.any(String),
    subject: expect.any(String),
    tags: expect.arrayContaining([expect.any(Object)]),
    type: expect.any(String)
}

export const httpGratitudeEntryExpectation = {
    ...httpEntryExpectation,
    content: expect.arrayContaining(expect.any(String))

}