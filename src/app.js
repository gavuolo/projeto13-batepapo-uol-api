import { MongoClient } from "mongodb";
import express from "express";
import dotenv from "dotenv";
import cors from 'cors';

dotenv.config();
const mongoClient = new MongoClient(process.env.MONGO_URI);
const app = express();
app.use(cors());
app.use(express.json());

const db = mongoClient.db('batepapouol');
const participantsCollection = db.collection("participants");
//conectar mongodb
try {
    await mongoClient.connect();
    console.log("MongoDB conectado");
} catch (err) {
    console.log(err);
}

app.post("/participants", async (req, res) => {
    const { name } = req.body
    try {
        const participantExist = await participantsCollection.findOne({ name: name })
        if (participantExist) {
            return res.status(409).send("Este usuário já existe")
        }
        await db.collection("participants").insertOne({ name })
        res.sendStatus(201)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
}
)

const PORT = 5000
app.listen(PORT, () => console.log(`Server running in port: ${PORT}`))