import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getKeys, createKeys, removeKey } from "../controllers/keys.controllers.js";

const keysRoutes = Router();

keysRoutes.use(authMiddleware);

keysRoutes.get("/", getKeys);
keysRoutes.post("/", createKeys);
keysRoutes.delete("/:id", removeKey);

export default keysRoutes;
