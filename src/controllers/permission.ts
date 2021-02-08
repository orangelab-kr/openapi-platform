import { PermissionModel, Prisma } from '@prisma/client';

import Database from '../tools/database';
import InternalError from '../tools/error';
import Joi from '../tools/joi';
import { OPCODE } from '../tools';
import PATTERN from '../tools/pattern';

const { prisma } = Database;

export default class Permission {
  /** 권한을 불러옵니다. 없을 경우 오류를 발생합니다. */
  public static async getPermissionOrThrow(
    permissionId: string
  ): Promise<PermissionModel> {
    const permission = await Permission.getPermission(permissionId);
    if (!permission) {
      throw new InternalError(
        `해당 권한을 찾을 수 없습니다.`,
        OPCODE.NOT_FOUND
      );
    }

    return permission;
  }

  /** 권한을 불러옵니다. */
  public static async getPermission(
    permissionId: string
  ): Promise<PermissionModel | null> {
    const permission = await prisma.permissionModel.findFirst({
      where: { permissionId },
    });

    return permission;
  }

  /** 권한을 생성합니다. */
  public static async createPermission(props: {
    permissionId: string;
    name: string;
    description: string;
  }): Promise<PermissionModel> {
    const schema = Joi.object({
      permissionId: PATTERN.PERMISSION.ID,
      name: PATTERN.PERMISSION.NAME,
      description: PATTERN.PERMISSION.DESCRIPTION,
    });

    const { permissionId, name, description } = await schema.validateAsync(
      props
    );

    const exists = await Permission.getPermission(permissionId);
    if (exists) {
      throw new InternalError(
        '이미 존재하는 권한입니다.',
        OPCODE.ALREADY_EXISTS
      );
    }

    const permission = await prisma.permissionModel.create({
      data: { permissionId, name, description },
    });

    return permission;
  }

  /** 권한 목록을 불러옵니다. */
  public static async getPermissions(props: {
    take?: number;
    skip?: number;
    search?: string;
    orderByField?: string;
    orderBySort?: string;
  }): Promise<{ total: number; permissions: PermissionModel[] }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.valid(
        'permissionId',
        'name',
        'createdAt'
      ).default('permissionId'),
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT,
    });

    const {
      take,
      skip,
      search,
      orderByField,
      orderBySort,
    } = await schema.validateAsync(props);
    const orderBy = { [orderByField]: orderBySort };
    const where: Prisma.PermissionModelWhereInput = {
      OR: [
        { permissionId: { contains: search } },
        { name: { contains: search } },
      ],
    };

    const [total, permissions] = await prisma.$transaction([
      prisma.permissionModel.count({ where }),
      prisma.permissionModel.findMany({
        take,
        skip,
        where,
        orderBy,
      }),
    ]);

    return { total, permissions };
  }

  /** 권한을 수정합니다. */
  public static async modifyPermission(
    permissionId: string,
    props: { name: string; description: string }
  ): Promise<void> {
    const schema = Joi.object({
      name: PATTERN.PERMISSION.NAME,
      description: PATTERN.PERMISSION.DESCRIPTION,
    });

    const { name, description } = await schema.validateAsync(props);
    await prisma.permissionModel.update({
      where: { permissionId },
      data: { name, description },
    });
  }

  /** 권한을 삭제합니다. */
  public static async deletePermission(permissionId: string): Promise<void> {
    await prisma.permissionModel.delete({ where: { permissionId } });
  }
}
