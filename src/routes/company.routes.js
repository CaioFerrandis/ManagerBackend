import { Router } from "express";
import { CompanyController } from "../controllers/company.controllers.js";
import { authMiddleware } from "../middleware/auth.js";

const companyRouter = Router();
const companyController = new CompanyController();

companyRouter.use(authMiddleware);

companyRouter.get("/theme", companyController.getTheme);
companyRouter.put("/theme", companyController.updateTheme);

export default companyRouter;
