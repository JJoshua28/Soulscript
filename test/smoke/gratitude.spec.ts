import request from "supertest"

import { Entry, EntryTypes, NewEntry, NewEntryRequest } from "../../src/types/entries";
import { HttpErrorCode } from "../../src/types/error";

import app from "../../src/config/server";
import mongooseMemoryDB from "../services/mongoDB/config";
import { createNewGratitudeEntry } from "../data/helpers/gratitudeEntry";
import { defaultGratitudeEntry } from "../data/gratitudeEntry";


describe("Smoke tests", () => {
    beforeAll ( async () => await mongooseMemoryDB.setupTestEnvironment() );
    let moodEntry: Entry;
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
    })
})