import request from "supertest"

import app from "../../src/config/server";
import mongooseMemoryDB from "../services/mongoDB/config";
import { existingTagExpectation } from "../assertions/tags";

describe("Tag smoke tests", () => {
    beforeAll ( async () => await mongooseMemoryDB.setupTestEnvironment() );
    describe("POST /api/tag/add", () => {
        const url = "/api/tag/add"
        const requestBody =  {
            name: "test",
            description: "testing testing testing",
        };
        describe("Positive Tests", () => {
            it("should add and return a tag", async () => {

                const response = await request(app)
                    .post(url)
                    .send(requestBody)
                    .expect(200);
                
                expect(response.body).toEqual(existingTagExpectation);
            });
            
        });
        describe("Negative Tests", () => {
            it("should throw an error if the tag already exists", async () => {
                const response =await request(app)
                    .post(url)
                    .send(requestBody)
                    .expect(400);
                expect(response).toHaveProperty("text", expect.any(String))
                
            });
        });

    })
    afterAll(async () => await mongooseMemoryDB.tearDownTestEnvironment());
})