const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

// mongo
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kusbv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  const userCollection = client.db("Trending-com").collection("users");
  const postCollection = client.db("Trending-com").collection("posts");
  const loveCollection = client.db("Trending-com").collection("love");
  const commentCollection = client.db("Trending-com").collection("comment");
  try {
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
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    //insert user's love into the database
    app.post("/love", async (req, res) => {
      const loveInfo = req.body;
      const query = {
        previous_id: loveInfo.previous_id,
        love_giver_email: loveInfo.love_giver_email,
      };
      const result = await loveCollection.findOne(query);
      if (result) {
        const deleteLove = await loveCollection.deleteOne(query);
        res.send({ acknowledged: false });
      } else {
        const result1 = await loveCollection.insertOne(loveInfo);
        res.send(result1);
      }
    });

    //insert user comment
    app.post("/comment", async (req, res) => {
      const comment = req.body;
      const result = await commentCollection.insertOne(comment);
      res.send(result);
    });

    //insert user post
    app.post("/post", async (req, res) => {
      const post = req.body;
      const result = await postCollection.insertOne(post);
      res.send(result);
    });

    //get all posts
    app.get("/posts", async (req, res) => {
      const query = {};
      const cursor = postCollection.find(query).sort({ milliseconds: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    //get specific post
    app.get("/media/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await postCollection.findOne(query);
      res.send(result);
    });
  } catch {}
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("api found");
});
app.listen(port, () => {
  console.log("server running");
});
