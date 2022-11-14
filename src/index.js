import { MongoClient } from "mongodb"
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
const mongoClient = new MongoClient("mongodb://localhost:27017")
//process.env.MONGO_URI)
let db;

mongoClient.connect()
    .then(() => { 
        db = mongoClient.db("batePapoUol") 
    })
    .catch(err => console.log(err));

app.post("/participants", (req, res) => {
    const { name } = req.body
    //validação com JOI - lastStatus

    db.collection("participants")
        .insert({
            name,
        })
        .then((response) => {
            console.log(response)
            res.status(201).send("sucesso")
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(500).send(err)
        })
})


app.get("/participants"), (req, res) => {

    db.collection("participants")
        .find()
        .toArray()
        .then((participants) => {
            console.log(participants)
            res.send(participants)
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(500).sen(err)
        })

}

app.listen(5000, () => console.log("Server running in port: 5000"))