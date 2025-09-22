import { hash } from 'bcrypt';
import { env } from 'process';
import { RoleName } from 'src/shared/constants/role.constant';
import { HashingService } from 'src/shared/services/hasing.service';
import { PrismaService } from 'src/shared/services/prisma.service';

const prisma = new PrismaService();
const hassingService = new HashingService();
prisma.$connect();

const main = async () => {
  const rouleCount = await prisma.role.count();

  if (rouleCount > 0) {
    throw new Error('Role already exists');
  }

  await prisma.role.createMany({
    data: [
      { name: RoleName.ADMIN, description: RoleName.ADMIN },
      { name: RoleName.CLIENT, description: RoleName.CLIENT },
      { name: RoleName.SELLER, description: RoleName.SELLER },
    ],
  });
  console.log('Role created successfully');

  const adminRole = await prisma.role.findFirstOrThrow({ where: { name: RoleName.ADMIN } });
  const hashedPassword = await hassingService.hash(env.ADMIN_PASSWORD || '');
  const adminUser = await prisma.user.create({
    data: {
      email: env.ADMIN_EMAIL || '',
      password: hashedPassword,
      name: env.ADMIN_NAME || '',
      phoneNumber: env.ADMIN_PHONE || '',
      roleId: adminRole.id,
    },
  });

  return {
    createRoleCount: rouleCount,
    adminUser,
  };
};

main()
  .then(({ adminUser, createRoleCount }) => {
    console.log('🚀 ~ file: index.ts:34 ~ main ~ createRoleCount:', createRoleCount);
    console.log('🚀 ~ file: index.ts:34 ~ main ~ adminUser:', adminUser);
    process.exit(0);
  })
  .catch((error) => {
    console.log('🚀 ~ file: index.ts:38 ~ main ~ error:', error);
    process.exit(1);
  });
