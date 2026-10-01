import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getTeamsService(company_id) {
  const where = company_id ? { company_id: Number(company_id) } : {};

  return await prisma.team.findMany({
    where,
    include: {
      members: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
}

export async function createTeamService({ name, company_id }) {
  return await prisma.team.create({
    data: {
      name,
      company_id: company_id ? Number(company_id) : null,
    },
  });
}

export async function updateTeamNameService(teamId, newName) {
  return await prisma.team.update({
    where: { id: Number(teamId) },
    data: { name: newName },
  });
}

export async function deleteTeamService(teamId) {
  const numericId = Number(teamId);

  await prisma.user.updateMany({
    where: { team_id: numericId },
    data: { team_id: null },
  });

  return await prisma.team.delete({
    where: { id: numericId },
  });
}
