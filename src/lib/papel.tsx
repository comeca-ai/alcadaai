import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Contexto global de papel (demo v0): alterna o que o app mostra.
 * - 'vendedor' → Nizan Jhon (NJ), alçada própria até 5%
 * - 'diretor'  → Diretor Comercial (DC), alçada total
 * O seletor vive no rodapé da OpsSidebar.
 */
export type Papel = 'vendedor' | 'diretor';

export interface PapelInfo {
  papel: Papel;
  nome: string;
  iniciais: string;
  cargo: string;
}

const PAPEIS: Record<Papel, Omit<PapelInfo, 'papel'>> = {
  vendedor: { nome: 'Nizan Jhon', iniciais: 'NJ', cargo: 'Vendedor' },
  diretor: { nome: 'Diretor Comercial', iniciais: 'DC', cargo: 'Diretor' },
};

interface PapelContextValue extends PapelInfo {
  setPapel: (p: Papel) => void;
}

const PapelContext = createContext<PapelContextValue | null>(null);

export function PapelProvider({ children }: { children: ReactNode }) {
  const [papel, setPapel] = useState<Papel>('vendedor');
  const value = useMemo<PapelContextValue>(
    () => ({ papel, setPapel, ...PAPEIS[papel] }),
    [papel],
  );
  return <PapelContext.Provider value={value}>{children}</PapelContext.Provider>;
}

export function usePapel(): PapelContextValue {
  const ctx = useContext(PapelContext);
  if (!ctx) throw new Error('usePapel deve ser usado dentro de <PapelProvider>');
  return ctx;
}
