// import { User as UserEntity } from '../__generated__/linkedup-web-api-client/models/User';
// import { User } from '../models/user';
// import { entity2Model as userRoleEntity2Model } from './user-role-mapper';
// import { entity2Model as userStatusEntity2Model } from './user-status-mapper';
// import { entity2Model as datetimeEntity2Model } from './datetime-mapper';

// export const entity2Model = (src: UserEntity): User => {
//   const { lastLoginDatetime, role, status, ...others } = src;
//   return {
//     lastLoginDatetime: datetimeEntity2Model(lastLoginDatetime),
//     ...others,
//     role: userRoleEntity2Model(role),
//     status: userStatusEntity2Model(status),
//     lastUpdateDatetime: 0,
//     lastUpdateBy: '',
//     entitledStudent: [],
//   };
// };
