import request from "supertest"

import { Entry, EntryTypes, NewEntry, NewEntryRequest } from "../../src/types/entries";
import { HttpErrorCode } from "../../src/types/error";

import app from "../../src/config/server";
import mongooseMemoryDB from "../services/mongoDB/config";
import { createNewGratitudeEntry, seedGratitudeEntryTestData } from "../data/helpers/gratitudeEntry";
import { defaultGratitudeEntry } from "../data/gratitudeEntry";
import moment from "moment";
import { httpGratitudeEntryExpectation } from "../assertions/entries";


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
})