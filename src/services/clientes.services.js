import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ClientService {
  async listByCompany(companyId) {
    const clients = await prisma.key.findMany({
      where: {
        company_id: Number(companyId),
        role: "CLIENT",
        client_info: { isNot: null },
      },
      select: {
        id: true,
        code: true,
        company_id: true,
        status: true,
        client_info: {
          select: {
            id: true,
            key_id: true,
            nome: true,
            documento: true,
            email: true,
            telefone: true,
            endereco: true,
            avatar_url: true,
            agendadas: true,
            concluidas: true,
            canceladas: true,
            ultima_visita: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    return clients;
  }

  async createOne(companyId, dto) {
    const { nome, documento, email, telefone, endereco } = dto;
    const compId = Number(companyId);

    const availableKey = await prisma.key.findFirst({
      where: {
        company_id: compId,
        role: "CLIENT",
        status: "AVAILABLE",
      },
    });

    if (!availableKey) {
      throw new Error(
        "Saldo de chaves insuficiente. Compre mais chaves para cadastrar clientes."
      );
    }

    const updatedKey = await prisma.key.update({
      where: { id: availableKey.id },
      data: {
        status: "IN_USE",
        client_info: {
          create: {
            nome: nome.trim(),
            documento: documento || null,
            email: email || null,
            telefone: telefone || null,
            endereco: endereco || null,
          },
        },
      },
      include: { client_info: true },
    });

    return updatedKey;
  }

  async update(id, companyId, dto) {
    const { nome, documento, email, telefone, endereco, avatarUrl } = dto;

    const keyId = Number(id);
    const compId = Number(companyId);

    const existingKey = await prisma.key.findFirst({
      where: {
        id: keyId,
        company_id: compId,
        role: "CLIENT",
      },
      include: { client_info: true },
    });

    if (!existingKey) {
      throw new Error("CLIENT_NOT_FOUND");
    }

    const updateData = {
      ...(nome && { nome }),
      documento:
        documento !== undefined ? documento : existingKey.client_info?.documento,
      email: email !== undefined ? email : existingKey.client_info?.email,
      telefone:
        telefone !== undefined ? telefone : existingKey.client_info?.telefone,
      endereco:
        endereco !== undefined ? endereco : existingKey.client_info?.endereco,
      ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
    };

    const updatedKey = await prisma.key.update({
      where: { id: keyId },
      data: {
        client_info: {
          upsert: {
            create: {
              nome: nome || "Cliente",
              documento: documento || null,
              email: email || null,
              telefone: telefone || null,
              endereco: endereco || null,
              avatar_url: avatarUrl || null,
            },
            update: updateData,
          },
        },
      },
      include: { client_info: true },
    });

    return updatedKey;
  }

  async importMany(companyId, clients) {
    const compId = Number(companyId);
    const validClients = clients.filter((c) => c.nome);

    if (validClients.length === 0) {
      throw new Error("Nenhum cliente válido para importação.");
    }

    const availableKeys = await prisma.key.findMany({
      where: {
        company_id: compId,
        role: "CLIENT",
        status: "AVAILABLE",
      },
      take: validClients.length,
    });

    if (availableKeys.length < validClients.length) {
      throw new Error(
        `Saldo de chaves insuficiente. Você possui ${availableKeys.length} chave(s) disponível(is), mas o arquivo contém ${validClients.length} cliente(s).`
      );
    }

    const operations = validClients.map((item, index) => {
      const targetKey = availableKeys[index];

      let parsedDate = null;
      if (item.ultimaVisita) {
        if (item.ultimaVisita.includes("/")) {
          const [day, month, year] = item.ultimaVisita.split("/");
          parsedDate = new Date(`${year}-${month}-${day}`);
        } else {
          parsedDate = new Date(item.ultimaVisita);
        }
        if (isNaN(parsedDate.getTime())) parsedDate = null;
      }

      const docClean = item.documento ? String(item.documento).trim() : null;

      return prisma.key.update({
        where: { id: targetKey.id },
        data: {
          status: "IN_USE",
          client_info: {
            create: {
              nome: item.nome,
              documento: docClean,
              agendadas: item.agendadas ?? 0,
              concluidas: item.concluidas ?? 0,
              canceladas: item.canceladas ?? 0,
              ultima_visita: parsedDate,
            },
          },
        },
      });
    });

    await prisma.$transaction(operations);

    return {
      message: "Importação concluída com sucesso",
      count: validClients.length,
    };
  }

  async deleteMany(companyId, clientIds) {
    const ids = clientIds.map(Number);
    const compId = Number(companyId);

    return await prisma.$transaction([
      prisma.clientInfo.deleteMany({
        where: { key_id: { in: ids } },
      }),
      prisma.key.updateMany({
        where: {
          id: { in: ids },
          company_id: compId,
          role: "CLIENT",
        },
        data: {
          status: "AVAILABLE",
        },
      }),
    ]);
  }
}
