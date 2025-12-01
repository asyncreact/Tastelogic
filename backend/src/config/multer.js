// src/config/multer.js

import multer from "multer";
import path from "path";
import fs from "fs";

const createUploadDirs = () => {
  const dirs = ["./uploads/menu", "./uploads/zones"];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Carpeta creada: ${dir}`);
    }
  });
};

createUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "./uploads/menu";

    // Para /api/zones... y /api/tables... usar carpeta de zonas
    if (req.originalUrl.includes("/zones") || req.originalUrl.includes("/tables")) {
      uploadPath = "./uploads/zones";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    let prefix = "menu";
    if (req.originalUrl.includes("/zones") || req.originalUrl.includes("/tables")) {
      prefix = "zone";
    }

    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)"));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: fileFilter,
});

// Elimina una imagen del sistema de archivos
export const deleteImage = (imageUrl) => {
  if (!imageUrl) return;

  try {
    const urlParts = imageUrl.split("/uploads/");
    if (urlParts.length < 2) return;

    const imagePath = path.join("./uploads", urlParts[1]);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`Imagen eliminada: ${imagePath}`);
    }
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
  }
};
