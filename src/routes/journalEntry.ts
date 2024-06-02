import express, {Express, Router, Request, Response} from "express";

import handleAddJournalEntry from "../handlers/addJournalEntry";
import handleErrorMapper from "../mappers/handleErrors";

const app:Express = express();
app.use(express.json());

const journalRouter: Router = express.Router();

journalRouter.post("/add-entry", (req: Request, res: Response) => {
    handleAddJournalEntry(req)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});


export default journalRouter;
