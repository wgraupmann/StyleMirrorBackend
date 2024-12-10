import { fal } from "@fal-ai/client";
import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; // ✅ Use v3 SDK only

dotenv.config();

// AWS S3 Client Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const app = express();

// Multer configuration for handling file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// FAL API Configuration
fal.config({
  credentials: process.env.API_KEY,
});

// Function to upload file to S3
const uploadToS3 = async (file, bucketName, keyPrefix) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: `${keyPrefix}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Send PutObjectCommand to AWS S3
    const command = new PutObjectCommand(params);
    const response = await s3.send(command);
    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

    console.log(`✅ Successfully uploaded to S3: ${publicUrl}`);
    return { Location: publicUrl };
  } catch (error) {
    console.error("❌ Error uploading to S3:", error);
    throw error;
  }
};

// Endpoint to handle the submit request
app.post(
  "/submit",
  upload.fields([{ name: "human_image" }, { name: "garment_image" }]),
  async (req, res) => {
    try {
      console.log("📩 Received request to submit images...");
      
      const { description } = req.body;

      // Check if images are present
      if (!req.files || !req.files.human_image || !req.files.garment_image) {
        console.error("❌ Error: Missing images in request");
        return res.status(400).json({ error: "Missing images in request" });
      }

      const humanImage = req.files.human_image[0];
      const garmentImage = req.files.garment_image[0];

      console.log("📤 Uploading human image to S3...");
      const humanImageS3 = await uploadToS3(
        humanImage,
        process.env.S3_BUCKET_NAME,
        "human_images"
      );
      console.log("✅ Uploaded human image:", humanImageS3.Location);

      console.log("📤 Uploading garment image to S3...");
      const garmentImageS3 = await uploadToS3(
        garmentImage,
        process.env.S3_BUCKET_NAME,
        "garment_images"
      );
      console.log("✅ Uploaded garment image:", garmentImageS3.Location);

      const humanImageUrl = humanImageS3.Location;
      const garmentImageUrl = garmentImageS3.Location;

      console.log("📡 Submitting request to FAL API...");
      const { request_id } = await fal.queue.submit("fal-ai/idm-vton", {
        input: {
          human_image_url: humanImageUrl,
          garment_image_url: garmentImageUrl,
          description,
        },
      });

      console.log("✅ Request submitted to FAL API, Request ID:", request_id);
      res.json({ request_id });
    } catch (error) {
      console.error("❌ Error in /submit handler:", error);
      res.status(500).json({ error: "Failed to process request." });
    }
  }
);

// Endpoint to check the status of the request
app.get("/status", async (req, res) => {
  try {
    const { request_id } = req.query;

    if (!request_id) {
      return res.status(400).json({ error: "Missing request_id" });
    }

    console.log("🔄 Checking status of FAL request...");
    const status = await fal.queue.status("fal-ai/idm-vton", {
      requestId: request_id,
    });

    console.log("📡 FAL API Status Response:", status);
    res.json(status);
  } catch (error) {
    console.error("❌ Error fetching status:", error);
    res.status(500).json({ error: "Failed to fetch status." });
  }
});

// Endpoint to fetch the result of the request
app.get("/result", async (req, res) => {
  try {
    const { request_id } = req.query;

    if (!request_id) {
      return res.status(400).json({ error: "Missing request_id" });
    }

    console.log("📡 Fetching result from FAL API...");
    const result = await fal.queue.result("fal-ai/idm-vton", {
      requestId: request_id,
    });

    if (!result || !result.data) {
      console.error("❌ No result returned from FAL API.");
      return res.status(404).json({ error: "No result found for this request_id." });
    }

    console.log("✅ FAL API Result Received:", result.data);
    res.json({ result: result.data.image });
  } catch (error) {
    console.error("❌ Error fetching result:", error);
    res.status(500).json({ error: "Failed to fetch result." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});

