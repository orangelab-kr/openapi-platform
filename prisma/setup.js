/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');

let existsPermissions = [];
const prisma = new PrismaClient();

async function main() {
  await getExistsPermissions();

  /** 플랫폼 - 사용자 */
  await setDefaultPermission(
    'users.list',
    '사용자 목록',
    '사용자 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'users.view',
    '사용자 보기',
    '사용자 정보를 불러옵니다.'
  );

  await setDefaultPermission(
    'users.create',
    '사용자 생성',
    '사용자를 생성합니다.'
  );

  await setDefaultPermission(
    'users.update',
    '사용자 수정',
    '사용자를 수정합니다.'
  );

  await setDefaultPermission(
    'users.delete',
    '사용자 삭제',
    '사용자를 삭제합니다.'
  );

  /** 플랫폼 - 권한 */
  await setDefaultPermission(
    'permissions.list',
    '권한 목록',
    '권한 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'permissions.view',
    '권한 보기',
    '권한 정보를 불러옵니다.'
  );

  /** 플랫폼 - 권한 그룹 */
  await setDefaultPermission(
    'permissionGroups.list',
    '권한그룹 목록',
    '권한그룹 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'permissionGroups.view',
    '권한그룹 보기',
    '권한그룹 정보를 불러옵니다.'
  );

  await setDefaultPermission(
    'permissionGroups.create',
    '권한그룹 생성',
    '권한그룹을 생성합니다.'
  );

  await setDefaultPermission(
    'permissionGroups.update',
    '권한그룹 수정',
    '권한그룹을 수정합니다.'
  );

  await setDefaultPermission(
    'permissionGroups.delete',
    '권한그룹 삭제',
    '권한그룹을 삭제합니다.'
  );

  /** 플랫폼 - 로그 */
  await setDefaultPermission(
    'logs.list',
    '로그 목록',
    '로그 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'logs.view',
    '로그 보기',
    '로그 정보를 불러옵니다.'
  );

  /** 플랫폼 - 인증 */
  await setDefaultPermission(
    'auth.view',
    '프로필 보기',
    '내 인증 정보를 불러옵니다.'
  );

  await setDefaultPermission(
    'auth.update',
    '프로필 수정',
    '프로필 정보를 수정합니다.'
  );

  await setDefaultPermission(
    'auth.logout-all',
    '프로필 로그아웃',
    '모든 세션을 강제로 로그아웃합니다.'
  );

  /** 플랫폼 - 액세스키 */
  await setDefaultPermission(
    'accessKeys.list',
    '액세스키 목록',
    '액세스키 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'accessKeys.view',
    '액세스키 보기',
    '액세스키 정보를 불러옵니다.'
  );

  await setDefaultPermission(
    'accessKeys.create',
    '액세스키 생성',
    '액세스키를 생성합니다.'
  );

  await setDefaultPermission(
    'accessKeys.update',
    '액세스키 수정',
    '액세스키를 수정합니다.'
  );

  await setDefaultPermission(
    'accessKeys.delete',
    '액세스키 삭제',
    '액세스키를 삭제합니다.'
  );

  /** 운전면허 - 검증 */
  await setDefaultPermission(
    'license.validate',
    '운전면허 검증',
    '운전면허를 검증합니다.'
  );

  /** 보험 - 조회 */
  await setDefaultPermission(
    'insurance.view',
    '보험 정보',
    '보험 정보를 조회합니다.'
  );

  await createAllPermissionGroup();
}

async function getExistsPermissions() {
  const permissions = await prisma.permissionModel.findMany({
    select: { permissionId: true },
  });

  existsPermissions = permissions.map(({ permissionId }) => permissionId);
}

async function setDefaultPermission(permissionId, name, description) {
  if (existsPermissions.includes(permissionId)) {
    console.warn(
      `[${permissionId}] ${name}: ${description} - 이미 존재합니다.`
    );

    return;
  }

  await prisma.permissionModel.create({
    data: { permissionId, name, description },
  });

  console.log(`[${permissionId}] ${name}: ${description} - 생성되었습니다.`);
}

async function createAllPermissionGroup() {
  await getExistsPermissions();
  const permissions = existsPermissions.map((permissionId) => ({
    permissionId,
  }));

  const permissionGroupName = '모든 권한';
  const existsPermissionGroup = await prisma.permissionGroupModel.findFirst({
    where: { name: permissionGroupName },
  });

  if (existsPermissionGroup) {
    const { permissionGroupId } = existsPermissionGroup;
    await prisma.permissionGroupModel.update({
      where: { permissionGroupId },
      data: { permissions: { set: permissions } },
    });
  } else {
    await prisma.permissionGroupModel.create({
      where: { name: permissionGroupName },
      data: {
        name: permissionGroupName,
        description: '개발을 완료하기 전까지는 해당 권한 그룹을 사용해주세요.',
        permissions: { connect: permissions },
      },
    });
  }

  console.log(
    `[모든 권한] ${existsPermissions.length}개의 권한이 포함된 권한 그룹을 생성하였습니다.`
  );
}

main();
