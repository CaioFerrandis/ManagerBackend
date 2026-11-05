import { Router } from "express";
import { CompanyController } from "../controllers/company.controllers.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const companyController = new CompanyController();

router.use(authMiddleware);

router.get("/theme", (req, res) => companyController.getTheme(req, res));
router.put("/theme", (req, res) => companyController.updateTheme(req, res));

router.get("/:id", (req, res) => companyController.getCompany(req, res));
router.put("/:id", (req, res) => companyController.updateCompany(req, res));

export default router;
