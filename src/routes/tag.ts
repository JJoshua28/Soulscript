import express, {Express, Request, Response, Router} from "express";
import handleAddTag from "../handlers/tag/addTag";
import handleErrorMapper from "../mappers/handleErrors";

const app:Express = express();
app.use(express.json());

const tagRouter: Router = express.Router();

tagRouter.post("/add", (req: Request, res: Response) => {
    handleAddTag(req)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});

export default tagRouter;