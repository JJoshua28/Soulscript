import express, {Express, Request, Response, Router} from "express";

import { EntryTypes } from "../../types/entries";
import handleErrorMapper from "../../mappers/handleErrors";

import handleAddEntry from "../../handlers/entries/addEntry";
import handleGetEntryByDate from "../../handlers/entries/getEntryByDate";
import handleUpdateEntry from "../../handlers/entries/updateEntry";
import handleDeleteEntry from "../../handlers/entries/deleteEntry";

const app:Express = express();
app.use(express.json());

const moodRouter: Router = express.Router();

moodRouter.post("/add", (req: Request, res: Response) => {
    
    handleAddEntry(req, EntryTypes.MOOD)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});

moodRouter.get("/get-entry-by-date", (req: Request, res: Response) => {
    handleGetEntryByDate(req, EntryTypes.MOOD)
    .then(response => {
        if (response.length == 0) return res.status(204).send(response);
        return res.status(200).send(response);
    })
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});

moodRouter.put("/update", (req: Request, res: Response) => {
    handleUpdateEntry(req, EntryTypes.MOOD)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});

moodRouter.delete("/remove", (req: Request, res: Response) => {
    handleDeleteEntry(req, EntryTypes.MOOD)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});


export default moodRouter;

