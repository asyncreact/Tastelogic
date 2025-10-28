// src/config/multer.js

import multer from "multer";
import path from "path";
import fs from "fs";

// ============================================================
// 📂 CREAR CARPETAS DE UPLOADS
// ============================================================

const createUploadDirs = () => {
  const dirs = ["./uploads/menu", "./uploads/zones"];
  
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Carpeta creada: ${dir}`);
    }
  });
};

createUploadDirs();

// ============================================================
// 💾 CONFIGURACIÓN DE ALMACENAMIENTO
// ============================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar carpeta según la ruta
    let uploadPath = "./uploads/menu"; // Default

    if (req.originalUrl.includes("/tables/") || req.originalUrl.includes("/zones/")) {
      uploadPath = "./uploads/zones";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp + random + nombre original
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-"); // Sanitizar nombre

    // Determinar prefijo según la ruta
    let prefix = "menu";
    if (req.originalUrl.includes("/tables/") || req.originalUrl.includes("/zones/")) {
      prefix = "zone";
    }

    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

// ============================================================
// 🔍 FILTRO DE ARCHIVOS
// ============================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)"));
  }
};

// ============================================================
// ⚙️ CONFIGURACIÓN DE MULTER
// ============================================================

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1, // Solo 1 archivo por request
  },
  fileFilter: fileFilter,
});

// ============================================================
// 🧹 FUNCIÓN AUXILIAR PARA ELIMINAR IMAGEN ANTERIOR
// ============================================================

/**
 * Elimina una imagen del sistema de archivos
 * @param {string} imageUrl - URL o path de la imagen a eliminar
 */
export const deleteImage = (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Extraer el path relativo de la URL
    const urlParts = imageUrl.split("/uploads/");
    if (urlParts.length < 2) return;

    const imagePath = path.join("./uploads", urlParts[1]);

    // Verificar si el archivo existe antes de eliminarlo
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log(`🗑️ Imagen eliminada: ${imagePath}`);
    }
  } catch (error) {
    console.error("❌ Error al eliminar imagen:", error);
  }
};
