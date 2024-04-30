import express, {Express} from 'express';
import connectToMongoDB from './mongoDB/config'
import router from './routes/addEntry';

const serverPort = 3001;

const app: Express = express();
app.use(express.json());
    
connectToMongoDB(); 
app.use("/api/add-entry", router)
app.get("/", (req, res) => {
    res.send("Girl get comfortable!");
})


app.listen(serverPort, function () {
    console.log(`Server running on port ${serverPort}`)
})