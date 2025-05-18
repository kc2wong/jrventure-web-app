import { FC } from 'react';
import { Title1, Title3 } from '@fluentui/react-components';
import { DeviceComponent } from './device-component';

type PageTitleProps = {
  children: string;
};

export const PageTitle: FC<PageTitleProps> = ({ children }: PageTitleProps) => {
  return (
    <DeviceComponent
      desktop={<Title1>{children}</Title1>}
      mobile={<Title3>{children}</Title3>}
    ></DeviceComponent>
  );
};
