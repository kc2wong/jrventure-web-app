import React from 'react';
import { useBreadcrumb } from '../hooks/use-breadcrumb';

const HomePage: React.FC = () => {
  const { startBreadcrumb } = useBreadcrumb();
  startBreadcrumb('system.menu.0');
  
  return <h1>Home Page</h1>;
};

export default HomePage;
