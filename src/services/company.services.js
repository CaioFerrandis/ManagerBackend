import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CompanyService {
  async getCompany(companyId) {
    const company = await prisma.company.findUnique({
      where: { id: Number(companyId) },
      select: {
        name: true,
        cnpj: true,
        address: true,
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

  async updateCompany(companyId, { name, cnpj, address, primaryColor, secondaryColor, buttonColor, logoUrl }) {
    return await prisma.company.update({
      where: { id: Number(companyId) },
      data: {
        ...(name !== undefined && { name }),
        ...(cnpj !== undefined && { cnpj }),
        ...(address !== undefined && { address }),
        ...(primaryColor !== undefined && { primary_color: primaryColor }),
        ...(secondaryColor !== undefined && { secondary_color: secondaryColor }),
        ...(buttonColor !== undefined && { button_color: buttonColor }),
        ...(logoUrl !== undefined && { logo_url: logoUrl }),
      },
    });
  }
}
