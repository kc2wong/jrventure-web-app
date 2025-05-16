import { ReactElement } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

type DeviceComponentProps = {
  forMobile: boolean;
  children: ReactElement | ReactElement[];
};

export const DeviceComponent: React.FC<DeviceComponentProps> = ({
  forMobile: isForMobile,
  children,
}) => {
  const isMobile = useIsMobile();

  return (isForMobile && isMobile) || (!isForMobile && !isMobile) ? children : <></>;
};
