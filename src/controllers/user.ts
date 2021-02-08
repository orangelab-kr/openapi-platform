import {
  PlatformModel,
  PlatformUserModel,
  PlatformUserSessionModel,
  Prisma,
} from '@prisma/client';

import Database from '../tools/database';
import InternalError from '../tools/error';
import Joi from '../tools/joi';
import { OPCODE } from '../tools';
import PATTERN from '../tools/pattern';
import PermissionGroup from './permissionGroup';
import { hashSync } from 'bcryptjs';

const { prisma } = Database;

export default class User {
  /** 사용자를 생성합니다. */
  public static async createUser(
    platform: PlatformModel,
    props: {
      name: string;
      email: string;
      phone: string;
      password: string;
      permissionGroup: string;
    }
  ): Promise<PlatformUserModel> {
    const schema = Joi.object({
      name: PATTERN.PLATFORM.USER.NAME,
      email: PATTERN.PLATFORM.USER.EMAIL,
      phone: PATTERN.PLATFORM.USER.PHONE,
      permissionGroupId: PATTERN.PERMISSION.GROUP.ID,
      password: PATTERN.PLATFORM.USER.PASSWORD,
    });

    const {
      name,
      email,
      phone,
      password,
      permissionGroupId,
    } = await schema.validateAsync(props);
    const isExists = await Promise.all([
      User.isExistsPlatformUserEmail(email),
      User.isExistsPlatformUserPhone(phone),
    ]);

    if (isExists[0]) {
      throw new InternalError('사용중인 이메일입니다.', OPCODE.ALREADY_EXISTS);
    }

    if (isExists[1]) {
      throw new InternalError(
        '사용중인 전화번호입니다.',
        OPCODE.ALREADY_EXISTS
      );
    }

    await PermissionGroup.getPermissionGroupOrThrow(permissionGroupId);

    const { platformId } = platform;
    const identity = hashSync(password, 10);
    const user = await prisma.platformUserModel.create({
      data: {
        name,
        email,
        phone,
        methods: { create: { provider: 'LOCAL', identity } },
        permissionGroup: { connect: { permissionGroupId } },
        platform: { connect: { platformId } },
      },
    });

    return user;
  }

  /** 사용자를 수정합니다. */
  public static async modifyUser(
    user: PlatformUserModel,
    props: {
      name: string;
      email: string;
      phone: string;
      password: string;
      permissionGroup: string;
    }
  ): Promise<PlatformUserModel> {
    const schema = Joi.object({
      name: PATTERN.PLATFORM.USER.NAME,
      email: PATTERN.PLATFORM.USER.EMAIL,
      phone: PATTERN.PLATFORM.USER.PHONE,
      permissionGroupId: PATTERN.PERMISSION.GROUP.ID,
      password: PATTERN.PLATFORM.USER.PASSWORD,
    });

    const {
      name,
      email,
      phone,
      password,
      permissionGroupId,
    } = await schema.validateAsync(props);
    const isExists = await Promise.all([
      User.isExistsPlatformUserEmail(email),
      User.isExistsPlatformUserPhone(phone),
    ]);

    if (user.email !== email && isExists[0]) {
      throw new InternalError('사용중인 이메일입니다.', OPCODE.ALREADY_EXISTS);
    }

    if (user.phone !== phone && isExists[1]) {
      throw new InternalError(
        '사용중인 전화번호입니다.',
        OPCODE.ALREADY_EXISTS
      );
    }

    await PermissionGroup.getPermissionGroupOrThrow(permissionGroupId);
    const { platformUserId } = user;
    const identity = hashSync(password, 10);
    await prisma.platformUserModel.update({
      where: { platformUserId },
      data: {
        name,
        email,
        phone,
        methods: { create: { provider: 'LOCAL', identity }, deleteMany: {} },
        permissionGroup: { connect: { permissionGroupId } },
      },
    });

    return user;
  }

  /** 사용자 목록을 가져옵니다. */
  public static async getUsers(
    platform: PlatformModel,
    props: {
      take?: number;
      skip?: number;
      search?: number;
      orderByField?: string;
      orderBySort?: string;
    }
  ): Promise<{ total: number; platformUsers: PlatformUserModel[] }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.valid(
        'name',
        'createdAt'
      ).default('name'),
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT,
    });

    const {
      take,
      skip,
      search,
      orderByField,
      orderBySort,
    } = await schema.validateAsync(props);
    const { platformId } = platform;
    const orderBy = { [orderByField]: orderBySort };
    const where: Prisma.PlatformUserModelWhereInput = {
      platform: { platformId },
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ],
    };

    const [total, platformUsers] = await prisma.$transaction([
      prisma.platformUserModel.count({ where }),
      prisma.platformUserModel.findMany({
        take,
        skip,
        where,
        orderBy,
      }),
    ]);

    return { total, platformUsers };
  }

  /** 사용자를 불러옵니다. 없을 경우 오류를 발생합니다. */
  public static async getUserOrThrow(
    platform: PlatformModel,
    platformUserId: string
  ): Promise<PlatformUserModel> {
    const user = await User.getUser(platform, platformUserId);
    if (!user) {
      throw new InternalError(
        '해당 사용자를 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return user;
  }

  /** 사용자를 불러옵니다. */
  public static async getUser(
    platform: PlatformModel,
    platformUserId: string
  ): Promise<PlatformUserModel | null> {
    const { platformId } = platform;
    const user = await prisma.platformUserModel.findFirst({
      where: { platformUserId, platform: { platformId } },
    });

    return user;
  }

  /** 해당 이메일이 사용중인지 확인합니다. */
  public static async isExistsPlatformUserEmail(
    email: string
  ): Promise<boolean> {
    const exists = await prisma.platformUserModel.count({ where: { email } });
    return exists > 0;
  }

  /** 해당 전화번호가 사용중인지 확인합니다. */
  public static async isExistsPlatformUserPhone(
    phone: string
  ): Promise<boolean> {
    const exists = await prisma.platformUserModel.count({ where: { phone } });
    return exists > 0;
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
      include: { platformUser: { include: { platform: true } } },
    });

    if (!session) {
      throw new InternalError(
        '로그아웃되었습니다. 다시 로그인해주세요.',
        OPCODE.REQUIRED_LOGIN
      );
    }

    return session;
  }

  /** 사용자를 삭제합니다. */
  public static async deleteUser(
    platform: PlatformModel,
    user: PlatformUserModel
  ): Promise<void> {
    const { platformId } = platform;
    const { platformUserId } = user;
    await prisma.platformUserModel.deleteMany({
      where: { platform: { platformId }, platformUserId },
    });
  }
}
