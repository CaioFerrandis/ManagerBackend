import { ClientService } from "../services/clientes.services.js";

const clientService = new ClientService();

export class ClientController {
  async index(req, res) {
    try {
      const companyId = req.user?.company_id || req.query.company_id;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      const clients = await clientService.listByCompany(Number(companyId));
      return res.json(clients);
    } catch (err) {
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

      const updatedClient = await clientService.update(
        Number(id),
        Number(companyId),
        req.body
      );

      return res.json(updatedClient);
    } catch (err) {
      if (err.message === "CLIENT_NOT_FOUND") {
        return res.status(404).json({ error: "Cliente não encontrado nesta empresa." });
      }
      return res.status(400).json({ error: err.message });
    }
  }

  async import(req, res) {
    try {
      const companyId = req.user?.company_id || req.body.company_id;
      const { clients } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      if (!clients || !Array.isArray(clients)) {
        return res.status(400).json({ error: "Lista de clientes inválida." });
      }

      const result = await clientService.importMany(Number(companyId), clients);
      return res.status(201).json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async deleteMany(req, res) {
    try {
      const companyId = req.user?.company_id || req.body.company_id;
      const { ids } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Nenhum cliente selecionado para exclusão." });
      }

      const result = await clientService.deleteMany(Number(companyId), ids);
      return res.json({ message: "Clientes excluídos com sucesso!", count: result.count });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async deleteMany(req, res) {
    try {
      const companyId = req.user?.company_id || req.body.company_id;
      const { ids } = req.body;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Nenhum cliente selecionado para exclusão." });
      }

      const result = await clientService.deleteMany(Number(companyId), ids);
      return res.json({ message: "Clientes excluídos com sucesso!", count: result.count });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}
