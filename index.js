require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

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
    const categoriesCollection = db.collection("categories");
    const reviewsCollection = db.collection("reviews");

    // get t-shirts
    app.get("/t-shirts", async (req, res) => {
      const {
        isFeatured,
        limit = 0,
        email,
        sort = "createdAt",
        order = "desc",
        category,
        search,
      } = req.query;
      const sortOption = {};
      sortOption[sort || "createdAt"] = order === "asc" ? 1 : -1;
      const query = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { shortDescription: { $regex: search, $options: "i" } },
        ];
      }

      if (isFeatured || limit) {
        query.isFeatured = true;
      }
      if (email) {
        query.email = email;
      }
      if (category) {
        query.category = category;
      }

      const result = await tShirtCollection
        .find(query)
        .sort(sortOption)
        .limit(Number(limit))
        .toArray();
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

    //? categories
    app.get("/categories", async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.json(result);
    });

    // reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.json(result);
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
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
