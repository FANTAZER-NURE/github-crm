import { PrismaClient, GithubProject } from '../generated/prisma';

export class GithubProjectRepository {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  async findById(id: number): Promise<GithubProject | null> {
    return this.prisma.githubProject.findUnique({
      where: { id },
    });
  }

  async findByUserAndRepo(
    userId: number,
    owner: string,
    name: string
  ): Promise<GithubProject | null> {
    return this.prisma.githubProject.findFirst({
      where: {
        userId,
        owner,
        name,
      },
    });
  }

  async getAllByUser(userId: number): Promise<GithubProject[]> {
    return this.prisma.githubProject.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: {
    userId: number;
    owner: string;
    name: string;
    description?: string;
    url: string;
    stars: number;
    forks: number;
    issues: number;
    ownerAvatarUrl: string;
    createdAt: Date;
  }): Promise<GithubProject> {
    return this.prisma.githubProject.create({
      data,
    });
  }

  async update(
    id: number,
    data: {
      stars?: number;
      forks?: number;
      issues?: number;
      description?: string;
      ownerAvatarUrl?: string;
      updatedAt?: Date;
    }
  ): Promise<GithubProject> {
    return this.prisma.githubProject.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<GithubProject> {
    return this.prisma.githubProject.delete({
      where: { id },
    });
  }
}
