import { Request } from "express";
import CustomErrors, { StructureErrorResponse, HttpErrorCode } from "../types/error";

const handleErrorMapper = (message: CustomErrors | string, req: Request): StructureErrorResponse => {
    switch(message) {
        case CustomErrors.INVALID_DATE:
        case CustomErrors.INVALID_REQUEST:
        case CustomErrors.INVALID_ENTRY_TYPE:
        case CustomErrors.INVALID_TAG:
            return {
                message: `${message}: ${JSON.stringify(req.body)}`,
                statusCode: HttpErrorCode.BAD_REQUEST
            }
        case CustomErrors.INVALID_ENTRY_ID:
        case CustomErrors.VOID_TAG:
            return {
                message: `${message}: ${JSON.stringify(req.body)}`,
                statusCode: HttpErrorCode.NOT_FOUND
            }
        default:
            return {
                message,
                statusCode: HttpErrorCode.INTERNAL_ERROR
            }
    }
}

export default handleErrorMapper;