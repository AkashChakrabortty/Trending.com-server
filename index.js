const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

// mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kusbv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
     const userCollection = client.db("Trending-com").collection("users");
    try{

      //insert userinfo into the database
      app.post("/storeUser", async (req, res) => {
        const userInfo = req.body;
        // console.log(userInfo);
        const filter = { email: userInfo.email };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            email: userInfo.email,
            name: userInfo.name,
            photoUrl: userInfo.photoUrl,
          },
        };
       const result = await userCollection.updateOne(
         filter,
         updateDoc,
         options
       );
        res.send(result);
      });

    }

    catch{

    }
}
run().catch(err => console.log(err))

app.get("/", (req, res) => {
  res.send("api found");
});
app.listen(port, () => {
  console.log("server running");
});