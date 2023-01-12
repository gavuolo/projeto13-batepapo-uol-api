import { MongoClient } from "mongodb";
import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import joi from "joi";
import dayjs from "dayjs";

dotenv.config();
const mongoClient = new MongoClient(process.env.DATABASE_URL);
const app = express();
app.use(cors());
app.use(express.json());

const db = mongoClient.db();
const participantsCollection = db.collection("participants");
const messagesCollecition = db.collection("messages")

//conectar mongodb
try {
    await mongoClient.connect();
    console.log("MongoDB conectado");
} catch (err) {
    console.log(err);
}

app.post("/participants", async (req, res) => {
    const { name } = req.body
    //falta fazer validação com joi
    //falta laststatus
    const messageLogin = {
        from: name,
        to: "Todos",
        text: "Entrou na sala...",
        type:  "status",
        time: dayjs().format("HH:mm:ss")
    }
    try {
        const participantExist = await participantsCollection.findOne({ name: name })
        if (participantExist) {
            return res.status(409).send("Este usuário já existe")
        }
        await db.collection("participants").insertOne({ name })
        await db.collection("messages").insertOne({ messageLogin })
        // console.log(messageLogin)
        res.sendStatus(201)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
}
)

const PORT = 5000
app.listen(PORT, () => console.log(`Server running in port: ${PORT}`))