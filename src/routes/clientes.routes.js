import { Router } from "express";
import { ClientController } from "../controllers/clientes.controllers.js";
import { authMiddleware } from "../middleware/auth.js";

const clientesRouter = Router();
const clientController = new ClientController();

clientesRouter.use(authMiddleware);

clientesRouter.get("", clientController.index);
clientesRouter.post("/import", clientController.import);
clientesRouter.put("/:id", clientController.update);
clientesRouter.delete("/batch", clientController.deleteMany);

export default clientesRouter;
