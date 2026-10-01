import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function listKeysByCompany(companyId) {
  return await prisma.key.findMany({
    where: {
      company_id: Number(companyId),
    },
    orderBy: {
      id: "desc",
    },
  });
}

export async function generateCompanyKeys(companyId, { newManagers, newEmployees, newClients }) {
  const keysToCreate = [];
  const numericCompanyId = Number(companyId);

  const generateCode = (prefix) => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `KEY-${prefix}-${rand}`;
  };

  for (let i = 0; i < newManagers; i++) {
    keysToCreate.push({
      company_id: numericCompanyId,
      code: generateCode("MGR"),
      role: "MANAGER",
      status: "AVAILABLE",
      bound_user: "-",
    });
  }

  for (let i = 0; i < newEmployees; i++) {
    keysToCreate.push({
      company_id: numericCompanyId,
      code: generateCode("EMP"),
      role: "EMPLOYEE",
      status: "AVAILABLE",
      bound_user: "-",
    });
  }

  for (let i = 0; i < newClients; i++) {
    keysToCreate.push({
      company_id: numericCompanyId,
      code: generateCode("CLI"),
      role: "CLIENT",
      status: "AVAILABLE",
      bound_user: "-",
    });
  }

  if (keysToCreate.length === 0) {
    throw new Error("Nenhuma chave solicitada.");
  }

  return await prisma.key.createMany({ data: keysToCreate });
}

export async function deleteKeyById(id) {
  const numericId = Number(id);

  const existingKey = await prisma.key.findUnique({
    where: { id: numericId },
  });

  if (!existingKey) {
    throw new Error("Chave não encontrada.");
  }

  return await prisma.$transaction(async (tx) => {
    if (existingKey.bound_user && existingKey.bound_user !== "-") {
      await tx.user.deleteMany({
        where: { email: existingKey.bound_user },
      });
    }

    const deletedKey = await tx.key.delete({
      where: { id: numericId },
    });

    return deletedKey;
  });
}
