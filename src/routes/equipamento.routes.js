import { Router } from "express";
import { EquipamentoController } from "../controllers/equipamento.controllers.js";
import { authMiddleware } from "../middleware/auth.js";

const equipamentoRoutes = Router();
const equipamentoController = new EquipamentoController();

equipamentoRoutes.use(authMiddleware);

equipamentoRoutes.get("/", equipamentoController.index);
equipamentoRoutes.post("/", equipamentoController.store);

equipamentoRoutes.post("/import", equipamentoController.import);

equipamentoRoutes.put("/:id", equipamentoController.update);
equipamentoRoutes.delete("/:id", equipamentoController.destroy);

export default equipamentoRoutes;
