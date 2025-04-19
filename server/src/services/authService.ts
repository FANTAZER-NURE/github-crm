import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '../config';
import {
  RegisterUserData,
  LoginUserData,
  AuthResponse,
  RefreshTokenResponse,
  LoginResponse,
  GetUserByIdResponse,
} from '../types/auth';
import { UserRepository } from '../data-layer/userRepository';
import { TokenRepository } from '../data-layer/tokenRepository';
import {
  createBadRequestError,
  createInternalServerError,
  createNotFoundError,
  createUnauthorizedError,
} from '../utils/AppError';

export class AuthService {
  private userRepository: UserRepository;
  private tokenRepository: TokenRepository;

  constructor(
    userRepository?: UserRepository,
    tokenRepository?: TokenRepository
  ) {
    this.userRepository = userRepository || new UserRepository();
    this.tokenRepository = tokenRepository || new TokenRepository();
  }

  private generateRefreshToken(userId: number) {
    const refreshToken = jwt.sign(
      { id: userId },
      config.jwtRefreshSecret as Secret,
      { expiresIn: config.jwtRefreshExpiresIn } as SignOptions
    );

    return refreshToken;
  }

  private generateAccessToken(userId: number) {
    const accessToken = jwt.sign(
      { id: userId },
      config.jwtSecret as Secret,
      { expiresIn: config.jwtExpiresIn } as SignOptions
    );

    return accessToken;
  }

  public async refreshToken(
    refreshToken: string
  ): Promise<RefreshTokenResponse> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        config.jwtRefreshSecret as Secret
      ) as JwtPayload;

      const userId = decoded.id;
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return createUnauthorizedError('Failed to refresh token');
      }

      await this.tokenRepository.createRevokedToken(user.accessToken || '');

      await this.userRepository.updateToken(user.id, {
        accessToken: null,
      });

      const newToken = this.generateRefreshToken(user.id);

      if (!newToken) {
        return createUnauthorizedError('Failed to refresh token');
      }

      return {
        success: true,
        message: 'Token refreshed successfully',
        token: newToken,
        status: 200,
      };
    } catch (error) {
      return createUnauthorizedError('Failed to refresh token');
    }
  }

  public async registerUser({
    email,
    password,
    name,
  }: RegisterUserData): Promise<AuthResponse> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser) {
        return createBadRequestError('Email already in use', null, false);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await this.userRepository.create({
        email,
        password: hashedPassword,
        name,
      });

      return {
        success: true,
        message: 'User registered successfully.',
        status: 201,
      };
    } catch (error) {
      throw createInternalServerError('Failed to register user');
    }
  }

  public async loginUser({
    email,
    password,
  }: LoginUserData): Promise<LoginResponse> {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return createUnauthorizedError('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return createUnauthorizedError('Invalid credentials');
      }

      const accessToken = this.generateAccessToken(user.id);

      await this.userRepository.updateToken(user.id, {
        accessToken,
      });

      return {
        success: true,
        token: accessToken,
        status: 200,
      };
    } catch (error) {
      throw createInternalServerError('Failed to login user');
    }
  }

  public async getUserById(userId: number): Promise<GetUserByIdResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return createNotFoundError('User not found');
    }

    return {
      user,
      success: true,
      status: 200,
    };
  }

  public async logoutUser(token: string) {
    try {
      await this.tokenRepository.createRevokedToken(token);

      return {
        success: true,
        message: 'Logged out successfully',
        status: 200,
      };
    } catch (error) {
      throw createInternalServerError('Failed to logout user');
    }
  }
}

export const authService = new AuthService();
