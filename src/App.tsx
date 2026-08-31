import { Routes, Route } from 'react-router';
import { Toaster } from 'sonner';
import { PapelProvider } from '@/lib/papel';
import Layout from '@/components/Layout';
import NovaProposta from '@/pages/NovaProposta';
import Kanban from '@/pages/Kanban';
import Minhas from '@/pages/Minhas';
import Diretor from '@/pages/Diretor';

export default function App() {
  return (
    <PapelProvider>
      <Routes>
        {/* Rotas internas — shell com OpsSidebar (Layout renderiza <Outlet/>) */}
        <Route element={<Layout />}>
          <Route path="/" element={<NovaProposta />} />
          <Route path="/nova" element={<NovaProposta />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/minhas" element={<Minhas />} />
          <Route path="/diretor" element={<Diretor />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" richColors />
    </PapelProvider>
  );
}
