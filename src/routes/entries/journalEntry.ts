import express, {Express, Router, Request, Response} from "express";

import handleErrorMapper from "../../mappers/handleErrors";
import { EntryTypes } from "../../types/entries";

import handleGetEntryByDate from "../../handlers/entries/getEntryByDate";
import handleAddEntry from "../../handlers/entries/addEntry";
import handleUpdateEntry from "../../handlers/entries/updateEntry";
import handleDeleteEntry from "../../handlers/entries/deleteEntry";

const app:Express = express();
app.use(express.json());

const journalRouter: Router = express.Router();

journalRouter.post("/add-entry", (req: Request, res: Response) => {
    handleAddEntry(req, EntryTypes.JOURNAL)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});

journalRouter.get("/get-entry-by-date", (req: Request, res: Response) => {
    handleGetEntryByDate(req, EntryTypes.JOURNAL)
    .then(response => {
        if (response.length == 0) return res.status(204).send(response);
        return res.status(200).send(response);
    })
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});

journalRouter.put("/update-entry", (req: Request, res: Response) => {
    handleUpdateEntry(req, EntryTypes.JOURNAL)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
})

journalRouter.delete("/remove-entry", (req: Request, res: Response) => {
    handleDeleteEntry(req, EntryTypes.JOURNAL)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});


export default journalRouter;
