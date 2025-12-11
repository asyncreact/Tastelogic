// src/routes/ai.routes.js
import express from "express";
import {
  iaTopSold,
  iaTodayTop,
  iaTopPredicted,
  iaSeasonTop,
} from "../controllers/ai.controller.js";
import { authenticate, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

/* PÚBLICAS - AI / DASHBOARD */
router.get("/public/top-sold", iaTopSold);
router.get("/public/today-top", iaTodayTop);
router.get("/public/top-predicted", iaTopPredicted);
router.get("/public/season-top", iaSeasonTop);

/* PROTEGIDAS - AI / DASHBOARD (solo admin) */
router.get("/top-sold", authenticate, authorizeRoles("admin"), iaTopSold);
router.get("/today-top", authenticate, authorizeRoles("admin"), iaTodayTop);
router.get("/top-predicted", authenticate, authorizeRoles("admin"), iaTopPredicted);
router.get("/season-top", authenticate, authorizeRoles("admin"), iaSeasonTop);

export default router;
