import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Create from '../pages/Create';

interface ReactRouterWrapperProps {
  children?: ReactNode;
}

export default function ReactRouterWrapper({ children }: ReactRouterWrapperProps) {
  return (
    <BrowserRouter children={
      <>
        <Create />
        {children}
      </>
    } />
  );
} 