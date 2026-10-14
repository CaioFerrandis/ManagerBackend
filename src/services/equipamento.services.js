import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class EquipamentoService {
  async listByCompany(companyId) {
      const compId = Number(companyId);
      if (isNaN(compId)) throw new Error("ID da empresa inválido.");

      return await prisma.equipamento.findMany({
        where: { company_id: compId },
        select: {
          id: true,
          nome: true,
          key_id: true,
          foto_url: true,
          atributos: true,
          createdAt: true,
          key: {
            select: {
              id: true,
              client_info: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
        orderBy: { id: "desc" },
      });
    }

  async create(companyId, data) {
    const compId = Number(companyId);
    const { nome, keyId, atributos, foto_url } = data;

    if (!nome) throw new Error("O nome do equipamento é obrigatório.");
    if (!keyId) throw new Error("A chave do cliente proprietário é obrigatória.");

    return await prisma.equipamento.create({
      data: {
        nome: String(nome).trim(),
        company_id: compId,
        key_id: Number(keyId),
        foto_url: foto_url || null,
        atributos: Array.isArray(atributos) ? atributos : [],
      },
    });
  }

  async update(id, companyId, data) {
    const equipId = Number(id);
    const compId = Number(companyId);
    const { nome, keyId, atributos, foto_url } = data;

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
        ...(keyId && { key_id: Number(keyId) }),
        ...(foto_url !== undefined && { foto_url: foto_url || null }),
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

  async deleteMany(ids, companyId) {
    const compId = Number(companyId);
    if (isNaN(compId)) throw new Error("ID da empresa inválido.");

    const parsedIds = ids.map((id) => Number(id)).filter((id) => !isNaN(id));
    if (parsedIds.length === 0) throw new Error("Nenhum ID válido informado.");

    const result = await prisma.equipamento.deleteMany({
      where: {
        id: { in: parsedIds },
        company_id: compId,
      },
    });

    return { count: result.count };
  }

  async importMany(companyId, equipments) {
    const compId = Number(companyId);

    if (isNaN(compId)) {
      throw new Error("ID da empresa inválido.");
    }

    const validEquipments = equipments.filter((item) => {
      if (!item.nome) return false;

      const rawAtributos = Array.isArray(item.atributos) ? item.atributos : [];
      const hasVisitMetrics = rawAtributos.some((attr) =>
        ["agendadas", "concluídas", "concluidas", "canceladas", "última visita", "ultima visita"].includes(
          String(attr.chave).toLowerCase()
        )
      );

      return !hasVisitMetrics;
    });

    if (validEquipments.length === 0) {
      throw new Error("Nenhum equipamento válido para importação.");
    }

    const clientKeys = await prisma.key.findMany({
      where: { company_id: compId, role: "CLIENT" },
      include: { client_info: true },
    });

    let availableKeys = await prisma.key.findMany({
      where: { company_id: compId, role: "CLIENT", status: "AVAILABLE" },
    });

    const existingEquipments = await prisma.equipamento.findMany({
      where: { company_id: compId },
    });

    const keysToUpdateInUse = [];
    const equipmentsToCreate = [];
    const equipmentsToUpdate = [];

    const trackedEquipments = [...existingEquipments];

    for (const item of validEquipments) {
      const equipNameClean = String(item.nome).trim();
      const clientNameClean = item.clienteNome ? String(item.clienteNome).trim() : "Cliente Geral";

      let keyRecord = clientKeys.find(
        (k) => k.client_info?.nome?.toLowerCase() === clientNameClean.toLowerCase()
      );

      if (!keyRecord && clientNameClean) {
        keyRecord = clientKeys.find((k) =>
          k.client_info?.nome?.toLowerCase().includes(clientNameClean.toLowerCase())
        );
      }

      if (!keyRecord) {
        if (availableKeys.length === 0) {
          throw new Error(
            `O cliente "${clientNameClean}" não foi encontrado e não há saldo de chaves disponíveis.`
          );
        }

        const keyToUse = availableKeys.shift();

        keysToUpdateInUse.push({
          keyId: keyToUse.id,
          clientName: clientNameClean,
        });

        keyRecord = {
          id: keyToUse.id,
          client_info: { nome: clientNameClean },
        };

        clientKeys.push(keyRecord);
      }

      const atributosJson = Array.isArray(item.atributos) ? item.atributos : [];

      const existingEquip = trackedEquipments.find(
        (eq) =>
          eq.id &&
          eq.key_id === keyRecord.id &&
          eq.nome.toLowerCase() === equipNameClean.toLowerCase()
      );

      if (existingEquip) {
        equipmentsToUpdate.push({
          id: existingEquip.id,
          atributos: atributosJson,
        });
      } else {
        const newRecord = {
          nome: equipNameClean,
          company_id: compId,
          key_id: keyRecord.id,
          atributos: JSON.stringify(atributosJson),
        };

        equipmentsToCreate.push(newRecord);

        trackedEquipments.push({
          ...newRecord,
          atributos: atributosJson,
        });
      }
    }

    const operations = [];

    for (const item of keysToUpdateInUse) {
      operations.push(
        prisma.key.update({
          where: { id: item.keyId },
          data: {
            status: "IN_USE",
            client_info: {
              create: { nome: item.clientName },
            },
          },
        })
      );
    }

    if (equipmentsToCreate.length > 0) {
      operations.push(
        prisma.equipamento.createMany({
          data: equipmentsToCreate,
        })
      );
    }

    for (const item of equipmentsToUpdate) {
      operations.push(
        prisma.equipamento.update({
          where: { id: item.id },
          data: { atributos: item.atributos },
        })
      );
    }

    await prisma.$transaction(operations);

    return {
      message: "Importação realizada com sucesso",
      count: validEquipments.length,
    };
  }
}
