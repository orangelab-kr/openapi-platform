import {
  PermissionGroupModel,
  PermissionModel,
  PlatformModel,
  PlatformUserMethodProvider,
  PlatformUserModel,
  Prisma,
} from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { Joi, PATTERN, PermissionGroup } from '..';
import { Database, RESULT } from '../tools';

const { prisma } = Database;

export class User {
  public static hasPermissions(
    user: PlatformUserModel & {
      platform: PlatformModel;
      permissionGroup: PermissionGroupModel & {
        permissions: PermissionModel[];
      };
    },
    requiredPermissions: string[]
  ): void {
    const permissions = user.permissionGroup.permissions.map(
      ({ permissionId }: { permissionId: string }) => permissionId
    );

    requiredPermissions.forEach((permission: string) => {
      if (!permissions.includes(permission)) {
        throw RESULT.PERMISSION_DENIED({ args: [permission] });
      }
    });
  }

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

    const { name, email, phone, password, permissionGroupId } =
      await schema.validateAsync(props);
    const isExists = await Promise.all([
      User.isExistsPlatformUserEmail(email),
      User.isExistsPlatformUserPhone(phone),
    ]);

    if (isExists[0]) throw RESULT.ALREADY_USING_EMAIL();
    if (isExists[1]) throw RESULT.ALREADY_USING_PHONE();
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
      permissionGroupId: string;
    }
  ): Promise<PlatformUserModel> {
    const schema = Joi.object({
      name: PATTERN.PLATFORM.USER.NAME.optional(),
      email: PATTERN.PLATFORM.USER.EMAIL.optional(),
      phone: PATTERN.PLATFORM.USER.PHONE.optional(),
      permissionGroupId: PATTERN.PERMISSION.GROUP.ID.optional(),
      password: PATTERN.PLATFORM.USER.PASSWORD.optional(),
    });

    const { name, email, phone, password, permissionGroupId } =
      await schema.validateAsync(props);
    const isExists = await Promise.all([
      User.isExistsPlatformUserEmail(email),
      User.isExistsPlatformUserPhone(phone),
    ]);

    if (email && user.email !== email && isExists[0]) {
      throw RESULT.ALREADY_USING_EMAIL();
    }

    if (phone && user.phone !== phone && isExists[1]) {
      throw RESULT.ALREADY_USING_PHONE();
    }

    const data: Prisma.PlatformUserModelUpdateInput = {
      name,
      email,
      phone,
    };

    if (permissionGroupId) {
      await PermissionGroup.getPermissionGroupOrThrow(permissionGroupId);
      data.permissionGroup = { connect: { permissionGroupId } };
    }

    if (password) {
      const provider = PlatformUserMethodProvider.LOCAL;
      const identity = hashSync(password, 10);
      data.methods = {
        deleteMany: { provider },
        create: { provider, identity },
      };
    }

    const { platformUserId } = user;
    const where = { platformUserId };
    await prisma.platformUserModel.update({ where, data });
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

    const { take, skip, search, orderByField, orderBySort } =
      await schema.validateAsync(props);
    const { platformId } = platform;
    const orderBy = { [orderByField]: orderBySort };
    const include = {
      platform: true,
      permissionGroup: { include: { permissions: true } },
    };

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
        include,
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
    if (!user) throw RESULT.CANNOT_FIND_USER();
    return user;
  }

  /** 이메일로 사용자를 가져옵니다. 없을 경우 오류를 발생합니다. */
  public static async getUserByEmailOrThrow(
    email: string
  ): Promise<PlatformUserModel> {
    const user = await User.getUserByEmail(email);
    if (!user) throw RESULT.CANNOT_FIND_USER();
    return user;
  }

  /** 전화번호로 사용자를 가져옵니다. */
  public static async getUserByPhone(
    phone: string
  ): Promise<PlatformUserModel | null> {
    const user = await prisma.platformUserModel.findFirst({
      where: { phone },
      include: {
        platform: true,
        permissionGroup: { include: { permissions: true } },
      },
    });

    return user;
  }

  /** 전화번호로 사용자를 가져옵니다. 없을 경우 오류를 발생합니다. */
  public static async getUserByPhoneOrThrow(
    phone: string
  ): Promise<PlatformUserModel> {
    const user = await User.getUserByPhone(phone);
    if (!user) throw RESULT.CANNOT_FIND_USER();
    return user;
  }

  /** 이메일로 사용자를 가져옵니다. */
  public static async getUserByEmail(
    email: string
  ): Promise<PlatformUserModel | null> {
    const user = await prisma.platformUserModel.findFirst({
      where: { email },
      include: {
        platform: true,
        permissionGroup: { include: { permissions: true } },
      },
    });

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
      include: {
        platform: true,
        permissionGroup: { include: { permissions: true } },
      },
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
