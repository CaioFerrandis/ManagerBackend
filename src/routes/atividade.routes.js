import { Router } from "express";
import { AtividadeController } from "../controllers/atividade.controllers.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const controller = new AtividadeController();

router.use(authMiddleware);

router.get("/", controller.index);
router.post("/", controller.store);
router.put("/:id", controller.update);
router.delete("/:id", controller.destroy);
router.patch("/:id/complete", controller.complete);

export default router;
