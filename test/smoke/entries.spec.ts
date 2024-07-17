import moment from "moment";
import request from "supertest"
import mongoose from "mongoose";
import waitForExpect from "wait-for-expect";
import { v4 as uuidv4 } from "uuid";

import type { TagResponse } from "../../src/types/tags";
import { Entry, EntryTypes, NewEntryRequest } from "../../src/types/entries";
import CustomErrors, { HttpErrorCode } from "../../src/types/error";

import app from "../../src/config/server";
import mongooseMemoryDB from "../services/mongoDB/config";
import { defaultGratitudeEntry, newGratitudeEntry } from "../data/gratitudeEntry";
import { seedGratitudeEntryTestData } from "../data/helpers/addTestEntries";
import { newMoodEntry } from "../data/moodEntry";
import { httpEntryExpectation } from "../assertions/entries";
import { defaultJournalEntry, newJournalEntry } from "../data/journalEntry";
import entryModel from "../../src/services/mongoDB/models/entry";
import { seedTagData } from "../data/helpers/seedTagData";
import tagModel from "../../src/services/mongoDB/models/tag";

 
describe("Entry smoke tests", () => {
    const tagIds: mongoose.Types.ObjectId[] = [];
    const globalTags: TagResponse[] = [];
    beforeAll ( async () => {
        await mongooseMemoryDB.setupTestEnvironment();
        const tag1 = await seedTagData(tagModel, "test");
        const tag2 = await seedTagData(tagModel, "Update test");

        tagIds.push(
            new mongoose.Types.ObjectId(tag1.id),
            new mongoose.Types.ObjectId(tag2.id)
        );

        globalTags.push({
            ...tag1,
            createdAt: tag1.createdAt.toISOString()
        }, {
            ...tag2,
            createdAt: tag2.createdAt.toISOString()
        });
        await seedGratitudeEntryTestData(entryModel, [tagIds[0]]);
        

    });
    describe("Mood", () => {
        let moodEntry: Entry;
        describe("POST /api/entries/mood/add", () => {
            const url = "/api/entries/mood/add"
            describe("Positive Tests", () => {
                it("should add a mood entry", async () => {
                    const {datetime, ...moodEntryRequest} = newMoodEntry;
                    const entry = {
                        ...moodEntryRequest,
                        tags: [tagIds[0]]
                    };
                    const response = await request(app)
                        .post(url)
                        .send(entry)
                        .expect(200);
        
                    expect(response.body).toEqual(expect.objectContaining(httpEntryExpectation));
                    moodEntry = response.body;
                });
                it("should add a mood entry with a specific date", async () => {
                    const {content } = newMoodEntry;
                    const datetime = moment("2020-05-05 15:00:00").format("YYYY-MM-DD HH:mm:ss");
                    const response = await request(app)
                        .post(url)
                        .send({content, datetime})
                        .expect(200);

                        expect(response.body).toHaveProperty("datetime", `${new Date(datetime).toISOString()}`)
                        expect(response.body).toHaveProperty("content", expect.any(String));
                        expect(response.body).toHaveProperty("type", EntryTypes.MOOD);
                        expect(response.body).toHaveProperty("id", expect.any(String));
                });
                it("should add a basic mood entry without a tag", async () => {
                    const entry = {
                        content: "happy"
                    };
                    const response = await request(app)
                        .post(url)
                        .send(entry)
                        .expect(200);
        
                    expect(response.body).toHaveProperty("content", "happy");
                    expect(response.body).toHaveProperty("datetime", expect.any(String));
                    expect(response.body).toHaveProperty("type", "mood");
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
        
                    expect(response).toHaveProperty("text", expect.any(String));
                });
                it("should throw when trying to create an entry with an invalid tag", async () => {
                    const requestData = {
                        ...newMoodEntry, 
                        tags: ["InvalidTag"]
                    };

                    const response = await request(app)
                        .post(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                    expect(response.text).toContain(CustomErrors.INVALID_REQUEST);

                });
                it("should throw when trying to create an entry with a tag that does not exist", async () => {
                    const requestData = {
                        ...newMoodEntry, 
                        tags: [new mongoose.Types.ObjectId()]
                    };

                    const response = await request(app)
                        .post(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                    expect(response.text).toContain(CustomErrors.INVALID_TAG);

                });
            })
        });
        describe("GET /api/entries/mood/get-entry-by-date", () => {
            const url = "/api/entries/mood/get-entry-by-date"
            describe("Positive Tests", () => {
                it("should retrieve a mood entry with today's date", async () => {
                    const date = new Date()
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
                it(`should update the mood entry by ID`, async () => {
                const {id} = moodEntry
             
                const subject = "Updating entry test"
                const content = "unsure" 
                const response  = await request(app)
                .put(url)
                .send({id, update: {
                    subject,
                    content
                }})
                .expect(200);
    
                expect(response.body).toStrictEqual({
                    ...moodEntry,
                    subject,
                    content,
                });
                moodEntry = {
                    ...response.body,
                }
                });
                it(`should update the mood entry with new tags by ID`, async () => {
                    const {id} = moodEntry                 
                    const content = "unsure" 
                    const response  = await request(app)
                    .put(url)
                    .send({id, update: {
                        tags: tagIds,
                        content
                    }})
                    .expect(200);
        
                    expect(response.body).toStrictEqual({
                        ...moodEntry,
                        tags: globalTags,
                        content,
                    });
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
                });
                it("should throw when trying to update an entry with an invalid tag", async () => {
                    const {id} = moodEntry;

                    const tags = ["InvalidTag"];
                    const response = await request(app)
                        .put(url)
                        .send({
                            id, 
                            update: {
                                tags
                            }
                        })
                        .expect(HttpErrorCode.BAD_REQUEST);
        

    
                        expect(response.text).toContain(CustomErrors.INVALID_REQUEST);
    
                });
                it("should throw when trying to update an entry with a tag that does not exist", async () => {
                    const {id} = moodEntry;

                    const tags = [new mongoose.Types.ObjectId()];
                    const response = await request(app)
                        .put(url)
                        .send({id, update: {tags}})
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                        expect(response.text).toContain(CustomErrors.INVALID_TAG);
    
                });
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
                        const finalResponse = await entryModel.findById(id);
                        expect(finalResponse).toBeFalsy();
                    }, 10000, 500); 
        
        
        
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
    })
    describe("Gratitude", () => {
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
                it("should add a gratitude entry with a specific date", async () => {
                    const {content } = defaultGratitudeEntry;
                    const datetime = moment("2015-10-05 15:00:00").format("YYYY-MM-DD HH:mm:ss");
                    const response = await request(app)
                        .post(url)
                        .send({content, datetime})
                        .expect(200);

                        expect(response.body).toHaveProperty("datetime", `${new Date(datetime).toISOString()}`)
                        expect(response.body).toHaveProperty("content", expect.arrayContaining([expect.any(String)]));
                        expect(response.body).toHaveProperty("type", EntryTypes.GRATITUDE);
                        expect(response.body).toHaveProperty("id", expect.any(String));
                });
                it("should add a complete gratitude entry", async () => {
                    const entry = {
                        ...newGratitudeEntry,
                        tags: [tagIds[0]]
                    }
                    
                    const response = await request(app)
                        .post(url)
                        .send(entry)
                        .expect(200);
                    
                    expect(response.body).toEqual(expect.objectContaining({
                        ...entry,
                        type: EntryTypes.GRATITUDE,
                        tags: [globalTags[0]],
                        datetime: entry.datetime.toJSON()
                    }));
                    expect(response.body.id).toEqual(expect.any(String));
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
                it("should throw when trying to create an entry with an invalid tag", async () => {
                    const requestData = {
                        ...newGratitudeEntry,
                        tags: ["InvalidTag"]
                    }
                    const response = await request(app)
                        .post(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        

    
                        expect(response.text).toContain(CustomErrors.INVALID_REQUEST);
    
                });
                it("should throw when trying to create an entry with a tag that does not exist", async () => {
                    const requestData = {
                        ...newGratitudeEntry,
                        tags: [new mongoose.Types.ObjectId()]
                    }
                    const response = await request(app)
                        .post(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        

    
                        expect(response.text).toContain(CustomErrors.INVALID_TAG);
    
                });
            });
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
                it(`should update a gratitude entry by ID`, async () => {
                    const {id} = gratitudeEntry
                
                    const subject = "Updating a gratitude entry's subject";
                    const content = ["I'm grateful because I see ghosts!", "I'm grateful to test my code!"]; 
                    const response  = await request(app)
                    .put(url)
                    .send({id, update: {
                        subject,
                        content,
                    }})
                    .expect(200);
    
                    expect(response.body).toStrictEqual({
                        ...gratitudeEntry,
                        subject,
                        content,
                    });
                    gratitudeEntry = response.body;
                });
                it(`should update a gratitude entry with a tag by ID`, async () => {
                    const {id} = gratitudeEntry
                
                    const tags = tagIds;
                    const content = ["I'm grateful because I see ghosts!", "I'm grateful to test my code!"]; 
                    const sharedID = uuidv4();
                    const response  = await request(app)
                    .put(url)
                    .send({id, update: {
                        tags,
                        content,
                        sharedID
                    }})
                    .expect(200);
    
                    expect(response.body).toStrictEqual({
                        ...gratitudeEntry,
                        tags: globalTags,
                        content,
                        sharedID,
                    });           

                    gratitudeEntry = response.body;
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
                });
                it("should throw when trying to update an entry with an invalid tag", async () => {
                    const {id} = gratitudeEntry

                    const tags = ["InvalidTag"];
                    const response = await request(app)
                        .put(url)
                        .send({
                            id, 
                            update: {
                                tags
                            }
                        })
                        .expect(HttpErrorCode.BAD_REQUEST);
        

    
                        expect(response.text).toContain(CustomErrors.INVALID_REQUEST);
    
                });
                it("should throw when trying to update an entry with a tag that does not exist", async () => {
                    const {id} = gratitudeEntry

                    const tags = [new mongoose.Types.ObjectId()];
                    const response = await request(app)
                        .put(url)
                        .send({id, update: {tags}})
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                        expect(response.text).toContain(CustomErrors.INVALID_TAG);
    
                });
            });
        });
        describe("DEL /api/entries/gratitude/remove", () => {
            const url = "/api/entries/gratitude/remove";
            describe("Positive Tests", () => {
                it("should remove the gratitude entry by id", async () => {
        
                    const response = await request(app)
                    .del(url)
                    .send({id: gratitudeEntry.id})
                    .expect(200);
        
                    expect(response.body).toStrictEqual(gratitudeEntry);
                    
                    await waitForExpect(async () => {
                        const finalResponse = await entryModel.findById(gratitudeEntry.id);
                        expect(finalResponse).toBeFalsy();
                    }, 10000, 500); 
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
    });
    describe("Journal", () => {

        let journalEntry: Entry;
        
        describe("POST /api/entries/journal/add", () => {
            const url = "/api/entries/journal/add"
            describe("Positive Tests", () => {
                it("should add a journal entry", async () => {
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
                it("should add a journal entry with a specific date", async () => {
                    const {content } = defaultJournalEntry;
                    const datetime = moment("2020-05-05 15:00:00").format("YYYY-MM-DD HH:mm:ss");
                    const response = await request(app)
                        .post(url)
                        .send({content, datetime})
                        .expect(200);

                        expect(response.body).toHaveProperty("datetime", `${new Date(datetime).toISOString()}`)
                        expect(response.body).toHaveProperty("content", expect.any(String));
                        expect(response.body).toHaveProperty("type", EntryTypes.JOURNAL);
                        expect(response.body).toHaveProperty("id", expect.any(String));
                });
                it("should add a basic journal entry without a tag", async () => {
                    const entry = {
                        content: defaultJournalEntry.content
                    };

                    const response = await request(app)
                        .post(url)
                        .send(entry)
                        .expect(200);
        
                    expect(response.body).toHaveProperty("content");
                    expect(response.body).toHaveProperty("datetime", expect.any(String));
                    expect(response.body).toHaveProperty("type", "journal");
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
                it("should throw when trying to create an entry with an Invalid tag", async () => {
                    const requestData = {
                        ...newJournalEntry,
                        tags: ["1nvali3d2t4a5genvalidfag"]
                    };
                    const response = await request(app)
                        .post(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                        expect(response.text).toContain(CustomErrors.INVALID_REQUEST);
                });
                it("should throw when trying to create an entry with a tag that does not exist", async () => {
                    const requestData = {
                        ...newJournalEntry,
                        tags: [new mongoose.Types.ObjectId()]
                    };
                    const response = await request(app)
                        .post(url)
                        .send(requestData)
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                        expect(response.text).toContain(CustomErrors.INVALID_TAG);
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
                it(`should update the journal entry by ID`, async () => {
                    const {id} = journalEntry
                
                    const quote = "high on life!"
                    const subject = "testing testing testing";
                    const response  = await request(app)
                    .put(url)
                    .send({id, update: {
                        subject,
                        quote,
                    }})
                    .expect(200);
        
                    expect(response.body).toStrictEqual({
                        ...journalEntry,
                        subject,
                        quote,
                    });
                    journalEntry = response.body;
                });
                it(`should update the journal entry with a tag by ID`, async () => {
                    const {id} = journalEntry
                
                    const tags = tagIds;
                    const response  = await request(app)
                    .put(url)
                    .send({id, update: {
                        tags,
                    }})
                    .expect(200);
        
                    expect(response.body).toStrictEqual({
                        ...journalEntry,
                        tags: globalTags,
                    });
                    journalEntry = response.body;
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
                });
                it("should throw when trying to update an entry with an invalid tag", async () => {
                    const {id} = journalEntry

                    const tags = ["InvalidTag"];
                    const response = await request(app)
                        .put(url)
                        .send({
                            id, 
                            update: {
                                tags
                            }
                        })
                        .expect(HttpErrorCode.BAD_REQUEST);
        

    
                        expect(response.text).toContain(CustomErrors.INVALID_REQUEST);
    
                });
                it("should throw when trying to update an entry with a tag that does not exist", async () => {
                    const {id} = journalEntry

                    const tags = [new mongoose.Types.ObjectId()];
                    const response = await request(app)
                        .put(url)
                        .send({id, update: {tags}})
                        .expect(HttpErrorCode.BAD_REQUEST);
        
                        expect(response.text).toContain(CustomErrors.INVALID_TAG);
    
                });
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
        
                    expect(response.body).toStrictEqual(journalEntry);
                    
                    await waitForExpect(async () => {
                        const finalResponse = await entryModel.findById(id);
                        expect(finalResponse).toBeFalsy();
                    }, 10000, 500); 
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

    })
    afterAll(async () => await mongooseMemoryDB.tearDownTestEnvironment() );
})