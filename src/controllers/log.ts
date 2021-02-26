import { Database, InternalError, OPCODE } from '../tools';
import {
  PlatformAccessKeyModel,
  PlatformLogType,
  PlatformUserModel,
} from '@prisma/client';

import { Request } from 'express';

const { prisma } = Database;
export default class Log {
  public static async createRequestLog(
    req: Request,
    platformLogType: PlatformLogType,
    message: string
  ): Promise<void> {
    const {
      platform: { platformId },
      platformUser: { platformUserId },
      platformAccessKey: { platformAccessKeyId },
    } = req;

    if (!platformId || !(platformUserId || platformAccessKeyId)) {
      throw new InternalError(
        '알 수 없는 오류가 발생하였습니다.',
        OPCODE.ERROR
      );
    }

    await prisma.platformLogModel.create({
      data: {
        platformId,
        platformUserId,
        platformAccessKeyId,
        platformLogType,
        message,
      },
    });
  }

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
}
