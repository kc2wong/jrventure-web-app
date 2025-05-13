import { MenuItem as EntityMenuItem } from '../__generated__/linkedup-web-api-client';
import { MenuItem } from '../models/login';

export const entity2Model = (src: EntityMenuItem): MenuItem => {
  return {
    id: src.id,
    label: src.label,
    children: src.children ? src.children.map(entity2Model) : undefined,
  };
};
