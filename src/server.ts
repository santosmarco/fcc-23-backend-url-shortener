import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { handleRedirectToShortenedUrl, handleShortenUrl } from "./api";

dotenv.config();

const { PORT } = process.env;

const app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

app.use(bodyParser.urlencoded({ extended: true }));

// http://expressjs.com/en/starter/static-files.html
app.use("/public", express.static(`${process.cwd()}/public`));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (_, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.post("/api/shorturl", handleShortenUrl);
app.get("/api/shorturl/:url", handleRedirectToShortenedUrl);

// listen for requests :)
app.listen(PORT, function () {
  console.log(`Your app is listening on port ${PORT}`);
});
