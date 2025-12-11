import type { IUserRepository } from "@/domain/users/repositories/IUserRepository";
import { User } from "@/domain/users/entities/User";
import { Database } from "../database/Database";

/**
 * PostgreSQL Implementation of User Repository
 */
export class PostgresUserRepository implements IUserRepository {
  private db = Database.getInstance();

  async findById(uuid: string): Promise<User | null> {
    const result = await this.db`
      SELECT * FROM users WHERE uuid = ${uuid}
    `;
    
    if (result.length === 0) return null;
    return this.mapToEntity(result[0]);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const result = await this.db`
      SELECT * FROM users WHERE google_id = ${googleId}
    `;
    
    if (result.length === 0) return null;
    return this.mapToEntity(result[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    if (result.length === 0) return null;
    return this.mapToEntity(result[0]);
  }

  async create(user: User): Promise<User> {
    const result = await this.db`
      INSERT INTO users (
        uuid, google_id, name, email, avatar, country, currency, 
        birthdate, access_token, refresh_token, created_at, updated_at
      ) VALUES (
        ${user.uuid}, ${user.googleId}, ${user.name}, ${user.email}, 
        ${user.avatar}, ${user.country}, ${user.currency}, ${user.birthdate}, 
        ${user.accessToken}, ${user.refreshToken}, ${user.createdAt}, ${user.updatedAt}
      ) RETURNING *
    `;
    
    return this.mapToEntity(result[0]);
  }

  async update(user: User): Promise<User> {
    const result = await this.db`
      UPDATE users SET
        name = ${user.name},
        email = ${user.email},
        avatar = ${user.avatar},
        country = ${user.country},
        currency = ${user.currency},
        birthdate = ${user.birthdate},
        access_token = ${user.accessToken},
        refresh_token = ${user.refreshToken},
        updated_at = ${user.updatedAt}
      WHERE uuid = ${user.uuid}
      RETURNING *
    `;
    
    return this.mapToEntity(result[0]);
  }

  async delete(uuid: string): Promise<void> {
    await this.db`DELETE FROM users WHERE uuid = ${uuid}`;
  }

  private mapToEntity(row: any): User {
    return new User(
      row.uuid,
      row.name,
      row.email,
      row.avatar,
      row.country,
      row.currency,
      row.birthdate ? new Date(row.birthdate) : null,
      row.google_id,
      row.access_token,
      row.refresh_token,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
}

