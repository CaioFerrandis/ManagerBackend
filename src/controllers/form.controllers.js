import { FormService } from "../services/form.services.js";

const formService = new FormService();

export class FormController {
  async index(req, res) {
    try {
      const companyId = req.query.company_id
        ? Number(req.query.company_id)
        : req.user?.companyId;

      if (!companyId) {
        res.status(400).json({ error: "company_id é obrigatório." });
        return;
      }

      const forms = await formService.listByCompany(companyId);
      res.json(forms);
    } catch (error) {
      res.status(500).json({ error: error.message || "Erro ao buscar formulários." });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId || Number(req.query.company_id);

      const form = await formService.getById(Number(id), companyId);
      if (!form) {
        res.status(404).json({ error: "Formulário não encontrado." });
        return;
      }

      res.json(form);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async store(req, res) {
    try {
      const { title, description, duration, linkedTo, questions, company_id } = req.body;
      const companyId = company_id || req.user?.companyId;

      if (!title) {
        res.status(400).json({ error: "O título é obrigatório." });
        return;
      }

      if (!companyId) {
        res.status(400).json({ error: "Empresa não identificada." });
        return;
      }

      const form = await formService.create({
        title,
        description,
        duration: Number(duration) || 0,
        linkedTo,
        questions: questions || [],
        companyId: Number(companyId),
      });

      res.status(201).json(form);
    } catch (error) {
      res.status(500).json({ error: error.message || "Erro ao criar formulário." });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, duration, linkedTo, questions, company_id } = req.body;
      const companyId = company_id || req.user?.companyId;

      const updatedForm = await formService.update(Number(id), Number(companyId), {
        title,
        description,
        duration: duration !== undefined ? Number(duration) : undefined,
        linkedTo,
        questions,
      });

      res.json(updatedForm);
    } catch (error) {
      res.status(400).json({ error: error.message || "Erro ao atualizar formulário." });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.query.company_id
        ? Number(req.query.company_id)
        : req.user?.companyId;

      await formService.delete(Number(id), Number(companyId));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message || "Erro ao excluir formulário." });
    }
  }
}
