import { Request } from "express";

import handleGetMoodEntryByDate from '../../../src/handlers/getMoodEntryByDate';
import GetEntryByDateUseCase from '../../../src/use cases/getEntryByDate';
import { validDate } from "../../../src/helpers/validateDate";
import { createEntry } from "../../data/helpers/customEntry";
import { defaultMoodEntry } from "../../data/moodEntry";
import { EntryTypes } from "../../../src/types/entries";
import moment from "moment";

jest.mock("../../../src/helpers/validateDate");

const mockValidDate = validDate as jest.MockedFunction<typeof validDate>;

describe("Get Mood entry  by date helper", () => {
    describe("Positive Tests", () =>{
        beforeAll(()=>{
            mockValidDate.mockReturnValue(true);
        })
        afterEach( async()=>{
            await jest.clearAllMocks();
        })
        
        it.each`
        date            | entry
        ${"2020-01-01"} | ${[createEntry(defaultMoodEntry, {datetime: new Date("2020-01-01")}), createEntry(defaultMoodEntry, {datetime: new Date("2020-01-01"), subject: "test"})]}
        ${"2021-05-06"} | ${[createEntry(defaultMoodEntry, {datetime: new Date("2021-05-06")})]}
        ${"2022-08-12"} | ${[createEntry(defaultMoodEntry, {datetime: new Date("2022-08-12")}), createEntry(defaultMoodEntry, {datetime: new Date("2022-08-12"), quote: "its a test thing"})]}
        ${"2023-11-26"} | ${[createEntry(defaultMoodEntry, {datetime: new Date("2023-11-26")})]}
        `("should get a mood entry with date $date", async ({date, entry})=> {
            
            const request = ({body:  {datetime: date}} as Request)
            
            
            const executeSpy = jest.spyOn(GetEntryByDateUseCase.prototype, 'execute');
            executeSpy.mockResolvedValue(entry);
            
            const response = await handleGetMoodEntryByDate(request);
            
            expect(executeSpy).toHaveBeenCalledWith(new Date(date));
            expect(response).toEqual(expect.arrayContaining(entry));
            expect(response[0]).toHaveProperty("datetime", new Date(date));
            expect(response[0]).toHaveProperty("type", EntryTypes.MOOD);
        });
    })
    describe("Negative Tests", ()=> {
        beforeAll(()=>{
            mockValidDate.mockReturnValue(false);
        })
        it.each`
        date
        ${moment().add(1, "day")}
        ${"3023-01-01"}
        ${moment().add(1, "month")}
        ${moment().add(1, "year")}
        `("should throw and error with when invalid date $date is passed", async ({date}) =>{
            const request = ({body:  {datetime: date}} as any as Request)
            
            await expect(handleGetMoodEntryByDate(request)).rejects.toThrow(Error);

        })
    })
})