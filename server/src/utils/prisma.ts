import { PrismaClient } from '../generated/prisma';

// Create a singleton Prisma client instance
const prisma = new PrismaClient();

export default prisma;
