enum CustomMoodErrors {
    INVALID_DATE = "Invalid date",
    INVALID_REQUEST = "Invalid request",
    INVALID_ENTRY_ID = "No entry exists with ID",
    INVALID_ENTRY_TYPE = "The request entry type does not match the received entry type"
}

export enum HttpErrorCode  {
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500
}
 

export interface StructureErrorResponse {
    statusCode: number,
    message: string
}

export default CustomMoodErrors;