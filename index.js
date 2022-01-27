const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

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

    // GET API - Single blog Details
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const blogDetails = await blogCollection.findOne(query);
      res.json(blogDetails);
    });

    // POST - Add a tour blog
    app.post("/addblog", async (req, res) => {
      // Extract image data and convert it to binary base 64
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      // Extract other information and make our blog object including image for saveing into MongoDB
      const {
        title,
        details,
        expense,
        location,
        rating,
        date,
        writer,
        status,
        email,
      } = req.body;
      const blog = {
        title,
        details: details.split("\n"),
        image: imageBuffer,
        expense,
        location,
        rating,
        date,
        writer,
        status,
        email,
      };
      const result = await blogCollection.insertOne(blog);
      res.json(result);
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

    // GET API - Single Top Tour Spot Details
    app.get("/top-spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const spotDetails = await topSpotCollection.findOne(query);
      res.json(spotDetails);
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
