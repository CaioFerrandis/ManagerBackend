import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AtividadeService {
  async listByCompany(companyId, month, year, userRole, userTeamId) {
    const whereConditions = {
      company_id: Number(companyId),
    };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      whereConditions.data = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (userRole?.toUpperCase() === "EMPLOYEE") {
      const parsedTeamId = userTeamId ? Number(userTeamId) : null;

      whereConditions.AND = [
        {
          OR: [
            { team_id: null },
            ...(parsedTeamId && !isNaN(parsedTeamId) ? [{ team_id: parsedTeamId }] : []),
          ],
        },
      ];
    }

    return await prisma.atividade.findMany({
      where: whereConditions,
      include: {
        team: { select: { id: true, name: true } },
        form: { select: { id: true, title: true, questions: true } },
        client: { select: { id: true, name: true } },
        equipment: { select: { id: true, nome: true } },
      },
      orderBy: [{ data: "asc" }, { horario: "asc" }],
    });
  }

  async create(companyId, userRole, dto) {
    if (userRole?.toUpperCase() === "EMPLOYEE") {
      throw new Error("Apenas proprietários e gerentes podem criar atividades.");
    }

    const {
      titulo,
      descricao,
      horario,
      data,
      equipeId,
      formId,
      clientId,
      equipmentId,
      isRecurrent,
      recurrentDays,
      recurrentMonths = 1,
    } = dto;

    if (!clientId) {
      throw new Error("O cliente é obrigatório para criar a atividade.");
    }

    const baseData = {
      titulo,
      descricao,
      horario,
      company_id: Number(companyId),
      team_id: equipeId ? Number(equipeId) : null,
      form_id: formId ? Number(formId) : null,
      client_id: Number(clientId),
      equipment_id: equipmentId ? Number(equipmentId) : null,
      cor: equipeId ? "bg-purple-500" : "bg-blue-500",
      status: "PENDENTE",
    };

    if (!isRecurrent || !recurrentDays || recurrentDays.length === 0) {
      return await prisma.atividade.create({
        data: {
          ...baseData,
          data: new Date(data),
        },
        include: {
          team: { select: { id: true, name: true } },
          client: { select: { id: true, name: true } },
          equipment: { select: { id: true, nome: true } },
        },
      });
    }

    const startDate = new Date(`${data}T00:00:00`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Number(recurrentMonths));

    const recordsToCreate = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      if (recurrentDays.includes(current.getDay())) {
        recordsToCreate.push({
          ...baseData,
          data: new Date(current),
        });
      }
      current.setDate(current.getDate() + 1);
    }

    return await prisma.atividade.createMany({
      data: recordsToCreate,
    });
  }

  async update(id, companyId, userRole, dto) {
    if (userRole?.toUpperCase() === "EMPLOYEE") {
      throw new Error("Apenas proprietários e gerentes podem atualizar atividades.");
    }

    const dataToUpdate = { ...dto };

    if (dto.data) {
      dataToUpdate.data = new Date(dto.data);
    }
    if (dto.equipeId !== undefined) {
      dataToUpdate.team_id = dto.equipeId ? Number(dto.equipeId) : null;
      delete dataToUpdate.equipeId;
    }
    if (dto.formId !== undefined) {
      dataToUpdate.form_id = dto.formId ? Number(dto.formId) : null;
      delete dataToUpdate.formId;
    }
    if (dto.clientId !== undefined) {
      if (!dto.clientId) {
        throw new Error("O cliente não pode ser nulo.");
      }
      dataToUpdate.client_id = Number(dto.clientId);
      delete dataToUpdate.clientId;
    }
    if (dto.equipmentId !== undefined) {
      dataToUpdate.equipment_id = dto.equipmentId ? Number(dto.equipmentId) : null;
      delete dataToUpdate.equipmentId;
    }

    delete dataToUpdate.company_id;
    delete dataToUpdate.role;

    return await prisma.atividade.updateMany({
      where: { id: Number(id), company_id: Number(companyId) },
      data: dataToUpdate,
    });
  }

  async delete(id, companyId, userRole) {
    if (userRole?.toUpperCase() === "EMPLOYEE") {
      throw new Error("Apenas proprietários e gerentes podem excluir atividades.");
    }

    return await prisma.atividade.deleteMany({
      where: { id: Number(id), company_id: Number(companyId) },
    });
  }

  async complete(id, companyId, formResposta) {
    return await prisma.atividade.updateMany({
      where: { id: Number(id), company_id: Number(companyId) },
      data: {
        status: "CONCLUIDA",
        form_resposta: formResposta,
      },
    });
  }
}
