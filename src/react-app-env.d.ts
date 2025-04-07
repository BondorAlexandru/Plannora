/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'react/jsx-runtime' {
  export default any;
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react' {
  namespace React {
    interface Element {}
    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {}
    interface Component {}
    
    // Fix FC definition to work with JSX
    interface FC<P = {}> {
      (props: P): ReactNode;
      displayName?: string;
      defaultProps?: Partial<P>;
      propTypes?: any;
    }
    
    // Add JSXElementConstructor
    type JSXElementConstructor<P> = (props: P) => ReactNode;
    
    namespace JSX {
      interface IntrinsicElements {
        [elemName: string]: any;
      }
    }
    
    // Add hooks definitions
    function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prev: T) => T)) => void];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    function useContext<T>(context: React.Context<T>): T;
    function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void];
    function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
    function useMemo<T>(factory: () => T, deps: any[]): T;
    function useRef<T>(initialValue: T): { current: T };
    
    // Add missing types
    const Fragment: any;
    const StrictMode: any;
    type ReactNode = ReactElement | string | number | boolean | null | undefined | ReactNodeArray;
    interface ReactNodeArray extends Array<ReactNode> {}
    interface FormEvent<T = Element> extends SyntheticEvent<T> {}
    interface SyntheticEvent<T = Element> {
      nativeEvent: Event;
      currentTarget: T;
      target: EventTarget;
      bubbles: boolean;
      cancelable: boolean;
      defaultPrevented: boolean;
      eventPhase: number;
      isTrusted: boolean;
      preventDefault(): void;
      isDefaultPrevented(): boolean;
      stopPropagation(): void;
      isPropagationStopped(): boolean;
      persist(): void;
      timeStamp: number;
      type: string;
    }
  }
  
  // Add hooks directly on the module
  export const useState: typeof React.useState;
  export const useEffect: typeof React.useEffect;
  export const useContext: typeof React.useContext;
  export const useReducer: typeof React.useReducer;
  export const useCallback: typeof React.useCallback;
  export const useMemo: typeof React.useMemo;
  export const useRef: typeof React.useRef;
  
  // Add other missing exports
  export const Fragment: typeof React.Fragment;
  export const StrictMode: typeof React.StrictMode;
  export type ReactNode = React.ReactNode;
  export type ReactNodeArray = React.ReactNodeArray;
  export type FC<P = {}> = React.FC<P>;
  export type JSXElementConstructor<P> = React.JSXElementConstructor<P>;
  export type ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> = React.ReactElement<P, T>;
  export type FormEvent<T = Element> = React.FormEvent<T>;
  export function createContext<T>(defaultValue: T): React.Context<T>;
  export interface Context<T> {
    Provider: React.FC<{ value: T; children?: ReactNode }>;
    Consumer: React.FC<{ children: (value: T) => ReactNode }>;
    displayName?: string;
  }
  
  export = React;
}

declare module 'react-dom/client' {
  export function createRoot(container: any): any;
}

declare module 'date-fns' {
  export function format(date: Date, format: string): string;
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
  
  export function Route(props: RouteProps): any;
  export function Routes(props: RoutesProps): any;
  export function useNavigate(): any;
  export function useSearchParams(): [any, any];
  export function BrowserRouter(props: { children: any }): any;
  export function Link(props: { to: string; className?: string; children: any; [key: string]: any }): any;
  export function Navigate(props: { to: string; replace?: boolean }): any;
  export function Outlet(): any;
  export function useLocation(): any;
  export function useParams(): any;
} 