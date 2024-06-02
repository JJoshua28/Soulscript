import request from "supertest"


import { Entry, NewEntry } from "../../src/types/entries";
import { HttpErrorCode } from "../../src/types/error";
import { httpEntryExpectation } from "../assertions/entries";

import app from "../../src/config/server";
import mongooseMemoryDB from "../services/mongoDB/config";
import { createNewEntry } from "../data/helpers/customEntry";
import { defaultJournalEntry } from "../data/journalEntry";
import { unlink } from "fs";


describe("Smoke tests", () => {
    beforeAll ( async () => await mongooseMemoryDB.setupTestEnvironment() );
    let journalEntry: Entry;
    describe("POST /api/journal/add-entry", () => {
        const URL = "/api/jounral/add-entry"
        describe("Positive Tests", () => {
            it("should add a jounral entry", async () => {
                const {content } = defaultJournalEntry;
                const response = await request(app)
                    .post(URL)
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
                    .post(URL)
                    .send(requestData)
                    .expect(HttpErrorCode.BAD_REQUEST);
    
                expect(response).toHaveProperty("text", expect.any(String))
            });
        })
    });
    afterAll(async () => await mongooseMemoryDB.tearDownTestEnvironment() );
})