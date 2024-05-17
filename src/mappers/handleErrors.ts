import { Request } from "express";
import CustomMoodErrors, { StructureErrorResponse, HttpErrorCode } from "../types/error";

const handleErrorMapper = (message: CustomMoodErrors | string, req: Request): StructureErrorResponse => {
    if(message === CustomMoodErrors.INVALID_DATE || message === CustomMoodErrors.INVALID_REQUEST) return {
        message: `${message}: ${JSON.stringify(req.body)}`,
        statusCode: HttpErrorCode.BAD_REQUEST
    }
    if(message === CustomMoodErrors.INVALID_ENTRY_ID) return {
        message: `${message}: ${JSON.stringify(req.body)}`,
        statusCode: HttpErrorCode.NOT_FOUND
    }
    return {
        message,
        statusCode: HttpErrorCode.INTERNAL_ERROR
    }
}

export default handleErrorMapper;