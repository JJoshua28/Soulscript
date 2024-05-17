import request from "supertest"
//import moment from "moment";

import { MoodEntry, NewMoodEntry } from "../../src/types/entries";

import app from "../../src/config/server";
import mongooseMemoryDB from "../services/mongoDB/config";
import {createNewMoodEntry} from "../../test/data/helpers/moodEntry";
import { httpMoodEntryExpectation } from "../assertions/moodEntry";
import waitForExpect from "wait-for-expect";


describe("Smoke tests", () => {
    beforeAll ( async () => await mongooseMemoryDB.setupTestEnvironment() );
    let moodEntry: MoodEntry;
    describe("POST /api/mood/add-entry", () => {
        it("should add a mood entry", async () => {
            const entry: NewMoodEntry = createNewMoodEntry();
            const URL = "/api/mood/add-entry"
            const response = await request(app)
                .post(URL)
                .send(entry)
                .expect(200);

            expect(response.body).toEqual(expect.objectContaining(httpMoodEntryExpectation));
            moodEntry = response.body;
        });
    })
    describe("GET /api/mood/get-entry-by-date", () => {
        it("should retrieve a mood entry with today's date", async () => {
            const date = (new Date()).toISOString()
            const URL = "/api/mood/get-entry-by-date"
            const response = await request(app)
            .get(URL)
            .send({
                datetime: date
            })
            .expect(200)

            expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining(httpMoodEntryExpectation)]));
            expect(response.body).toEqual(expect.arrayContaining([moodEntry]));
        });
        it("should return an empty array if no entries exist with that date", async () => {
            const date = (new Date("2020")).toISOString();
            const URL = "/api/mood/get-entry-by-date";
            const response = await request(app)
            .get(URL)
            .send({
                datetime: date
            })
            .expect(204);

            expect(response.body).toEqual(expect.arrayContaining([]));
            expect(response.body).toEqual(expect.arrayContaining([]));
        })
        /*it.each`
        request              
        ${""}                
        ${{datetime: ""}}    
        ${{datetime: moment()}}
        ` (`should throw because of invalid request body: ${request}`, async ({request}) => {
            const URL = "/api/mood/get-entry-by-date";
            const response = await request(app)
            .get(URL)
            .send({
                datetime: request
            })
            .expect(500)

            expect(response.body).toHaveProperty("message")
        })
        */
    })
    describe("PUT api/mood/update-entry", () => {
        it(`should update the mood entry with by ID`, async () => {
            const {id} = moodEntry
         
            const tags = ["life, philosophy"];
            const mood = "unsure" 
            const URL = "/api/mood/update-entry";
            const response  = await request(app)
            .put(URL)
            .send({id, update: {
                tags,
                mood
            }})
            .expect(200);

            expect(response.body.id).toEqual(id);
            expect(response.body.tags).toEqual(tags);
            expect(response.body.mood).toEqual(mood);
            expect(response.body).toEqual(expect.objectContaining(httpMoodEntryExpectation));
        } )

    }) 
    describe("DEL /api/mood/remove-entry", () => {
        it("should remove the mood entry by id", async () => {
            const {id} = moodEntry;
            const URL = "/api/mood/remove-entry";

            const response = await request(app)
            .del(URL)
            .send({id})
            .expect(200);

            expect(response.body.id).toEqual(id);
            expect(response.body.datetime).toEqual(moodEntry.datetime);

            expect(response.body).toEqual(expect.objectContaining(httpMoodEntryExpectation));

            await waitForExpect(async () => {
                const foundDocument = await request(app)
                .get("/api/mood/get-entry-by-date")
                .send({datetime: moodEntry.datetime})
                .expect(204)
            });



        })
    })
    afterAll(async () => await mongooseMemoryDB.tearDownTestEnvironment() );
})