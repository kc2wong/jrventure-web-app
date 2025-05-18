import { ReactElement } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

type DeviceComponentProps = {
  mobile: ReactElement;
  desktop: ReactElement;
};

export const DeviceComponent: React.FC<DeviceComponentProps> = ({ mobile, desktop }) => {
  const isMobile = useIsMobile();
  return isMobile ? mobile : desktop;
};
