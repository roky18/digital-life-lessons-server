const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const stripe = require("stripe")(process.env.STRIPE_KEY);

const port = process.env.PORT || 3000;

// MiddleWare--->
app.use(express.json());
app.use(cors());
// MiddleWare---<

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wxnpgmj.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("digital_life_lessons_db");
    const usersCollection = db.collection("users");
    const lessonCollection = db.collection("lesson");
    const reportsCollection = db.collection("lessonsReports");

    //User Related API---->>>
    app.post("/users", async (req, res) => {
      const user = req.body;
      user.role = "user";
      user.accessLevel = "free";
      user.createdAt = new Date();

      const email = user.email;
      const userExists = await usersCollection.findOne({ email });

      if (userExists) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const query = {};
      const { email } = req.query;
      if (email) {
        query.email = email;
      }
      const option = { sort: { createdAt: -1 } };
      const cursor = usersCollection.find(query, option);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/users/email/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      res.send(result);
    });

    // after payment--->
    app.patch("/users/make-premium/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const update = {
        $set: {
          accessLevel: "premium",
        },
      };
      const result = await usersCollection.updateOne(query, update);
      res.send(result);
    });
    // after payment---<

    //User Related API----<<<

    // Lesson Related API---->>>
    app.get("/lessons", async (req, res) => {
      const query = {};
      const { email } = req.query;
      if (email) {
        query.lessonerEmail = email;
      }

      const option = { sort: { createdAt: -1 } };
      const cursor = lessonCollection.find(query, option);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/lessons/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await lessonCollection.findOne(query);
      res.send(result);
    });

    app.post("/lessons", async (req, res) => {
      const lesson = {
        ...req.body,
        createdAt: new Date(),
      };
      const result = await lessonCollection.insertOne(lesson);
      return res.send(result);
    });

    app.patch("/lessons/:id", async (req, res) => {
      const id = req.params.id;
      const updatedLesson = req.body;
      const query = { _id: new ObjectId(id) };
      const update = { $set: updatedLesson };
      const result = await lessonCollection.updateOne(query, update);
      res.send(result);
    });

    // likee---->>
    app.patch("/lessons/like/:id", async (req, res) => {
      const id = req.params.id;
      const userEmail = req.body.email;

      const lesson = await lessonCollection.findOne({ _id: new ObjectId(id) });

      let update = {};
      if (!lesson.likes.includes(userEmail)) {
        update = {
          $push: { likes: userEmail },
          $inc: { likesCount: 1 },
        };
      } else {
        update = {
          $pull: { likes: userEmail },
          $inc: { likesCount: -1 },
        };
      }
      const result = await lessonCollection.updateOne(
        { _id: new ObjectId(id) },
        update
      );
      res.send(result);
    });

    app.delete("/lessons/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await lessonCollection.deleteOne(query);
      res.send(result);
    });

    // favorite----->>
    app.patch("/lessons/favorite/:id", async (req, res) => {
      const id = req.params.id;
      const userEmail = req.body.email;

      const lesson = await lessonCollection.findOne({ _id: new ObjectId(id) });

      let update = {};
      if (!lesson.favorites.includes(userEmail)) {
        update = {
          $push: { favorites: userEmail },
          $inc: { favoriteCount: 1 },
        };
      } else {
        update = {
          $pull: { favorites: userEmail },
          $inc: { favoriteCount: -1 },
        };
      }
      const result = await lessonCollection.updateOne(
        { _id: new ObjectId(id) },
        update
      );

      res.send(result);
    });

    // coment----->>>
    app.patch("/lessons/comment/:id", async (req, res) => {
      const id = req.params.id;
      const comment = req.body;
      const result = await lessonCollection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { comments: comment } }
      );

      res.send(result);
    });

    // Lesson Related API----<<<
    // Report Related API---->>>
    app.post("/report", async (req, res) => {
      try {
        const { lessonId, reporterUserId, reason, message } = req.body;

        if (!lessonId || !reporterUserId || !reason) {
          return res.status(400).send({
            message: "lessonId, reporterUserId and reason are required",
          });
        }

        const report = {
          lessonId,
          reporterUserId,
          reason,
          message: message || "",
          timestamp: new Date(),
        };

        const result = await reportsCollection.insertOne(report);

        res.send({
          success: true,
          message: "Report submitted successfully!",
          reportId: result.insertedId,
        });
      } catch (error) {
        console.error("Report Error:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal Server Error" });
      }
    });

    // Report Related API----<<<

    // Stripe Related API---->>>
    app.post("/create-checkout-session", async (req, res) => {
      const paymentInfo = req.body;
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "USD",
              unit_amount: 150000,
              product_data: {
                name: paymentInfo.userName,
              },
            },
            quantity: 1,
          },
        ],
        customer_email: paymentInfo.userEmail,
        mode: "payment",
        metadata: {
          userId: paymentInfo.userId,
        },
        success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success?email=${paymentInfo.userEmail}`,

        cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-canceled`,
      });
      console.log(session);
      res.send({ url: session.url });
    });

    // Stripe Related API----<<<

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Digital Life Lessoning.........!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
