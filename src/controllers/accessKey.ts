import {
  PermissionGroupModel,
  PermissionModel,
  PlatformAccessKeyModel,
  PlatformModel,
  Prisma,
} from '@prisma/client';
import { Joi, PATTERN, PermissionGroup } from '..';
import { Database, RESULT } from '../tools';

const { prisma } = Database;

export class AccessKey {
  /** 해당 액세스 키로 인증합니다. */
  public static async authorizeWithAccessKey(props: {
    platformAccessKeyId: string;
    platformSecretAccessKey: string;
    permissionIds?: string[];
  }): Promise<PlatformAccessKeyModel & { platform: PlatformModel }> {
    const schema = Joi.object({
      platformAccessKeyId: PATTERN.PLATFORM.ACCESS_KEY.ID,
      platformSecretAccessKey: PATTERN.PLATFORM.ACCESS_KEY.SECRET,
      permissionIds: PATTERN.PERMISSION.MULTIPLE.optional(),
    });

    const { platformAccessKeyId, platformSecretAccessKey, permissionIds } =
      await schema.validateAsync(props);
    const { findFirst, updateMany } = prisma.platformAccessKeyModel;
    const include: Prisma.PlatformAccessKeyModelInclude = {
      platform: true,
      permissionGroup: { include: { permissions: true } },
    };

    const where: Prisma.PlatformAccessKeyModelWhereInput = {
      platformAccessKeyId,
      platformSecretAccessKey,
    };

    const data: Prisma.PlatformAccessKeyModelUpdateInput = {
      usedAt: new Date(),
    };

    const accessKey: any = await findFirst({ include, where });
    if (!accessKey || !accessKey.isEnabled) {
      throw RESULT.NOT_EXISTS_ACCESS_KEY();
    }

    if (permissionIds) AccessKey.hasPermissions(accessKey, permissionIds);
    await updateMany({ where, data });
    return accessKey;
  }

  /** 액세스 키 목록을 가져옵니다. */
  public static async getAccessKeys(
    platform: PlatformModel,
    props: {
      take?: number;
      skip?: number;
      search?: string;
      orderByField?: string;
      orderBySort?: string;
    }
  ): Promise<{ total: number; platformAccessKeys: AccessKey[] }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.valid(
        'name',
        'platformAccessKeyId',
        'createdAt'
      ).default('createdAt'),
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT.default('desc'),
    });

    const { take, skip, search, orderByField, orderBySort } =
      await schema.validateAsync(props);
    const { platformId } = platform;
    const orderBy = { [orderByField]: orderBySort };
    const include = {
      platform: true,
      permissionGroup: { include: { permissions: true } },
    };

    const where: Prisma.PlatformAccessKeyModelWhereInput = {
      platform: { platformId },
      OR: [
        { name: { contains: search } },
        { platformAccessKeyId: { contains: search } },
      ],
    };

    const [total, platformAccessKeys] = await prisma.$transaction([
      prisma.platformAccessKeyModel.count({ where }),
      prisma.platformAccessKeyModel.findMany({
        take,
        skip,
        where,
        orderBy,
        include,
      }),
    ]);

    return { platformAccessKeys, total };
  }

  /** 액세스 키를 생성합니다. */
  public static async createAccessKey(
    platform: PlatformModel,
    props: { name: string; permissionGroupId: string }
  ): Promise<PlatformAccessKeyModel> {
    const schema = Joi.object({
      name: PATTERN.PLATFORM.ACCESS_KEY.NAME,
      permissionGroupId: PATTERN.PERMISSION.GROUP.ID,
    });

    const { platformId } = platform;
    const { name, permissionGroupId } = await schema.validateAsync(props);
    await PermissionGroup.getPermissionGroupOrThrow(permissionGroupId);
    const accessKey = await prisma.platformAccessKeyModel.create({
      data: {
        name,
        platform: { connect: { platformId } },
        permissionGroup: { connect: { permissionGroupId } },
      },
    });

    return accessKey;
  }

  /** 액세스 키를 불러옵니다. 없을 경우 오류를 발생합니다. */
  public static async getAccessKeyOrThrow(
    platform: PlatformModel,
    platformAccessKeyId: string
  ): Promise<PlatformAccessKeyModel> {
    const accessKey = await AccessKey.getAccessKey(
      platform,
      platformAccessKeyId
    );

    if (!accessKey) throw RESULT.CANNOT_FIND_ACCESS_KEY();
    return accessKey;
  }

  /** 액세스 키를 불러옵니다. */
  public static async getAccessKey(
    platform: PlatformModel,
    platformAccessKeyId: string
  ): Promise<PlatformAccessKeyModel | null> {
    const { platformId } = platform;
    const accessKey = await prisma.platformAccessKeyModel.findFirst({
      where: {
        platform: { platformId },
        platformAccessKeyId,
      },
      include: {
        platform: true,
        permissionGroup: { include: { permissions: true } },
      },
    });

    return accessKey;
  }

  /** 액세스 키의 이름 또는 권한 그룹을 변경합니다. */
  public static async modifyAccessKey(
    platformAccessKey: PlatformAccessKeyModel,
    props: { name: string; permissionGroupId: string }
  ): Promise<PlatformAccessKeyModel> {
    const schema = Joi.object({
      isEnabled: PATTERN.PLATFORM.ACCESS_KEY.IS_ENABLED.optional(),
      name: PATTERN.PLATFORM.ACCESS_KEY.NAME.optional(),
      permissionGroupId: PATTERN.PERMISSION.GROUP.ID.optional(),
    });

    const { isEnabled, name, permissionGroupId } = await schema.validateAsync(
      props
    );

    const { platformAccessKeyId } = platformAccessKey;
    const where: Prisma.PlatformAccessKeyModelWhereUniqueInput = {
      platformAccessKeyId,
    };

    const data: Prisma.PlatformAccessKeyModelUpdateInput = {
      isEnabled,
      name,
    };

    if (permissionGroupId) {
      await PermissionGroup.getPermissionGroupOrThrow(permissionGroupId);
      data.permissionGroup = { connect: { permissionGroupId } };
    }

    const accessKey = await prisma.platformAccessKeyModel.update({
      where,
      data,
    });

    return accessKey;
  }

  /** 액세스 키를 삭제합니다. */
  public static async deleteAccessKey(
    platform: PlatformModel,
    platformAccessKey: PlatformAccessKeyModel
  ): Promise<void> {
    const { platformId } = platform;
    const { platformAccessKeyId } = platformAccessKey;
    await prisma.platformAccessKeyModel.deleteMany({
      where: { platformAccessKeyId, platform: { platformId } },
    });
  }

  /** 해당 액세스 키의 특정 권한이 있는지 검사합니다. */
  public static hasPermissions(
    platformAccessKey: PlatformAccessKeyModel & {
      permissionGroup: PermissionGroupModel & {
        permissions: PermissionModel[];
      };
    },
    requiredPermissions: string[]
  ): void {
    const permissions = platformAccessKey.permissionGroup.permissions.map(
      ({ permissionId }: { permissionId: string }) => permissionId
    );

    requiredPermissions.forEach((permission: string) => {
      if (!permissions.includes(permission)) {
        throw RESULT.PERMISSION_DENIED({ args: [permission] });
      }
    });
  }
}
