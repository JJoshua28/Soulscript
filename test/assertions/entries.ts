import mongoose from "mongoose"

export const entryExpectation = {
    id: expect.any(mongoose.Types.ObjectId),
    sharedID: expect.any(mongoose.Types.ObjectId) || undefined, 
    type: expect.any(String),
    subject: expect.any(String),
    quote: expect.any(String),
    tags: expect.arrayContaining([expect.any(String)]),
    content: expect.any(String) || expect.arrayContaining([expect.any(String)]),
    datetime: expect.anything() 
}

export const entryDocumentExpectation = {
    _id: expect.any(mongoose.Types.ObjectId),
    sharedID: expect.any(mongoose.Types.ObjectId) || undefined, 
    type: expect.any(String),
    subject: expect.any(String),
    quote: expect.any(String),
    tags: expect.arrayContaining([expect.any(String)]),
    content: expect.any(String) || expect.arrayContaining([expect.any(String)]),
    datetime: expect.anything() 
}


export const httpEntryExpectation = {
    id: expect.any(String),
    sharedID: expect.any(String) || undefined, 
    datetime: expect.any(String),
    content: expect.any(String) || expect.arrayContaining([expect.any(String)]),
    quote: expect.any(String),
    subject: expect.any(String),
    tags: expect.arrayContaining([expect.any(String)]),
    type: expect.any(String)
}