import { fal } from "@fal-ai/client";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const express = require("express");
const cors = require("cors");

require("dotenv").config();

// alternative is to grab api key secrets from environment with:
// console.log(process.env.API_KEY);
fal.config({
  credentials: process.env.API_KEY,
});

const app = express();
app.use(express.json());
app.use(cors());

// single endpoint
app.post("/generate", async (req, res) => {
  const { human_image, garment_image, description } = req.body;
  const result = await fal.subscribe("fal-ai/idm-vton", {
    // example placeholder
    // input: {
    //   human_image_url: "https://idm-vton.github.io/inthewild/4/h/0.jpeg",
    //   garment_image_url: "https://idm-vton.github.io/inthewild/4/c2/c2.jpeg",
    //   description: "Short Sleeve Round Neck T-shirts",
    // },
    // TODO: use images passed from frontend for image sources
    input: {
      human_image_url: human_image,
      garment_image_url: garment_image,
      description: description,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });
  console.log(result.data);
  console.log(result.requestId);
  // image object stores: url, content_type, file_name, file_size, width, height
  res.json({ image: result.data.image });
});

app.listen(3000, () => {
  console.log("app is running on port 3000");
});
