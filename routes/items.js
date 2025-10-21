import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();
const router = express.Router();

// 🔹 Supabase client setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 🔹 Multer config – save both in memory (for Supabase) & locally
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// 🔹 Get all items
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("id", { ascending: false });

  if (error) return res.status(400).json({ message: error.message });
  res.json(data);
});

// 🔹 Upload route – saves locally + in Supabase
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name || !file) {
      return res.status(400).json({ message: "Name and file are required" });
    }

    // Local file path
    const localFilePath = path.join("uploads", file.filename);
    const fileBuffer = fs.readFileSync(localFilePath);

    // Upload to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("uploads") // bucket name
      .upload(file.filename, fileBuffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get Supabase public URL
    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(file.filename);
    const fileUrl = urlData.publicUrl;

    // Save file info in items table
    const { error: dbError } = await supabase
      .from("items")
      .insert([{ name, fileUrl }]);
    if (dbError) throw dbError;

    // ✅ Respond with both paths
    res.json({
      message: "Upload successful!",
      supabaseUrl: fileUrl,
      localPath: localFilePath,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Get the fileUrl from Supabase table first
    const { data: itemData, error: fetchError } = await supabase
      .from("items")
      .select("fileUrl")
      .eq("id", id)
      .single(); // get single record

    if (fetchError) throw fetchError;
    if (!itemData) return res.status(404).json({ message: "Item not found" });

    const fileUrl = itemData.fileUrl;
    const fileName = fileUrl.split("/").pop(); // get filename from URL

    // 2️⃣ Delete from Supabase storage
    const { error: storageError } = await supabase
      .storage
      .from("uploads")
      .remove([fileName]);
    if (storageError) console.warn("Supabase delete warning:", storageError.message);

    // 3️⃣ Delete local file
    const localFilePath = `uploads/${fileName}`;
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    // 4️⃣ Delete from items table
    const { error: dbError } = await supabase
      .from("items")
      .delete()
      .eq("id", id);
    if (dbError) throw dbError;

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
