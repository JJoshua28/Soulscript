import request from "supertest"

import { NewMoodEntry } from "../../src/types/entries";

import app from "../../src/config/server";
import mongooseMemoryDB from "../services/mongoDB/config";
import {createNewMoodEntry} from "../../test/data/helpers/moodEntry";
import { httpMoodEntryExpectation } from "../assertions/moodEntry";

describe("Smoke tests", () => {
    beforeAll ( async () => await mongooseMemoryDB.setupTestEnvironment() );
    describe("POST /api/mood/add-entry", () => {
        it("should add a mood entry", async () => {
            const moodEntry: NewMoodEntry = createNewMoodEntry();
            const URL = `/api/mood/add-entry`
            const response = await request(app)
                .post(URL)
                .send(moodEntry)
                .expect(200);

            expect(response.body).toEqual(expect.objectContaining(httpMoodEntryExpectation));
        })
    })
    afterAll(async () => await mongooseMemoryDB.tearDownTestEnvironment() );
})