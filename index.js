const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Database Info
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3u7yr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//live server link: https://mighty-savannah-90389.herokuapp.com/

async function run() {
  try {
    await client.connect();

    console.log("database connected successfully");

    //database name
    const database = client.db("travel_expo_blog");

    // Collections
    const blogCollection = database.collection("blogs");
    const userCollection = database.collection("users");
    const topSpotCollection = database.collection("top_spots");

    /* ========================= Blog Collection START ======================= */

    // GET - Get all travel blogs with pagination
    app.get("/blogs", async (req, res) => {
      const query = { status: "approved" };
      const cursor = blogCollection.find(query);

      const page = req.query.page;
      const size = parseInt(req.query.size);

      const count = await cursor.count();

      let blogs;

      if (count > 0) {
        if (page) {
          blogs = await cursor
            .skip(page * size)
            .limit(size)
            .toArray();
        } else {
          blogs = await cursor.toArray();
        }
        res.send({ count, blogs });
      } else {
        res.json({ message: "Blog Not Found!" });
      }
    });

    /* ========================= Blog Collection END ======================= */

    /* ========================= Top Tour Spot Collection START ======================= */

    // GET - Get all top tour spots
    app.get("/top-spots", async (req, res) => {
      const cursor = topSpotCollection.find({});
      if ((await cursor.count()) > 0) {
        const topSpots = await cursor.toArray();
        res.json(topSpots);
      } else {
        res.json({ message: "Tour Spot Not Found!" });
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Simple Express Server is Running");
});

app.listen(port, () => {
  console.log("Server has started at port:", port);
});
