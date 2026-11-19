import { ModuleId, ModuleStatus, Permission } from '../../config';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  permission?: Permission;
  exact?: boolean;
  badge?: boolean;
  /** Sous-items (support soumenu : apparait au survol / clic quand la liste est longue) */
  children?: MenuItem[];
}

export interface MenuSection {
  id: string;
  title?: string;
  status?: ModuleStatus;
  items: MenuItem[];
}

export interface ModuleMenuConfig {
  module: ModuleId;
  sections: MenuSection[];
}
