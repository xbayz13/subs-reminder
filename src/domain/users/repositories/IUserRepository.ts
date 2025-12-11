import type { User } from "../entities/User";

/**
 * User Repository Interface
 * 
 * Defines the contract for user data persistence.
 * Implementation will be in infrastructure layer.
 */
export interface IUserRepository {
  /**
   * Find user by UUID
   */
  findById(uuid: string): Promise<User | null>;

  /**
   * Find user by Google ID
   */
  findByGoogleId(googleId: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Create a new user
   */
  create(user: User): Promise<User>;

  /**
   * Update existing user
   */
  update(user: User): Promise<User>;

  /**
   * Delete user by UUID
   */
  delete(uuid: string): Promise<void>;
}

