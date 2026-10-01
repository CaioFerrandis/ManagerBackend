import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ClientService {
  async listByCompany(companyId) {
    const clients = await prisma.user.findMany({
      where: {
        company_id: Number(companyId),
        role: "CLIENT",
      },
      select: {
        id: true,
        key: true,
        company_id: true,
        name: true,
        client_info: {
          select: {
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

  async update(id, companyId, dto) {
    const { nome, documento, email, telefone, endereco, avatarUrl } = dto;

    const clientId = Number(id);
    const compId = Number(companyId);

    const existingUser = await prisma.user.findFirst({
      where: {
        id: clientId,
        company_id: compId,
        role: "CLIENT",
      },
      include: { client_info: true },
    });

    if (!existingUser) {
      throw new Error("CLIENT_NOT_FOUND");
    }

    const updateData = {
      ...(nome && { nome }),
      documento: documento !== undefined ? documento : existingUser.client_info?.documento,
      email: email !== undefined ? email : existingUser.client_info?.email,
      telefone: telefone !== undefined ? telefone : existingUser.client_info?.telefone,
      endereco: endereco !== undefined ? endereco : existingUser.client_info?.endereco,
      ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
    };

    const updatedUser = await prisma.user.update({
      where: { id: clientId },
      data: {
        ...(nome && { name: nome }),
        client_info: {
          upsert: {
            create: {
              nome: nome || existingUser.name || "Cliente",
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
      include: {
        client_info: true,
      },
    });

    return updatedUser;
  }

  async importMany(companyId, clients) {
    const results = [];

    for (const item of clients) {
      if (!item.nome) continue;

      const docClean = item.documento ? String(item.documento).trim() : null;

      const whereConditions = [
        { client_info: { nome: { equals: item.nome, mode: "insensitive" } } },
        { name: { equals: item.nome, mode: "insensitive" } },
      ];

      if (docClean) {
        whereConditions.push({ client_info: { documento: docClean } });
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          company_id: Number(companyId),
          role: "CLIENT",
          OR: whereConditions,
        },
        include: { client_info: true },
      });

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

      if (existingUser) {
        const updated = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: item.nome,
            client_info: {
              upsert: {
                create: {
                  nome: item.nome,
                  documento: docClean,
                  agendadas: item.agendadas ?? 0,
                  concluidas: item.concluidas ?? 0,
                  canceladas: item.canceladas ?? 0,
                  ultima_visita: parsedDate,
                },
                update: {
                  nome: item.nome,
                  ...(docClean ? { documento: docClean } : {}),
                  agendadas: item.agendadas ?? existingUser.client_info?.agendadas ?? 0,
                  concluidas: item.concluidas ?? existingUser.client_info?.concluidas ?? 0,
                  canceladas: item.canceladas ?? existingUser.client_info?.canceladas ?? 0,
                  ...(parsedDate ? { ultima_visita: parsedDate } : {}),
                },
              },
            },
          },
          include: { client_info: true },
        });
        results.push(updated);
      } else {
        const created = await prisma.user.create({
          data: {
            company_id: Number(companyId),
            role: "CLIENT",
            name: item.nome,
            key: `CLI-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
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
          include: { client_info: true },
        });
        results.push(created);
      }
    }

    return { message: "Importação concluída com sucesso", count: results.length };
  }

  async deleteMany(companyId, clientIds) {
    return await prisma.user.deleteMany({
      where: {
        id: { in: clientIds.map(Number) },
        company_id: Number(companyId),
        role: "CLIENT",
      },
    });
  }
}
