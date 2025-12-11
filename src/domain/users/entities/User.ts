/**
 * User Entity - Domain Model
 * 
 * Represents a user in the system with Google OAuth authentication.
 * This is an aggregate root for the Users bounded context.
 */

export class User {
  constructor(
    public readonly uuid: string,
    public name: string,
    public email: string,
    public avatar: string | null,
    public country: string | null,
    public currency: string,
    public birthdate: Date | null,
    public googleId: string,
    public accessToken: string | null,
    public refreshToken: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  /**
   * Calculate user age based on birthdate
   */
  getAge(): number | null {
    if (!this.birthdate) return null;
    const today = new Date();
    const birth = new Date(this.birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Update user profile information
   */
  updateProfile(data: {
    name?: string;
    avatar?: string | null;
    country?: string | null;
    currency?: string;
    birthdate?: Date | null;
  }): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.avatar !== undefined) this.avatar = data.avatar;
    if (data.country !== undefined) this.country = data.country;
    if (data.currency !== undefined) this.currency = data.currency;
    if (data.birthdate !== undefined) this.birthdate = data.birthdate;
    this.updatedAt = new Date();
  }

  /**
   * Update OAuth tokens
   */
  updateTokens(accessToken: string | null, refreshToken: string | null): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.updatedAt = new Date();
  }
}

