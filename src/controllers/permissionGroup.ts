import { PermissionGroupModel, PlatformModel, Prisma } from '@prisma/client';
import { Joi, PATTERN, prisma, RESULT } from '..';

export class PermissionGroup {
  /** 권한 그룹을 불러옵니다. 없으면 오류를 발생합니다. */
  public static async getPermissionGroupOrThrow(
    permissionGroupId: string,
    platform?: PlatformModel
  ): Promise<PermissionGroupModel> {
    const permissionGroup = await PermissionGroup.getPermissionGroup(
      permissionGroupId,
      platform
    );

    if (!permissionGroup) throw RESULT.CANNOT_FIND_PERMISSION_GROUP();
    return permissionGroup;
  }

  /** 권한 그룹을 가져옵니다. */
  public static async getPermissionGroup(
    permissionGroupId: string,
    platform?: PlatformModel
  ): Promise<PermissionGroupModel | null> {
    const OR: any = [{ platformId: null }];
    if (platform) {
      const { platformId } = platform;
      OR.push({ platformId });
    }

    const { findFirst } = prisma.permissionGroupModel;
    const permissionGroup = await findFirst({
      where: { permissionGroupId, OR },
      include: { platform: true, permissions: true },
    });

    return permissionGroup;
  }

  /** 권한 그룹 목록을 가져옵니다. */
  public static async getPermissionGroups(
    props: {
      take?: number;
      skip?: number;
      search?: string;
      orderByField?: string;
      orderBySort?: string;
    },
    platform?: PlatformModel
  ): Promise<{ total: number; permissionGroups: PermissionGroupModel[] }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.default('name').valid(
        'permissionGroupId',
        'name',
        'createdAt'
      ),
    });

    const { take, skip, search, orderByField, orderBySort } =
      await schema.validateAsync(props);
    const orderBy = { [orderByField]: orderBySort };
    const include = { permissions: true };
    const where: any = {
      name: { contains: search },
      OR: [{ platformId: null }],
    };

    if (platform) {
      const { platformId } = platform;
      where.OR.push({ platformId });
    }

    const [total, permissionGroups] = await prisma.$transaction([
      prisma.permissionGroupModel.count({ where }),
      prisma.permissionGroupModel.findMany({
        take,
        skip,
        where,
        orderBy,
        include,
      }),
    ]);

    return { total, permissionGroups };
  }

  /** 권한 그룹을 생성합니다. */
  public static async createPermissionGroup(
    props: {
      name: string;
      permissions: string[];
    },
    platform?: PlatformModel
  ): Promise<PermissionGroupModel> {
    const schema = Joi.object({
      name: PATTERN.PERMISSION.GROUP.NAME,
      description: PATTERN.PERMISSION.GROUP.DESCRIPTION,
      permissionIds: PATTERN.PERMISSION.MULTIPLE,
    });

    const { name, description, permissionIds } = await schema.validateAsync(
      props
    );

    const data: Prisma.PermissionGroupModelCreateInput = {
      name,
      description,
      permissions: {
        connect: permissionIds.map((permissionId: string) => ({
          permissionId,
        })),
      },
    };

    if (platform) {
      const { platformId } = platform;
      data.platform = { connect: { platformId } };
    }

    const permissionGroup = await prisma.permissionGroupModel.create({
      data,
    });

    return permissionGroup;
  }

  /** 권한 그룹을 수정합니다. */
  public static async modifyPermissionGroup(
    permissionGroupId: string,
    props: { name: string; description: string; permissionIds: string[] },
    platform?: PlatformModel
  ): Promise<void> {
    const schema = Joi.object({
      name: PATTERN.PERMISSION.NAME.optional(),
      description: PATTERN.PERMISSION.GROUP.DESCRIPTION.optional(),
      permissionIds: PATTERN.PERMISSION.MULTIPLE.optional(),
    });

    const { name, description, permissionIds } = await schema.validateAsync(
      props
    );

    const where = { permissionGroupId };
    const data: Prisma.PermissionGroupModelUpdateInput = { name, description };
    if (permissionIds) {
      data.permissions = {
        set: permissionIds.map((permissionId: string) => ({
          permissionId,
        })),
      };
    }

    if (platform) {
      await PermissionGroup.getPermissionGroupOrThrow(
        permissionGroupId,
        platform
      );
    }

    await prisma.permissionGroupModel.update({ where, data });
  }

  /** 권한 그룹을 삭제합니다. */
  public static async deletePermissionGroup(
    permissionGroupId: string,
    platform?: PlatformModel
  ): Promise<void> {
    const include = { users: true, accessKeys: true };
    const where: Prisma.PermissionGroupModelWhereInput = {
      permissionGroupId,
      OR: [{ platformId: null }],
    };

    if (platform && where.OR instanceof Array) {
      const { platformId } = platform;
      where.OR.push({ platformId });
    }

    const { findFirst, deleteMany } = prisma.permissionGroupModel;
    const permissionGroup = await findFirst({ where, include });
    if (!permissionGroup) throw RESULT.CANNOT_FIND_PERMISSION_GROUP();
    const { users, accessKeys } = permissionGroup;
    if (users.length > 0 || accessKeys.length > 0) {
      throw RESULT.PERMISSION_GROUP_IS_USING();
    }

    await deleteMany({ where: { permissionGroupId } });
  }
}
