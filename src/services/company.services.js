import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CompanyService {
  async getTheme(companyId) {
    const company = await prisma.company.findUnique({
      where: { id: Number(companyId) },
      select: {
        primary_color: true,
        secondary_color: true,
        button_color: true,
        logo_url: true,
      },
    });

    if (!company) {
      throw new Error("COMPANY_NOT_FOUND");
    }

    return company;
  }

  async updateTheme(companyId, { primaryColor, secondaryColor, buttonColor, logoUrl }) {
    return await prisma.company.update({
      where: { id: Number(companyId) },
      data: {
        ...(primaryColor && { primary_color: primaryColor }),
        ...(secondaryColor && { secondary_color: secondaryColor }),
        ...(buttonColor && { button_color: buttonColor }),
        ...(logoUrl !== undefined && { logo_url: logoUrl }),
      },
    });
  }
}
