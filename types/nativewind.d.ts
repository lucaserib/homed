declare module 'nativewind' {
  import React, { ComponentType } from 'react';

  /**
   * Tipo para componentes estilizados do NativeWind
   */
  export function styled<T extends ComponentType<any>>(Component: T): T & { className?: string };

  /**
   * Hook para classes condicionais
   */
  export function useColorScheme(): 'light' | 'dark';

  /**
   * Utilitário para classnames
   */
  export function clsx(...inputs: (string | Record<string, boolean> | null | undefined)[]): string;

  export function withExpoSnack(Component: any): any;
}
