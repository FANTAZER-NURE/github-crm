import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '../config';
import {
  RegisterUserData,
  LoginUserData,
  AuthResponse,
  TokenPair,
} from '../types/auth';
import { UserRepository } from '../data-layer/userRepository';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository?: UserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  /**
   * Generate access and refresh tokens for a user
   */
  private generateTokens(userId: number): TokenPair {
    const accessToken = jwt.sign(
      { id: userId },
      config.jwtSecret as Secret,
      { expiresIn: config.jwtExpiresIn } as SignOptions
    );

    const refreshToken = jwt.sign(
      { id: userId },
      config.jwtRefreshSecret as Secret,
      { expiresIn: config.jwtRefreshExpiresIn } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify refresh token and generate new token pair
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair | null> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        config.jwtRefreshSecret as Secret
      ) as JwtPayload;

      const userId = decoded.id;
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return null;
      }

      return this.generateTokens(user.id);
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }

  async registerUser({
    email,
    password,
    name,
  }: RegisterUserData): Promise<AuthResponse> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser) {
        return {
          success: false,
          message: 'Email already in use',
        };
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await this.userRepository.create({
        email,
        password: hashedPassword,
        name,
      });

      try {
        const { accessToken, refreshToken } = this.generateTokens(user.id);

        return {
          success: true,
          message: 'User registered successfully.',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token: accessToken,
          refreshToken,
        };
      } catch (error) {
        throw new Error('Failed to generate JWT tokens');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to register user');
    }
  }

  async loginUser({ email, password }: LoginUserData): Promise<AuthResponse> {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }

      try {
        const { accessToken, refreshToken } = this.generateTokens(user.id);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token: accessToken,
          refreshToken,
        };
      } catch (error) {
        throw new Error('Failed to generate JWT tokens');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login user');
    }
  }

  async getUserById(userId: number) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}

export const authService = new AuthService();
