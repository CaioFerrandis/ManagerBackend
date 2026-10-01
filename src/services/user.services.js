import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getUsersService(company_id) {
  const where = company_id ? { company_id: Number(company_id) } : {};

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      role: true,
      team_id: true,
      company_id: true,
      avatar_url: true,
    },
  });
}

export async function updateUserTeamService(userId, team_id) {
  return await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      team_id: team_id ? Number(team_id) : null,
    },
  });
}

export async function updateProfileService(userId, { name, avatarUrl }) {
  return await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      ...(name && { name }),
      ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar_url: true,
      company_id: true,
    },
  });
}
