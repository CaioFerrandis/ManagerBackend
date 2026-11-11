import { CompanyService } from "../services/company.services.js";

const companyService = new CompanyService();

export class CompanyController {
  async getTheme(req, res) {
    try {
      const companyId = req.user?.company_id || req.query.company_id;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      const theme = await companyService.getTheme(companyId);
      return res.json(theme);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async updateTheme(req, res) {
    try {
      if (req.user?.role?.toUpperCase() !== "OWNER") {
        return res.status(403).json({ error: "Apenas o dono da empresa pode alterar o tema visual." });
      }

      const companyId = req.user?.company_id || req.body.company_id;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      const updatedCompany = await companyService.updateTheme(companyId, req.body);

      return res.json({
        message: "Tema atualizado com sucesso!",
        theme: updatedCompany,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async getCompany(req, res) {
    try {
      const companyId = req.user?.company_id || req.query.company_id;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      const company = await companyService.getCompany(companyId);
      return res.json(company);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async updateCompany(req, res) {
    try {
      if (req.user?.role?.toUpperCase() !== "OWNER") {
        return res.status(403).json({ error: "Apenas o dono da empresa pode alterar os dados corporativos." });
      }

      const companyId = req.user?.company_id || req.params.id || req.body.company_id;

      if (!companyId) {
        return res.status(400).json({ error: "company_id não informado." });
      }

      const updatedCompany = await companyService.updateCompany(companyId, req.body);

      return res.json({
        message: "Dados da empresa atualizados com sucesso!",
        company: updatedCompany,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}
