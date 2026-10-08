import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class EquipamentoService {
  async listByCompany(companyId) {
    const compId = Number(companyId);
    if (isNaN(compId)) throw new Error("ID da empresa inválido.");

    return await prisma.equipamento.findMany({
      where: { company_id: compId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            client_info: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });
  }

  async create(companyId, data) {
    const compId = Number(companyId);
    const { nome, clienteId, atributos, foto_url } = data; // 👈 foto_url adicionado

    if (!nome) throw new Error("O nome do equipamento é obrigatório.");
    if (!clienteId) throw new Error("O cliente proprietário é obrigatório.");

    return await prisma.equipamento.create({
      data: {
        nome: String(nome).trim(),
        company_id: compId,
        client_id: Number(clienteId),
        foto_url: foto_url || null, // 👈 Persiste a foto no banco
        atributos: Array.isArray(atributos) ? atributos : [],
      },
    });
  }

  async update(id, companyId, data) {
    const equipId = Number(id);
    const compId = Number(companyId);
    const { nome, clienteId, atributos, foto_url } = data; // 👈 foto_url adicionado

    const existing = await prisma.equipamento.findFirst({
      where: { id: equipId, company_id: compId },
    });

    if (!existing) {
      throw new Error("Equipamento não encontrado.");
    }

    return await prisma.equipamento.update({
      where: { id: equipId },
      data: {
        ...(nome && { nome: String(nome).trim() }),
        ...(clienteId && { client_id: Number(clienteId) }),
        ...(foto_url !== undefined && { foto_url: foto_url || null }), // 👈 Atualiza a foto (aceita null para remover)
        ...(atributos && { atributos: Array.isArray(atributos) ? atributos : [] }),
      },
    });
  }

  async delete(id, companyId) {
    const equipId = Number(id);
    const compId = Number(companyId);

    const existing = await prisma.equipamento.findFirst({
      where: { id: equipId, company_id: compId },
    });

    if (!existing) {
      throw new Error("Equipamento não encontrado.");
    }

    return await prisma.equipamento.delete({
      where: { id: equipId },
    });
  }

  async importMany(companyId, equipments) {
    const results = [];
    const compId = Number(companyId);

    if (isNaN(compId)) {
      throw new Error("ID da empresa inválido.");
    }

    for (const item of equipments) {
      if (!item.nome) continue;

      const equipNameClean = String(item.nome).trim();
      const clientNameClean = item.clienteNome ? String(item.clienteNome).trim() : "Cliente Geral";

      let client = await prisma.user.findFirst({
        where: {
          company_id: compId,
          role: "CLIENT",
          OR: [
            { client_info: { nome: { equals: clientNameClean, mode: "insensitive" } } },
            { name: { equals: clientNameClean, mode: "insensitive" } },
          ],
        },
      });

      if (!client && clientNameClean) {
        client = await prisma.user.findFirst({
          where: {
            company_id: compId,
            role: "CLIENT",
            OR: [
              { client_info: { nome: { contains: clientNameClean, mode: "insensitive" } } },
              { name: { contains: clientNameClean, mode: "insensitive" } },
            ],
          },
        });
      }

      if (!client) {
        client = await prisma.user.create({
          data: {
            company_id: compId,
            role: "CLIENT",
            name: clientNameClean,
            key: `CLI-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            client_info: {
              create: {
                nome: clientNameClean,
              },
            },
          },
        });
      }

      const atributosJson = Array.isArray(item.atributos) ? item.atributos : [];

      const existingEquip = await prisma.equipamento.findFirst({
        where: {
          company_id: compId,
          client_id: client.id,
          nome: { equals: equipNameClean, mode: "insensitive" },
        },
      });

      if (existingEquip) {
        const updated = await prisma.equipamento.update({
          where: { id: existingEquip.id },
          data: {
            atributos: atributosJson,
          },
        });
        results.push(updated);
      } else {
        const created = await prisma.equipamento.create({
          data: {
            nome: equipNameClean,
            company_id: compId,
            client_id: client.id,
            atributos: atributosJson,
          },
        });
        results.push(created);
      }
    }

    return { message: "Importação realizada com sucesso", count: results.length };
  }
}
