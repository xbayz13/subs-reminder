import type { IUserRepository } from "@/domain/users/repositories/IUserRepository";
import { User } from "@/domain/users/entities/User";
import { randomUUID } from "crypto";

/**
 * User Application Service
 * 
 * Handles use cases related to user management.
 * This is part of the application layer (use cases).
 */
export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Login or register user with Google OAuth
   */
  async loginWithGoogle(data: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string | null;
    accessToken: string;
    refreshToken: string | null;
  }): Promise<User> {
    // Check if user exists
    let user = await this.userRepository.findByGoogleId(data.googleId);
    
    if (!user) {
      // Check by email as fallback
      user = await this.userRepository.findByEmail(data.email);
      
      if (user) {
        // Update existing user with Google ID
        user.updateTokens(data.accessToken, data.refreshToken);
        return await this.userRepository.update(user);
      }
      
      // Create new user
      const now = new Date();
      user = new User(
        randomUUID(),
        data.name,
        data.email,
        data.avatar || null,
        null, // country
        "IDR", // default currency
        null, // birthdate
        data.googleId,
        data.accessToken,
        data.refreshToken,
        now,
        now
      );
      
      return await this.userRepository.create(user);
    }
    
    // Update tokens for existing user
    user.updateTokens(data.accessToken, data.refreshToken);
    return await this.userRepository.update(user);
  }

  /**
   * Get user by UUID
   */
  async getUserById(uuid: string): Promise<User | null> {
    return await this.userRepository.findById(uuid);
  }

  /**
   * Get user by Google ID
   */
  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findByGoogleId(googleId);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      avatar?: string | null;
      country?: string | null;
      currency?: string;
      birthdate?: Date | null;
    }
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    user.updateProfile(data);
    return await this.userRepository.update(user);
  }
}

