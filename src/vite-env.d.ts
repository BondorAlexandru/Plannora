/// <reference types="vite/client" />
/// <reference types="react/jsx-runtime" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'react' {
  // Make FC compatible with JSX
  export interface FC<P = {}> {
    (props: P): JSX.Element;
  }
}

declare module 'react-router-dom' {
  export interface RouteProps {
    path?: string;
    element?: any;
    children?: any;
  }
  
  export interface RoutesProps {
    children?: any;
    location?: any;
  }

  export interface BrowserRouterProps {
    children: any;
    future?: {
      v7_startTransition?: boolean;
      v7_relativeSplatPath?: boolean;
    };
  }
  
  export function Route(props: RouteProps): any;
  export function Routes(props: RoutesProps): any;
  export function BrowserRouter(props: BrowserRouterProps): any;
  export function useNavigate(): any;
  export function useSearchParams(): [any, any];
} 