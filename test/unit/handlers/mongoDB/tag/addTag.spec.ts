import type { Request } from "express";

import handleAddTag from "../../../../../src/handlers/tag/addTag"
import { mockDefaultNewTag, mockTag } from "../../../../data/tags";
import AddTagUseCase from "../../../../../src/use cases/tag/addTag";



describe("Add Tag", () => {
    describe("Positive Tests", () => {
        it("should return a new tag", async () => {
            const request = {
                body: {
                    name: mockDefaultNewTag.name,
                    description: mockDefaultNewTag.description
                }
            } as Request

            jest.spyOn(AddTagUseCase.prototype, "execute").mockResolvedValue(mockTag);

            const response = await handleAddTag(request);
            expect(response).toEqual(expect.objectContaining({id: expect.any(String)}));
        });
    });
    describe("Negative Tests", () => {
        it("should throw an error if a tag request has no name", async () => { //TODO: test if description is not created and returned by MongoDB", async () => {
            const request = {
                body: {
                    description: mockDefaultNewTag.description
                }
            } as Request
            await expect(handleAddTag(request)).rejects.toThrow(Error);
        });
        it("should throw an error if a tag name is not a string", async () => {
            const request = {
                body: {
                    name: 123,
                    description: mockDefaultNewTag.description
                }
            } as Request
            await expect(handleAddTag(request)).rejects.toThrow(Error);
        });
    });
});