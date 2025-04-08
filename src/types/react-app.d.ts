import 'react';

declare module 'react' {
  // Override the ReactNode type to be compatible with both React 18 types
  export type ReactNode = 
    | React.ReactElement<any, any>
    | React.ReactFragment
    | React.ReactPortal
    | boolean
    | null
    | undefined;
} 