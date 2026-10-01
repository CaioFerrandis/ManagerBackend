import * as keysService from "../services/keys.services.js";

export async function getKeys(req, res) {
  try {
    const rawCompanyId = req.user?.company_id || req.user?.companyId || req.user?.id;

    if (!rawCompanyId) {
      return res.status(400).json({ error: "Empresa não informada no token." });
    }

    const companyId = Number(rawCompanyId);

    if (isNaN(companyId)) {
      return res.status(400).json({ error: "ID da empresa é inválido." });
    }

    const keys = await keysService.listKeysByCompany(companyId);
    return res.json(keys);
  } catch (error) {
    console.error("Erro interno em getKeys:", error);
    return res.status(500).json({ error: "Erro ao buscar chaves no servidor." });
  }
}

export async function createKeys(req, res) {
  try {
    const companyId = req.user.company_id || req.user.companyId || req.user.id;
    await keysService.generateCompanyKeys(companyId, req.body);
    return res.status(201).json({ message: "Chaves criadas com sucesso!" });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Erro ao gerar chaves." });
  }
}

export async function removeKey(req, res) {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return res.status(400).json({ error: "ID de chave inválido." });
    }

    await keysService.deleteKeyById(numericId);

    return res.json({ message: "Chave e conta associada revogadas com sucesso." });
  } catch (error) {
    console.error("Erro ao revogar chave/usuário:", error);
    return res.status(500).json({ error: error.message || "Erro ao revogar chave no banco de dados." });
  }
}
