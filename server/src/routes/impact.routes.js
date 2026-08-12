import { Router } from "express";
import { getImpact } from "../controllers/impact.controller.js";

const router = Router();

router.get("/", getImpact); // public — impact dashboard

export default router;
