import express, {Express, Request, Response, Router} from 'express';
import handleErrorMapper from '../mappers/handleErrors';
import handleAddGratitudeEntry from '../handlers/addGratitudeEntry';
import handleGetGratitudeEntryByDate from '../handlers/getGratitudeEntryByDate';

const app:Express = express();
app.use(express.json());


const gratitudeRouter: Router = express.Router();

gratitudeRouter.post("/add-entry", (req: Request, res: Response) => {
    handleAddGratitudeEntry(req)
    .then(response => res.send(response).status(200))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});
gratitudeRouter.get("/get-entry-by-date", (req: Request, res: Response) => {
    handleGetGratitudeEntryByDate(req)
    .then(response => {
        if (response.length == 0) return res.status(204).send(response);
        return res.status(200).send(response);
    })
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
})


export default gratitudeRouter;