// Fix React type compatibility
import 'react';

declare module 'react' {
  // Ensure ReactNode includes ReactElement types
  export interface ReactNode {
    children?: ReactNode;
  }
} 