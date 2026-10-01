import { AtividadeService } from "../services/atividade.services.js";
import { PrismaClient } from "@prisma/client";

const atividadeService = new AtividadeService();
const prisma = new PrismaClient();

export class AtividadeController {
  async index(req, res) {
    try {
      const companyId = req.user?.company_id || req.query.company_id;
      const userRole = req.user?.role || req.query.role || "EMPLOYEE";

      if (!companyId) {
        res.status(400).json({ error: "company_id não informado." });
        return;
      }

      let userTeamId = req.user?.team_id || req.query.team_id || req.query.teamId;

      if (userRole?.toUpperCase() === "EMPLOYEE" && !userTeamId && req.user?.id) {
        const userBD = await prisma.user.findUnique({
          where: { id: Number(req.user.id) },
          select: { team_id: true },
        });
        userTeamId = userBD?.team_id;
      }

      const { month, year } = req.query;

      const atividades = await atividadeService.listByCompany(
        Number(companyId),
        month ? Number(month) : undefined,
        year ? Number(year) : undefined,
        userRole,
        userTeamId ? Number(userTeamId) : null
      );

      res.json(atividades);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async store(req, res) {
    try {
      const companyId = req.user?.company_id || req.body.company_id;
      const role = req.user?.role || req.body.role || "EMPLOYEE";

      if (!companyId) {
        res.status(400).json({ error: "company_id não informado." });
        return;
      }

      const result = await atividadeService.create(Number(companyId), role, req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || req.body.company_id;
      const role = req.user?.role || req.body.role || "EMPLOYEE";

      const result = await atividadeService.update(
        Number(id),
        Number(companyId),
        role,
        req.body
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || req.query.company_id;
      const role = req.user?.role || req.query.role || "EMPLOYEE";

      await atividadeService.delete(Number(id), Number(companyId), role);
      res.status(204).send();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async complete(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || req.body.company_id;
      const { formResposta } = req.body;

      const result = await atividadeService.complete(
        Number(id),
        Number(companyId),
        formResposta
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}
