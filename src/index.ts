import app from "./config/server"
import connectToMongoDB from "./services/mongoDB/config";

connectToMongoDB();

app.listen(process.env.SERVER_PORT, function () {
    console.log(`Server running on port ${process.env.SERVER_PORT}`)
})
