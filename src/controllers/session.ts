import { Database, InternalError, Joi, OPCODE, PATTERN } from '../tools';
import {
  PlatformLogType,
  PlatformModel,
  PlatformUserMethodModel,
  PlatformUserMethodProvider,
  PlatformUserModel,
  PlatformUserSessionModel,
} from '@prisma/client';

import Log from './log';
import { User } from '.';
import { compareSync } from 'bcryptjs';
import { randomBytes } from 'crypto';

const { prisma } = Database;
export default class Session {
  /** 이메일, 비밀번호를 사용하여 로그인을 합니다. */
  public static async loginUserByEmail(props: {
    email: string;
    password: string;
  }): Promise<PlatformUserModel> {
    try {
      const schema = Joi.object({
        email: PATTERN.PLATFORM.USER.EMAIL,
        password: PATTERN.PLATFORM.USER.PASSWORD,
      });

      const { email, password } = await schema.validateAsync(props);
      const platformUser = await User.getUserByEmailOrThrow(email);
      const method = await Session.getUserMethodOrThrow(
        platformUser,
        PlatformUserMethodProvider.LOCAL
      );

      if (!compareSync(password, method.identity)) {
        throw new InternalError(
          '비밀번호가 일치하지 않습니다.',
          OPCODE.NOT_FOUND
        );
      }

      return platformUser;
    } catch (err) {
      throw new InternalError(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
        OPCODE.NOT_FOUND
      );
    }
  }

  /** 전화번호, 비밀번호를 사용하여 로그인을 합니다. */
  public static async loginUserByPhone(props: {
    phone: string;
    password: string;
  }): Promise<PlatformUserModel> {
    try {
      const schema = Joi.object({
        phone: PATTERN.PLATFORM.USER.PHONE,
        password: PATTERN.PLATFORM.USER.PASSWORD,
      });

      const { phone, password } = await schema.validateAsync(props);
      const platformUser = await User.getUserByPhoneOrThrow(phone);
      const method = await Session.getUserMethodOrThrow(
        platformUser,
        PlatformUserMethodProvider.LOCAL
      );

      if (!compareSync(password, method.identity)) {
        throw new InternalError(
          '비밀번호가 일치하지 않습니다.',
          OPCODE.NOT_FOUND
        );
      }

      return platformUser;
    } catch (err) {
      throw new InternalError(
        '전화번호 또는 비밀번호가 올바르지 않습니다.',
        OPCODE.NOT_FOUND
      );
    }
  }

  /** 사용자의 새로운 세션을 발행합니다. */
  public static async createSession(
    platformUser: PlatformUserModel,
    userAgent?: string
  ): Promise<string> {
    const platformUserSessionId = await Session.generateSessionId();
    const { platformUserId } = platformUser;
    await prisma.platformUserSessionModel.create({
      data: { platformUserSessionId, platformUserId, userAgent },
    });

    Log.createUserLog(
      platformUser,
      PlatformLogType.LOGIN,
      `${userAgent}에서 로그인을 진행하였습니다.`
    );

    return platformUserSessionId;
  }

  /** 모든 로그인 세션을 삭제합니다. */
  public static async revokeAllSession(
    platformUser: PlatformUserModel
  ): Promise<void> {
    const { platformUserId } = platformUser;
    await prisma.platformUserSessionModel.deleteMany({
      where: { platformUserId },
    });
  }

  /** 랜덤 세션 ID를 생성합니다. */
  private static async generateSessionId() {
    let platformUserSessionId;
    while (true) {
      platformUserSessionId = randomBytes(95).toString('base64');
      const session = await prisma.platformUserSessionModel.findFirst({
        where: { platformUserSessionId },
      });

      if (!session) break;
    }

    return platformUserSessionId;
  }

  /** 사용자의 인증 메서드를 가져옵니다. 없을 경우 오류를 발생시킵니다.*/
  public static async getUserMethodOrThrow(
    platformUser: PlatformUserModel,
    provider: PlatformUserMethodProvider
  ): Promise<PlatformUserMethodModel> {
    const method = await Session.getUserMethod(platformUser, provider);
    if (!method) {
      throw new InternalError('해당 인증 메서드가 없습니다.', OPCODE.NOT_FOUND);
    }

    return method;
  }

  /** 사용자의 인증 메서드를 가져옵니다. */
  public static async getUserMethod(
    platformUser: PlatformUserModel,
    provider: PlatformUserMethodProvider
  ): Promise<PlatformUserMethodModel | null> {
    const { platformUserId } = platformUser;
    const method = await prisma.platformUserMethodModel.findFirst({
      where: { platformUserId, provider },
    });

    return method;
  }

  /** 세션 ID 로 사용자를 불러옵니다. */
  public static async getUserSession(
    platformUserSessionId: string
  ): Promise<
    PlatformUserSessionModel & {
      platformUser: PlatformUserModel & { platform: PlatformModel };
    }
  > {
    const { findFirst } = prisma.platformUserSessionModel;
    const session = await findFirst({
      where: { platformUserSessionId },
      include: {
        platformUser: {
          include: {
            platform: true,
            permissionGroup: { include: { permissions: true } },
          },
        },
      },
    });

    if (!session) {
      throw new InternalError(
        '로그아웃되었습니다. 다시 로그인해주세요.',
        OPCODE.REQUIRED_LOGIN
      );
    }

    return session;
  }
}
