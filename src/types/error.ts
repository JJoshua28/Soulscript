enum CustomErrors {
    INVALID_DATE       = "Invalid date",
    INVALID_REQUEST    = "Invalid request",
    INVALID_ENTRY_ID   = "No entry exists with ID",
    INVALID_ENTRY_TYPE = "The request entry type does not match the received entry type",
    INVALID_TAG        = "Tag does not exists with the provided ID or name",
    VOID_TAG_SERVICE   = "Tag service not found",
    VOID_TAG           = "Tag not found by that ID or name"
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

export default CustomErrors;