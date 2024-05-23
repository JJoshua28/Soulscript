import moment from "moment";
import request from "supertest"
import mongoose from "mongoose";

import { Entry, EntryTypes, NewEntryRequest } from "../../src/types/entries";
import { HttpErrorCode } from "../../src/types/error";

import app from "../../src/config/server";
import mongooseMemoryDB from "../services/mongoDB/config";
import { createNewGratitudeEntry, seedGratitudeEntryTestData } from "../data/helpers/gratitudeEntry";
import { defaultGratitudeEntry } from "../data/gratitudeEntry";


describe("Smoke tests", () => {
    beforeAll ( async () => {
        await mongooseMemoryDB.setupTestEnvironment();
        await seedGratitudeEntryTestData();
    });
    let gratitudeEntry: Entry; 
    describe("POST /api/gratitude/add-entry", () => {
        const URL = "/api/gratitude/add-entry"
        describe("Positive Tests", () => {
            it("should add a basic gratitude entry ", async () => {
                const entry: NewEntryRequest = {
                    content: ["grateful to test my code", "grateful for smoke tests"]
                }
                const response = await request(app)
                    .post(URL)
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
                const {datetime, type, ...entry} = createNewGratitudeEntry(defaultGratitudeEntry);
                const response = await request(app)
                    .post(URL)
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
                    .post(URL)
                    .send(requestData)
                    .expect(HttpErrorCode.BAD_REQUEST);
    
                expect(response).toHaveProperty("text", expect.any(String))
            });
        })
    });
    describe("GET /api/gratitude/get-entry-by-date", () => {
        const URL = "/api/gratitude/get-entry-by-date"
        describe("Positive Tests", () => {
            it("should retrieve a gratitude entry with today's date", async () => {
                const response = await request(app)
                .get(URL)
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
                .get(URL)
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
                    .get(URL)
                    .send(requestData)
                    .expect(HttpErrorCode.BAD_REQUEST);
    
                expect(response).toHaveProperty("text", expect.any(String))
            });
        })

    });
    describe("PUT api/gratitude/update-entry", () => {
        const URL = "/api/gratitude/update-entry";
        describe("Positive Tests", () => {
            it(`should update a gratitude entry with by ID`, async () => {
                const {id} = gratitudeEntry
            
                const tags = ["life, philosophy"];
                const content = ["I'm grateful because I see ghosts!", "I'm grateful to test my code!"]; 
                const sharedID = new mongoose.Types.ObjectId();
                const response  = await request(app)
                .put(URL)
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
                    .put(URL)
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
                } as any
                const response = await request(app)
                    .put(URL)
                    .send(updateRequest)
                    .expect(HttpErrorCode.NOT_FOUND);
    
                expect(response).toHaveProperty("text", expect.any(String))
            })
        })

    }); 
})