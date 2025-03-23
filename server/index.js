import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import generalRoutes from "./routes/general.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
// app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
// app.use("/management", managementRoutes);
// app.use("/sales", salesRoutes);

// data import
import User from "./models/User.js";
import { dataUser } from "./data/index.js";

/* MONGOOSE SETUP */
const PORT = 5001 || 8080;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
    // User.insertMany(dataUser);
  })
  .catch((error) => console.log(`${error} did not connect`));
