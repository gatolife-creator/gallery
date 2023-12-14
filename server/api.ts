import { Router } from "express";
import path from "path";
import fs from "fs";
import sizeOf from "image-size";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (_1, _2, cb) => {
    cb(null, "images/"); // 画像の保存先ディレクトリ
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export const router = Router();

router.get("/api/images", (_, res) => {
  const imagesDir = path.join(__dirname, "images");

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".tif",
    ".tiff",
    ".webp",
  ];

  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server Error");
    } else {
      const images = files
        .filter((file) => {
          const ext = path.extname(file).toLowerCase();
          return imageExtensions.includes(ext);
        })
        .map((file) => {
          const src = `/images/${file}`;
          const dimensions = sizeOf(path.join(imagesDir, file));

          return {
            src,
            width: dimensions.width,
            height: dimensions.height,
          };
        });

      res.json(images);
    }
  });
});

router.get("/api/images", (_, res) => {
  const imagesDir = path.join(__dirname, "images");

  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server Error");
    } else {
      const images = files.map((file) => {
        const src = `/images/${file}`;
        const dimensions = sizeOf(path.join(imagesDir, file));

        return {
          src,
          width: dimensions.width,
          height: dimensions.height,
        };
      });

      res.json(images);
    }
  });
});

router.post("/api/upload", upload.array("image"), (req, res) => {
  const imagesDir = path.join(__dirname, "images");
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach((file: any) => {
      if (fs.existsSync(path.join(imagesDir, file.originalname))) {
        res.status(400).send({
          message: "There are already files with the same name.",
          error: "File already exists",
        });
        return;
      }
    });
  }
  try {
    res.send({ message: "The image has been uploaded." });
  } catch (error) {
    res.status(400).send({
      message: "An error occurred while uploading the image.",
      error: error,
    });
  }
});

router.delete("/api/images/:filename", (req, res) => {
  const imagesDir = path.join(__dirname, "images");
  const targetFile = path.join(imagesDir, req.params.filename);

  fs.unlink(targetFile, (err) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .send({
          message: "An error occurred while deleting the image.",
          error: err,
        });
    } else {
      res.send({ message: "The image has been deleted normally." });
    }
  });
});
