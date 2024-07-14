const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const colors = require("colors");
const connectDB = require("./config/db");
const userRoute = require("./routes/user");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://2fa-form.netlify.app"],
    credentials: true,
  })
);

//Routes
app.use("/api/v1/users", userRoute);

app.get("/", (req, res) => {
  res.send("HELLO WORLD :{)");
});

//Error Middleware
app.use(errorHandler);
app.use(notFound);

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  connectDB();
  console.log(
    `Server running on port ${"http://localhost:" + PORT}`.green.underline.bold
  );
});
