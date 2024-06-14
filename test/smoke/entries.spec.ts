import moment from "moment";
import request from "supertest"
import mongoose from "mongoose";
import waitForExpect from "wait-for-expect";

import { Entry, EntryTypes, NewEntry, NewEntryRequest } from "../../src/types/entries";
import { HttpErrorCode } from "../../src/types/error";

import app from "../../src/config/server";
import mongooseMemoryDB from "../services/mongoDB/config";
import { defaultGratitudeEntry } from "../data/gratitudeEntry";
import { createNewEntry } from "../data/helpers/customEntry";
import { seedGratitudeEntryTestData } from "../data/helpers/addTestEntries";
import { defaultMoodEntry } from "../data/moodEntry";
import { httpEntryExpectation } from "../assertions/entries";
import { defaultJournalEntry } from "../data/journalEntry";
import entryModel from "../../src/services/mongoDB/models/entry";

describe("Entry smoke tests", () => {
    describe("Mood", () => {
        beforeAll ( async () => await mongooseMemoryDB.setupTestEnvironment() );
        let moodEntry: Entry;
        describe("POST /api/entries/mood/add", () => {
            const url = "/api/entries/mood/add"
            describe("Positive Tests", () => {
                it("should add a mood entry", async () => {
                    const entry: NewEntry = createNewEntry(defaultMoodEntry);
                    const response = await request(app)
                        .post(url)
                        .send(entry)
                        .expect(200);
        
                    expect(response.body).toEqual(expect.objectContaining(httpEntryExpectation));
                    moodEntry = response.body;
                });
            });
            describe("Negative Tests", () => {
                it.each`
                    requestData
                    ${{datetime: "test", content: "happy"}}
                    ${{content: ""}}
                `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                    const response = await request(app)
                        .post(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
            })
        });
        describe("GET /api/entries/mood/get-entry-by-date", () => {
            const url = "/api/entries/mood/get-entry-by-date"
            describe("Positive Tests", () => {
                it("should retrieve a mood entry with today's date", async () => {
                    const date = (new Date(moment().startOf("day").toISOString())).toISOString()
                    const response = await request(app)
                    .get(url)
                    .send({
                        datetime: date
                    })
                    .expect(200)
        
                    expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining(httpEntryExpectation)]));
                    expect(response.body).toEqual(expect.arrayContaining([moodEntry]));
                });
                it("should return an empty array if no entries exist with that date", async () => {
                    const date = (new Date("2020")).toISOString();
                    const response = await request(app)
                    .get(url)
                    .send({
                        datetime: date
                    })
                    .expect(204);
        
                    expect(response.body).toEqual(expect.arrayContaining([]));
                })
            });
            describe("Negative Tests", () => {
                it.each`
                    requestData
                    ${""}
                    ${{ datetime: "" }}
                    ${{ datetime: moment().add(1, "week").toISOString() }}
                `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                    const response = await request(app)
                        .get(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
            })
    
        });
        describe("PUT api/entries/mood/update", () => {
            const url = "/api/entries/mood/update";
            describe("Positive Tests", () => {
                it(`should update the mood entry with by ID`, async () => {
                const {id} = moodEntry
             
                const tags = ["life, philosophy"];
                const content = "unsure" 
                const response  = await request(app)
                .put(url)
                .send({id, update: {
                    tags,
                    content
                }})
                .expect(200);
    
                expect(response.body.id).toEqual(id);
                expect(response.body.tags).toEqual(tags);
                expect(response.body.content).toEqual(content);
                expect(response.body).toEqual(expect.objectContaining(httpEntryExpectation));
                });
            });
            describe("Negative Tests", () => {
                it.each`
                    requestData
                    ${{ id: new mongoose.Types.ObjectId() }}
                    ${{ }}
                    ${{ update: {} }}
                    ${{ update: {}, id: new mongoose.Types.ObjectId() }}
                    ${{ update: "" }}
                    ${{ update: "", id: new mongoose.Types.ObjectId() }}
                    ${{ update: { content: ["I'm grateful to test my code!"]}, id: moodEntry?.id }}
                    ${{ update: { datetime: "Invalid date"}, id: moodEntry?.id }}
                `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                    const response = await request(app)
                        .put(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
                it("should throw 404 when attempting a valid update for an ID that does not exist", async () => {
                    const updateRequest = {
                        id: new mongoose.Types.ObjectId(),
                        update: {
                            content: "happy"
                        }
                    }
                    const response = await request(app)
                        .put(url)
                        .send(updateRequest)
                        .expect(HttpErrorCode.NOT_FOUND);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                })
            })
    
        }); 
        describe("DEL /api/entries/mood/remove", () => {
            const url = "/api/entries/mood/remove";
            describe("Positive Tests", () => {
                it("should remove the mood entry by id", async () => {
                    const {id} = moodEntry;
        
                    const response = await request(app)
                    .del(url)
                    .send({id})
                    .expect(200);
        
                    expect(response.body.id).toEqual(id);
                    expect(response.body.datetime).toEqual(moodEntry.datetime);
        
                    expect(response.body).toEqual(expect.objectContaining(httpEntryExpectation));
        
                    await waitForExpect(async () => {
                        await request(app)
                        .get("/api/entries/mood/get-entry-by-date")
                        .send({datetime: moodEntry.datetime})
                        .expect(204)
                    });
        
        
        
                });
            });
            describe("Negative Tests", () => {
                it("should throw 404 when attempting a valid delete an entry with an ID that does not exist", async () => {
                    const deleteRequest = {
                        id: new mongoose.Types.ObjectId(),
                    };
                    const response = await request(app)
                        .del(url)
                        .send(deleteRequest)
                        .expect(HttpErrorCode.NOT_FOUND);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
            })
        });
        afterAll(async () => await mongooseMemoryDB.tearDownTestEnvironment() );
    })
    describe("Gratitude", () => {
        beforeAll ( async () => {
            await mongooseMemoryDB.setupTestEnvironment();
            await seedGratitudeEntryTestData(entryModel);
        });
        let gratitudeEntry: Entry; 
        describe("POST /api/entries/gratitude/add", () => {
            const url = "/api/entries/gratitude/add"
            describe("Positive Tests", () => {
                it("should add a basic gratitude entry ", async () => {
                    const entry: NewEntryRequest = {
                        content: ["grateful to test my code", "grateful for smoke tests"]
                    }
                    const response = await request(app)
                        .post(url)
                        .send(entry)
                        .expect(200);
                    
                    expect(response.body).toHaveProperty("datetime", expect.any(String));
                    expect(response.body.quote).toEqual(null);
                    expect(response.body.subject).toEqual(null);
                    expect(response.body.sharedID).toEqual(null);
                    expect(response.body.tags).toEqual(expect.arrayContaining([]));
                    expect(response.body.id).toEqual(expect.any(String));
                    expect(response.body.type).toEqual(EntryTypes.GRATITUDE);
    
                    gratitudeEntry = response.body;
                });
                it("should add a complete gratitude entry", async () => {
                    const {datetime, type, ...entry} = createNewEntry(defaultGratitudeEntry);
                    const response = await request(app)
                        .post(url)
                        .send(entry)
                        .expect(200);
                    
                    expect(response.body).toHaveProperty("datetime", expect.any(String));
                    expect(response.body.quote).toEqual(expect.any(String));
                    expect(response.body.subject).toEqual(expect.any(String));
                    expect(response.body.sharedID).toEqual(expect.any(String));
                    expect(response.body.tags).toEqual(expect.arrayContaining([expect.any(String)]));
                    expect(response.body.id).toEqual(expect.any(String));
                    expect(response.body.type).toEqual(EntryTypes.GRATITUDE);
                    
                });
            });
            describe("Negative Tests", () => {
                it.each`
                    requestData
                    ${{datetime: "test", content: "happy"}}
                    ${{content: ""}}
                    ${{content: []}}
                `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                    const response = await request(app)
                        .post(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
            })
        });
        describe("GET /api/entries/gratitude/get-entry-by-date", () => {
            const url = "/api/entries/gratitude/get-entry-by-date"
            describe("Positive Tests", () => {
                it("should retrieve a gratitude entry with today's date", async () => {
                    const response = await request(app)
                    .get(url)
                    .send({
                        datetime: new Date().toISOString()
                    })
                    .expect(200)
                    expect(response.body).toEqual(expect.arrayContaining([
                        expect.objectContaining({
                            datetime: expect.any(String),
                            id: expect.any(String),
                            type: EntryTypes.GRATITUDE,
                            content: expect.arrayContaining([expect.any(String)]),
                        }),
                    ]));
                    expect(response.body).toEqual(expect.arrayContaining([gratitudeEntry]));
    
                });
                it("should return an empty array if no entries exist with that date", async () => {
                    const date = (new Date("2000")).toISOString();
                    const response = await request(app)
                    .get(url)
                    .send({
                        datetime: date
                    })
                    .expect(204);
        
                    expect(response.body).toEqual(expect.arrayContaining([]));
                })
            });
            describe("Negative Tests", () => {
                it.each`
                    requestData
                    ${""}
                    ${{ datetime: "" }}
                    ${{ datetime: moment().add(1, "week").toISOString() }}
                `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                    const response = await request(app)
                        .get(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
            })
    
        });
        describe("PUT api/entries/gratitude/update", () => {
            const url = "/api/entries/gratitude/update";
            describe("Positive Tests", () => {
                it(`should update a gratitude entry with by ID`, async () => {
                    const {id} = gratitudeEntry
                
                    const tags = ["life, philosophy"];
                    const content = ["I'm grateful because I see ghosts!", "I'm grateful to test my code!"]; 
                    const sharedID = new mongoose.Types.ObjectId();
                    const response  = await request(app)
                    .put(url)
                    .send({id, update: {
                        tags,
                        content,
                        sharedID
                    }})
                    .expect(200);
    
                    expect(response.body.id).toEqual(id);
                    expect(response.body.tags).toEqual(tags);
                    expect(response.body.content).toEqual(content);
                    expect(response.body).toHaveProperty("datetime", expect.any(String));
                    expect(response.body.quote).toEqual(null);
                    expect(response.body.subject).toEqual(null);
                    expect(response.body.sharedID).toEqual(expect.any(String));
                    expect(response.body.type).toEqual(EntryTypes.GRATITUDE);            
                });
            });
            describe("Negative Tests", () => {
                it.each`
                    requestData
                    ${{ id: new mongoose.Types.ObjectId() }}
                    ${{ }}
                    ${{ update: {} }}
                    ${{ update: {}, id: new mongoose.Types.ObjectId() }}
                    ${{ update: "" }}
                    ${{ update: "", id: new mongoose.Types.ObjectId() }}
                    ${{ update: { datetime: "Invalid date"}, id: gratitudeEntry?.id }}
                    ${{ update: { content: "Invalid date"}, id: gratitudeEntry?.id }}
                    ${{ update: { content: []}, id: gratitudeEntry?.id }}
                    ${{ update: { content: {}}, id: gratitudeEntry?.id }}
                `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                    const response = await request(app)
                        .put(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
                it("should throw 404 when attempting a valid update for an ID that does not exist", async () => {
                    const updateRequest = {
                        id: new mongoose.Types.ObjectId(),
                        update: {
                                content: ["I'm grateful to test my code!"],
                        }
                    };
                    const response = await request(app)
                        .put(url)
                        .send(updateRequest)
                        .expect(HttpErrorCode.NOT_FOUND);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                })
            })
        });
        describe("DEL /api/entries/gratitude/remove", () => {
            const url = "/api/entries/gratitude/remove";
            describe("Positive Tests", () => {
                it("should remove the gratitude entry by id", async () => {
        
                    const response = await request(app)
                    .del(url)
                    .send({id: gratitudeEntry.id})
                    .expect(200);
        
                    expect(response.body.id).toEqual(gratitudeEntry.id);
                    expect(response.body.tags).not.toEqual(gratitudeEntry.tags);
                    expect(response.body.content).not.toEqual(gratitudeEntry.content);
                    expect(response.body.sharedID).not.toEqual(gratitudeEntry.sharedID);
                        
                    expect(response.body).toHaveProperty("datetime", expect.any(String));
                    expect(response.body).toHaveProperty("content", expect.arrayContaining([expect.any(String)]));
                    expect(response.body).toHaveProperty("tags", expect.arrayContaining([expect.any(String)]));
                    expect(response.body).toHaveProperty("sharedID", expect.any(String));
                    expect(response.body).toHaveProperty("id", expect.any(String));
                    
                   async () => await setTimeout(async() =>{
                        await waitForExpect(async () => {
                            await request(app)
                            .get("/api/entries/gratitude/get-entry-by-date")
                            .send({datetime: gratitudeEntry.datetime})
                            .expect(204)
                        });
    
                    },2000);
        
        
        
                });
            });
            describe("Negative Tests", () => {
                it("should throw 404 when attempting a valid delete an entry with an ID that does not exist", async () => {
                    const deleteRequest = {
                        id: new mongoose.Types.ObjectId(),
                    };
                    const response = await request(app)
                        .del(url)
                        .send(deleteRequest)
                        .expect(HttpErrorCode.NOT_FOUND);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
            })
        });
        afterAll(async () => await mongooseMemoryDB.tearDownTestEnvironment() );
    });
    describe("Journal", () => {
        beforeAll ( async () => await mongooseMemoryDB.setupTestEnvironment() );
        let journalEntry: Entry;
        
        describe("POST /api/entries/journal/add", () => {
            const url = "/api/entries/journal/add"
            describe("Positive Tests", () => {
                it("should add a jounral entry", async () => {
                    const {content } = defaultJournalEntry;
                    const response = await request(app)
                        .post(url)
                        .send({content})
                        .expect(200);
        
                        expect(response.body).toEqual(expect.objectContaining({
                            id: expect.any(String),
                            sharedID: null,
                            datetime: expect.any(String),
                            content: expect.any(String),
                            quote: null,
                            subject: null,
                            tags: expect.any(Array),
                            type: "journal",
                        }));
                        
                    journalEntry = response.body;
                });
            });
            describe("Negative Tests", () => {
                it.each`
                    requestData
                    ${{datetime: "test", content: "happy"}}
                    ${{content: ""}}
                `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                    const response = await request(app)
                        .post(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
            })
        });
        
        describe("GET /api/entries/journal/get-entry-by-date", () => {
            const url = "/api/entries/journal/get-entry-by-date"
            describe("Positive Tests", () => {
                it("should retrieve a journal entry with today's date", async () => {
                    const date = (new Date()).toISOString()
                    const response = await request(app)
                    .get(url)
                    .send({
                        datetime: date
                    })
                    .expect(200)
                    
                    expect(response.body).toEqual(expect.arrayContaining([expect.any(Object)]));
                    expect(response.body).toEqual(expect.arrayContaining([journalEntry]));
                    
                });
                it("should return an empty array if no entries exist with that date", async () => {
                    const date = (new Date("2020")).toISOString();
                    const response = await request(app)
                    .get(url)
                    .send({
                        datetime: date
                    })
                    .expect(204);
        
                    expect(response.body).toEqual(expect.arrayContaining([]));
                })
            });
            describe("Negative Tests", () => {
                it.each`
                    requestData
                    ${""}
                    ${{ datetime: "" }}
                    ${{ datetime: moment().add(1, "week").toISOString() }}
                `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                    const response = await request(app)
                        .get(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
            })
    
        });
        
        describe("PUT /api/entries/journal/update", () => {
            const url = "/api/entries/journal/update";
            describe("Positive Tests", () => {
                it(`should update the journal entry with by ID`, async () => {
                    const {id} = journalEntry
                
                    const tags = ["life, philosophy"];
                    const quote = "high on life!"
                    const subject = "testing testing testing";
                    const response  = await request(app)
                    .put(url)
                    .send({id, update: {
                        tags,
                        quote,
                        subject
                    }})
                    .expect(200);
        
                    expect(response.body.id).toEqual(id);
                    expect(response.body.tags).toEqual(tags);
                    expect(response.body.quote).toEqual(quote);
                    
                    expect(response.body).toHaveProperty("datetime", expect.any(String));
                    expect(response.body).toHaveProperty("content", expect.any(String));
                    expect(response.body).toHaveProperty("subject", expect.any(String));
                    expect(response.body).toHaveProperty("tags", expect.arrayContaining([expect.any(String)]));
                    expect(response.body).toHaveProperty("sharedID", null);
                    expect(response.body).toHaveProperty("id", expect.any(String));
                });
            });
            describe("Negative Tests", () => {
                it.each`
                    requestData
                    ${{ id: new mongoose.Types.ObjectId() }}
                    ${{ }}
                    ${{ update: {} }}
                    ${{ update: { type: EntryTypes.MOOD} }}
                    ${{ update: {}, id: new mongoose.Types.ObjectId() }}
                    ${{ update: "" }}
                    ${{ update: "", id: new mongoose.Types.ObjectId() }}
                    ${{ update: { content: ["I'm grateful to test my code!"]}, id: journalEntry?.id }}
                    ${{ update: { datetime: "Invalid date"}, id: journalEntry?.id }}
                `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                    const response = await request(app)
                        .put(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
                it("should throw 404 when attempting a valid update for an ID that does not exist", async () => {
                    const updateRequest = {
                        id: new mongoose.Types.ObjectId(),
                        update: {
                            content: "happy"
                        }
                    };
                    const response = await request(app)
                        .put(url)
                        .send(updateRequest)
                        .expect(HttpErrorCode.NOT_FOUND);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                })
            })
    
        });
        describe("DEL /api/entries/journal/remove", () => {
            const url = "/api/entries/journal/remove";
            describe("Positive Tests", () => {
                it("should remove the journal entry by id", async () => {
                    const {id} = journalEntry;
        
                    const response = await request(app)
                    .del(url)
                    .send({id})
                    .expect(200);
        
                    expect(response.body.id).toEqual(id);
                    expect(response.body.datetime).toEqual(journalEntry.datetime);
        
                    
                    expect(response.body).toHaveProperty("datetime", expect.any(String));
                    expect(response.body.quote).toEqual(expect.any(String));
                    expect(response.body.subject).toEqual(expect.any(String));
                    expect(response.body.sharedID).toEqual(null);
                    expect(response.body.tags).toEqual(expect.arrayContaining([expect.any(String)]));
                    expect(response.body.id).toEqual(expect.any(String));
                    expect(response.body.type).toEqual(EntryTypes.JOURNAL);
        
                    await waitForExpect(async () => {
                        await request(app)
                        .get("/api/entries/journal/get-entry-by-date")
                        .send({datetime: journalEntry.datetime})
                        .expect(204)
                    });
        
        
        
                });
            });
            describe("Negative Tests", () => {
                it("should throw 404 when attempting a valid delete an entry with an ID that does not exist", async () => {
                    const deleteRequest = {
                        id: new mongoose.Types.ObjectId(),
                    };
                    const response = await request(app)
                        .del(url)
                        .send(deleteRequest)
                        .expect(HttpErrorCode.NOT_FOUND);
        
                    expect(response).toHaveProperty("text", expect.any(String))
                });
            })
        });

        afterAll(async () => await mongooseMemoryDB.tearDownTestEnvironment() );
    })
    
})