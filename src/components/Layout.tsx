import { Outlet } from 'react-router';
import OpsSidebar from '@/components/OpsSidebar';

/**
 * Shell das rotas internas: grid 238px (sidebar escura) + conteúdo.
 * Padrão B do contrato Layout+routing (renderiza <Outlet/>) —
 * App.tsx usa <Route> aninhadas.
 */
export default function Layout() {
  return (
    <div className="grid min-h-[100dvh] grid-cols-[238px_1fr] bg-al-cream text-al-ink">
      <OpsSidebar />
      <main className="min-w-0 px-[30px] pb-[60px] pt-6">
        <Outlet />
      </main>
    </div>
  );
}
