import React, { useEffect } from 'react';
import { useBreadcrumb } from '../hooks/use-breadcrumb';

const HomePage: React.FC = () => {
  const { useStartBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    useStartBreadcrumb('system.menu.0');
  })

  return <h1 style={{ marginLeft: 24, marginTop: 24 }}>Home Page</h1>;
};

export default HomePage;
