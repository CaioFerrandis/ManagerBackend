import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { registerController, loginController, logoutController } from "../controllers/auth.js";
import { authMiddleware } from "../middleware/auth.js";

const prisma = new PrismaClient();
const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.post("/logout", logoutController);

authRoutes.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar dados do usuário." });
  }
});

export default authRoutes;
