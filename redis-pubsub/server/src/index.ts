import express from "express";
import { createClient } from "redis";

const app = express();



const client = createClient();
startServer();

app.use(express.json())

app.post("/submit", async(req, res) => {
  const { problemId, userId, code, lang } = req.body;

  //push this to database

  const redisRes=await client.lPush("submission", JSON.stringify({ problemId, userId, code, lang }));

  console.log(redisRes)

  res.json({message: 'submission message'})

});

async function startServer() {
  try {
    await client.connect();

    console.log("redis client connected");

    app.listen(8000,()=>{
        console.log('express server is running')
    })
  } catch (e) {
    console.log('error in connect client',e);
  }
}
