import { Database, InternalError, Joi, OPCODE, PATTERN } from '../tools';
import {
  PlatformAccessKeyModel,
  PlatformLogModel,
  PlatformLogType,
  PlatformModel,
  PlatformUserModel,
  Prisma,
} from '@prisma/client';

import { Request } from 'express';

const { prisma } = Database;
export default class Log {
  /** HTTP 요청을 기록합니다. */
  public static async createRequestLog(
    req: Request,
    platformLogType: PlatformLogType,
    message: string
  ): Promise<void> {
    const { platform, platformUser, platformAccessKey } = req.loggined;

    if (!platform || !(platformUser || platformAccessKey)) {
      throw new InternalError(
        '알 수 없는 오류가 발생하였습니다.',
        OPCODE.ERROR
      );
    }

    await prisma.platformLogModel.create({
      data: {
        platformId: platform && platform.platformId,
        platformUserId: platformUser && platformUser.platformUserId,
        platformAccessKeyId:
          platformAccessKey && platformAccessKey.platformAccessKeyId,
        platformLogType,
        message,
      },
    });
  }

  /** 사용자 요청을 기록합니다. */
  public static async createUserLog(
    platformUser: PlatformUserModel,
    platformLogType: PlatformLogType,
    message: string
  ): Promise<void> {
    const { platformId, platformUserId } = platformUser;
    await prisma.platformLogModel.create({
      data: {
        platformId,
        platformUserId,
        platformLogType,
        message,
      },
    });
  }

  /** 액세스 키으로 기록합니다. */
  public static async createAccessKeyLog(
    platformAccessKey: PlatformAccessKeyModel,
    platformLogType: PlatformLogType,
    message: string
  ): Promise<void> {
    const { platformId, platformAccessKeyId } = platformAccessKey;
    await prisma.platformLogModel.create({
      data: {
        platformId,
        platformAccessKeyId,
        platformLogType,
        message,
      },
    });
  }

  /** 로그를 확인합니다. */
  public static async getLogs(
    props: {
      take?: number;
      skip?: number;
      search?: string;
      platformLogType?: string[];
      platformUserId?: string;
      platformAccessKeyId?: string;
      orderByField?: string;
      orderBySort?: string;
    },
    platform?: PlatformModel
  ): Promise<{
    total: number;
    platformLogs: (PlatformLogModel & {
      platform: PlatformModel;
      platformUser?: PlatformUserModel;
      platformAccessKey?: PlatformAccessKeyModel;
    })[];
  }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      platformLogType: PATTERN.PLATFORM.LOG.TYPE.optional(),
      platformUserId: PATTERN.PLATFORM.USER.ID.optional(),
      platformAccessKey: PATTERN.PLATFORM.ACCESS_KEY.ID.optional(),
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.valid(
        'createdAt'
      ).default('createdAt'),
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT.default('desc'),
    });

    const {
      take,
      skip,
      search,
      platformLogType,
      platformUserId,
      platformAccessKeyId,
      orderByField,
      orderBySort,
    } = await schema.validateAsync(props);
    const where: Prisma.PlatformLogModelWhereInput = {};
    if (platform) where.platformId = platform.platformId;
    if (platformUserId) where.platformUserId = platformUserId;
    if (platformAccessKeyId) where.platformAccessKeyId = platformAccessKeyId;
    if (platformLogType) where.platformLogType = { in: platformLogType };
    if (search) where.message = { contains: search };
    const orderBy = { [orderByField]: orderBySort };
    const include: Prisma.PlatformLogModelInclude = {
      platform: true,
      platformUser: true,
      platformAccessKey: true,
    };

    const [total, platformLogs]: [number, any] = await prisma.$transaction([
      prisma.platformLogModel.count({ where }),
      prisma.platformLogModel.findMany({
        include,
        orderBy,
        where,
        take,
        skip,
      }),
    ]);

    return { total, platformLogs };
  }

  /** 특정 로그를 확인합니다. 없을 경우 오류가 발생합니다 */
  public static async getLogOrThrow(
    platformLogId: string,
    platform?: PlatformModel
  ): Promise<
    PlatformLogModel & {
      platform: PlatformModel;
      platformUser?: PlatformUserModel;
      platformAccessKey?: PlatformAccessKeyModel;
    }
  > {
    const log = await Log.getLog(platformLogId, platform);
    if (!log) {
      throw new InternalError(
        '해당 로그를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return log;
  }

  /** 특정 로그를 확인합니다. */
  public static async getLog(
    platformLogId: string,
    platform?: PlatformModel
  ): Promise<
    | (PlatformLogModel & {
        platform: PlatformModel;
        platformUser?: PlatformUserModel;
        platformAccessKey?: PlatformAccessKeyModel;
      })
    | null
  > {
    const where: Prisma.PlatformLogModelWhereInput = { platformLogId };
    const include: Prisma.PlatformLogModelInclude = {
      platform: true,
      platformUser: true,
      platformAccessKey: true,
    };

    if (platform) where.platformId = platform.platformId;
    const platformLog: any = await prisma.platformLogModel.findFirst({
      where,
      include,
    });

    return platformLog;
  }
}
