import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function registerServices({ name, email, password, accountType, companyName, key }) {
  const userExists = await prisma.user.findUnique({ where: { email } });

  if (userExists) {
    throw new Error('E-mail já cadastrado.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.$transaction(async (tx) => {
    if (accountType === 'company') {
      if (!companyName) {
        throw new Error('Nome da empresa é obrigatório para cadastrar como empresa.');
      }

      const newCompany = await tx.company.create({
        data: {
          name: companyName,
        },
      });

      const ownerKey = `OWNER-${Date.now()}`;

      const user = await tx.user.create({
        data: {
          name,
          email,
          hash_password: hashedPassword,
          role: 'OWNER',
          company_name: companyName,
          company_id: newCompany.id,
          key: ownerKey,
        },
      });

      await tx.company.update({
        where: { id: newCompany.id },
        data: { owner: name },
      });

      return user;

    } else if (accountType === 'invite') {
      if (!key) {
        throw new Error('Chave de convite é obrigatória.');
      }

      const normalizedKey = key.trim().replace(/\s+/g, '');

      const validKey = await tx.key.findUnique({
        where: { code: normalizedKey },
      });

      if (!validKey || validKey.status === 'USED') {
        throw new Error('Chave de convite inválida, inexistente ou já utilizada.');
      }

      const company = await tx.company.findUnique({
        where: { id: validKey.company_id },
      });

      if (!company) {
        throw new Error('Empresa associada à chave não foi encontrada.');
      }

      const user = await tx.user.create({
        data: {
          name,
          email,
          hash_password: hashedPassword,
          role: validKey.role,
          company_name: company.name,
          company_id: company.id,
          key: validKey.code,
        },
      });

      await tx.key.update({
        where: { id: validKey.id },
        data: { 
          status: 'USED',
          bound_user: user.email
        },
      });

      return user;

    } else {
      throw new Error('Tipo de conta inválido.');
    }
  });

  const { hash_password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}
export async function loginServices(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('Credenciais inválidas.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.hash_password);

  if (!isPasswordValid) {
    throw new Error('Credenciais inválidas.');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, company_id: user.company_id },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '1d' }
  );

  return {
    token,
    user: { 
      id: user.id,
      name: user.name, 
      email: user.email, 
      role: user.role, 
      company_id: user.company_id 
    }
  };
}
