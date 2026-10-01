import { EquipamentoService } from "../services/equipamento.services.js";

const equipamentoService = new EquipamentoService();

export class EquipamentoController {
  async index(req, res) {
    try {
      const companyId = req.user?.company_id || req.query.company_id;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      const equipamentos = await equipamentoService.listByCompany(Number(companyId));
      return res.json(equipamentos);
    } catch (err) {
      console.error("Erro em EquipamentoController.index:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  async store(req, res) {
    try {
      const companyId = req.user?.company_id || req.body.company_id;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      const equipamento = await equipamentoService.create(Number(companyId), req.body);
      return res.status(201).json(equipamento);
    } catch (err) {
      console.error("Erro em EquipamentoController.store:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || req.body.company_id;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      const equipamento = await equipamentoService.update(
        Number(id),
        Number(companyId),
        req.body
      );

      return res.json(equipamento);
    } catch (err) {
      console.error("Erro em EquipamentoController.update:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user?.company_id || req.query.company_id;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      await equipamentoService.delete(Number(id), Number(companyId));
      return res.status(204).send();
    } catch (err) {
      console.error("Erro em EquipamentoController.destroy:", err);
      return res.status(400).json({ error: err.message });
    }
  }

  async import(req, res) {
    try {
      const companyId = req.user?.company_id || req.body.company_id;
      const { equipments } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      if (!equipments || !Array.isArray(equipments) || equipments.length === 0) {
        return res.status(400).json({ error: "Lista de equipamentos inválida ou vazia." });
      }

      const result = await equipamentoService.importMany(Number(companyId), equipments);
      return res.status(201).json(result);
    } catch (err) {
      console.error("Erro em EquipamentoController.import:", err);
      return res.status(500).json({ error: err.message || "Erro interno ao importar equipamentos." });
    }
  }
}
