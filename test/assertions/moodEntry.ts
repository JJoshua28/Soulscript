import mongoose from "mongoose"

export const moodEntryExpectation = {
    id: expect.any(mongoose.Types.ObjectId),
    type: expect.arrayContaining([expect.any(String)]),
    subject: expect.any(String),
    quote: expect.any(String),
    tags: expect.arrayContaining([expect.any(String)]),
    mood: expect.any(String),
    datetime: expect.anything() 
}

export const moodEntryDocumentExpectation = {
    _id: expect.any(mongoose.Types.ObjectId),
    type: expect.arrayContaining([expect.any(String)]),
    subject: expect.any(String),
    quote: expect.any(String),
    tags: expect.arrayContaining([expect.any(String)]),
    mood: expect.any(String),
    datetime: expect.anything() 
}


export const httpMoodEntryExpectation = {
    id: expect.any(String),
    datetime: expect.any(String),
    mood: expect.any(String),
    quote: expect.any(String),
    subject: expect.any(String),
    tags: expect.arrayContaining([expect.any(String)]),
    type: expect.arrayContaining([expect.any(String)])
}