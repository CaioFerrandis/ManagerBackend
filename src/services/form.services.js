import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class FormService {
  async listByCompany(companyId) {
    return await prisma.form.findMany({
      where: { company_id: Number(companyId) },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id, companyId) {
    return await prisma.form.findFirst({
      where: {
        id: Number(id),
        company_id: Number(companyId),
      },
    });
  }

  async create(data) {
    return await prisma.form.create({
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration ? Number(data.duration) : 0,
        linkedTo: data.linkedTo,
        questions: data.questions || [],
        company_id: Number(data.company_id || data.companyId),
      },
    });
  }

  async update(id, companyId, data) {
    const exists = await prisma.form.findFirst({
      where: {
        id: Number(id),
        company_id: Number(companyId),
      },
    });

    if (!exists) {
      throw new Error("Formulário não encontrado ou não pertence a esta empresa.");
    }

    return await prisma.form.update({
      where: { id: Number(id) },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.duration !== undefined && { duration: Number(data.duration) }),
        ...(data.linkedTo !== undefined && { linkedTo: data.linkedTo }),
        ...(data.questions && { questions: data.questions }),
      },
    });
  }

  async delete(id, companyId) {
    const exists = await prisma.form.findFirst({
      where: {
        id: Number(id),
        company_id: Number(companyId),
      },
    });

    if (!exists) {
      throw new Error("Formulário não encontrado ou não pertence a esta empresa.");
    }

    return await prisma.form.delete({
      where: { id: Number(id) },
    });
  }
}
