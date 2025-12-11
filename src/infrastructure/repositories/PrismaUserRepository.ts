import type { IUserRepository } from "@/domain/users/repositories/IUserRepository";
import { User } from "@/domain/users/entities/User";
import { prisma } from "../database/PrismaClient";

/**
 * Prisma Implementation of User Repository
 */
export class PrismaUserRepository implements IUserRepository {
  async findById(uuid: string): Promise<User | null> {
    const result = await prisma.user.findUnique({
      where: { id: uuid },
    });

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const result = await prisma.user.findUnique({
      where: { googleId },
    });

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await prisma.user.findUnique({
      where: { email },
    });

    if (!result) return null;
    return this.mapToEntity(result);
  }

  async create(user: User): Promise<User> {
    const result = await prisma.user.create({
      data: {
        id: user.uuid,
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        country: user.country,
        currency: user.currency,
        birthdate: user.birthdate,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

    return this.mapToEntity(result);
  }

  async update(user: User): Promise<User> {
    const result = await prisma.user.update({
      where: { id: user.uuid },
      data: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        country: user.country,
        currency: user.currency,
        birthdate: user.birthdate,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        updatedAt: user.updatedAt,
      },
    });

    return this.mapToEntity(result);
  }

  async delete(uuid: string): Promise<void> {
    await prisma.user.delete({
      where: { id: uuid },
    });
  }

  private mapToEntity(row: any): User {
    return new User(
      row.id,
      row.name,
      row.email,
      row.avatar,
      row.country,
      row.currency,
      row.birthdate ? new Date(row.birthdate) : null,
      row.googleId,
      row.accessToken,
      row.refreshToken,
      new Date(row.createdAt),
      new Date(row.updatedAt)
    );
  }
}

