import {
  PermissionGroupModel,
  PermissionModel,
  PlatformLogType,
  PlatformModel,
  PlatformUserMethodModel,
  PlatformUserMethodProvider,
  PlatformUserModel,
  PlatformUserSessionModel,
} from '@prisma/client';
import { compareSync } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Joi, Log, PATTERN, prisma, RESULT, User } from '..';

export class Session {
  /** 해당 세션 아이디로 인증합니다. */
  public static async authorizeWithSessionId(props: {
    sessionId: string;
    permissionIds?: string[];
  }): Promise<PlatformUserModel & { platform: PlatformModel }> {
    const schema = Joi.object({
      sessionId: PATTERN.PLATFORM.USER.SESSION_ID,
      permissionIds: PATTERN.PERMISSION.MULTIPLE.optional(),
    });

    const { sessionId, permissionIds } = await schema.validateAsync(props);
    let session:
      | (PlatformUserSessionModel & {
          platformUser: PlatformUserModel & {
            platform: PlatformModel;
            permissionGroup: PermissionGroupModel & {
              permissions: PermissionModel[];
            };
          };
        })
      | undefined;

    try {
      session = await Session.getUserSession(sessionId);
    } catch (err: any) {
      throw RESULT.REQUIRED_LOGIN();
    }

    if (permissionIds) {
      User.hasPermissions(session.platformUser, permissionIds);
    }

    return session.platformUser;
  }

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

      if (!compareSync(password, method.identity)) throw RESULT.INVALID_ERROR();
      return platformUser;
    } catch (err: any) {
      throw RESULT.INVALID_EMAIL_OR_PASSWORD();
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

      if (!compareSync(password, method.identity)) throw RESULT.INVALID_ERROR();
      return platformUser;
    } catch (err: any) {
      throw RESULT.INVALID_PHONE_OR_PASSWORD();
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
    if (!method) throw RESULT.NOT_CONNECTED_WITH_METHOD();
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
  public static async getUserSession(platformUserSessionId: string): Promise<
    PlatformUserSessionModel & {
      platformUser: PlatformUserModel & {
        platform: PlatformModel;
        permissionGroup: PermissionGroupModel & {
          permissions: PermissionModel[];
        };
      };
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

    if (!session) throw RESULT.REQUIRED_LOGIN();
    return session;
  }
}
