import { MongoClient } from "mongodb";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import joi from "joi";
import dayjs from "dayjs";

dotenv.config();
const mongoClient = new MongoClient(process.env.DATABASE_URL);
const app = express();
app.use(cors());
app.use(express.json());

const db = mongoClient.db();
const participantsCollection = db.collection("participants");
const messagesCollecition = db.collection("messages");

//conectar mongodb
try {
  await mongoClient.connect();
  console.log("MongoDB conectado");
} catch (err) {
  console.log(err);
}

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  const participantSchema = joi.object({
    name: joi.string().required(),
  });

  try {
    const { error } = participantSchema.validate(
      { name },
      { abortEarly: false }
    );
    if (error) {
      const messageError = error.details.map((details) => details.message);
      return res.status(422).send(messageError);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
  // --------
  try {
    const participantExist = await participantsCollection.findOne({
      name: name,
    });
    if (participantExist) {
      return res.status(409).send("Este usuário já existe");
    }
    await participantsCollection.insertOne({ name, lastStatus: Date.now() });
    await messagesCollecition.insertOne({
      from: name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs().format("HH:mm:ss"),
    });
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});
app.get("/participants", async (req, res) => {
  try {
    const participantsList = await participantsCollection.find({}).toArray();
    return res.status(200).send(participantsList);
  } catch (err) {
    console.log(err);
    res.status(500).send("Não funcionou");
  }
});
app.post("/messages", async (req, res) => {
  const { user } = req.headers; //mandado pelo front
  const { text, type, to } = req.body;
  const body = {
    from: user,
    to: to,
    text: text,
    type: type,
    time: dayjs().format("HH:mm:ss"),
  };
  const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().required().valid("message", "private_message"),
  });

  try {
    const { error } = messageSchema.validate(
      { to, text, type },
      { abortEarly: false }
    );

    if (error) {
      const message = error.details.map((detail) => detail.message);
      return res.status(422).send(message);
    }
    const participantExist = await participantsCollection.findOne({
      name: user
    });
    console.log(participantExist)
    if (participantExist === null) {
      return res.status(422).send("usuário não existe");
    }
    if (!user) {
      return res.sendStatus(422);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }

  try {
    await messagesCollecition.insertOne(body);
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});
app.get("/messages", async (req, res) => {
  const { limit } = req.query;
  const { user } = req.headers;
  const limitMessage = parseInt(limit) * -1;
  if(limit == 0 || Math.sign(limit) === -1 ){
    return res.sendStatus(422)
  }
  try {
    const messageList = await messagesCollecition.find({}).toArray();
    const filterMessage = messageList.filter((item) => {
      return (
        item.to === "Todos" ||
        item.from === user ||
        item.to === user ||
        item.type === "message"
      );
    });
    return res.status(200).send(filterMessage.slice(limitMessage));

  } catch (err) {
    console.log(err);
    res.status(500).send("Não funcionou");
  }
});
app.post("/status", async (req, res) => {
  const { user } = req.header;
  try {
    const participantOnline = await participantsCollection.findOne({
      user
    });
    if(!participantOnline){
      return res.sendStatus(404)
    }
    await participantsCollection.updateOne(
      { name: user },
      { $set: { lastStatus: Date.now() } }
    );
    const teste = await participantsCollection.find({}).toArray()
    console.log(teste)
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500)
  }
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running in port: ${PORT}`));
