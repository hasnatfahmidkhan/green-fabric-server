require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

const uri = process.env.DB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("greenFabricDB");
    const tShirtCollection = db.collection("t-shirts");

    //? T-shirts apis in here
    // get t-shirts
    app.get("/t-shirts", async (req, res) => {
      const result = await tShirtCollection.find().toArray();
      res.status(200).json(result);
    });

    // get t-shirt details
    app.get("/t-shirts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tShirtCollection.find(query).toArray();
      res.status(200).json(result);
    });

    // post t shirt
    app.post("/t-shirts", async (req, res) => {
      const newTShirt = req.body;
      newTShirt.createdAt = new Date().toISOString();
      newTShirt.orderStatus = "pending";
      const result = await tShirtCollection.insertOne(newTShirt);
      res.status(201).json(result);
    });

    // delete t-shirt
    app.delete("/t-shirts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tShirtCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Green Fabric Server Is Running!");
});

app.listen(port, () => {
  console.log(`Green Fabric Server Listening On Port ${port}`);
});
