import { Request } from "express";
import moment from "moment";

import { EntryTypes } from "../../../../../src/types/entries";

import handleGetEntryByDate from "../../../../../src/handlers/entries/getEntryByDate";
import GetEntryByDateUseCase from "../../../../../src/use cases/entries/getEntryByDate";
import { validDate } from "../../../../../src/helpers/validateDate";
import { defaultMoodEntry } from "../../../../data/moodEntry";

jest.mock("../../../../../src/helpers/validateDate");

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
        date            
        ${"2020-01-01"} 
        ${"2021-05-06"} 
        ${"2022-08-12"} 
        ${"2023-11-26"} 
        `("should get a mood entry with date $date", async ({date})=> {
            const testDate = new Date(date);

            const entries = [{
                ...defaultMoodEntry,
                datetime: testDate
            }];
            const request = ({body:  {datetime: date}} as Request)
            
            
            const executeSpy = jest.spyOn(GetEntryByDateUseCase.prototype, "execute");
            executeSpy.mockResolvedValue(entries);
            
            const response = await handleGetEntryByDate(request, EntryTypes.MOOD);
            
            expect(executeSpy).toHaveBeenCalledWith(testDate);
            expect(response).toEqual(expect.arrayContaining(entries));
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
            const request = ({body:  {datetime: date}} as Request)
            
            await expect(handleGetEntryByDate(request, EntryTypes.MOOD)).rejects.toThrow(Error);

        })
    })
})