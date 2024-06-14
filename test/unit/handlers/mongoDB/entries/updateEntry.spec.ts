import { Request } from "express"
import mongoose from "mongoose"

import handleUpdateEntry from "../../../../../src/handlers/entries/updateEntry";
import { EntryTypes } from "../../../../../src/types/entries";

describe("Update mood entry", () => {
    it.each`
    update                          | id
    ${{subject: "Lorum Ipsum"}}     | ${""}
    ${{}}                           | ${new mongoose.Types.ObjectId()}
    ${""}                           | ${new mongoose.Types.ObjectId()}
    ${{}}                           | ${""}
    `("should throw an error but $update and or $id are passed as arguments", async ({id, update})=> {
        const request = ({body:  {update, id}} as Request)
        await expect(handleUpdateEntry(request, EntryTypes.JOURNAL)).rejects.toThrow(Error);
    }, 12000)

})