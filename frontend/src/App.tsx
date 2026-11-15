import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Loading } from "@/components/States";
import { useAuth } from "@/stores/auth";
import HomePage from "@/pages/Home";
import { LoginPage, SignupPage } from "@/pages/AuthPages";

const SearchPage = lazy(() => import("@/pages/Search"));
const LibraryPage = lazy(() => import("@/pages/Library"));
const PlaylistPage = lazy(() => import("@/pages/Playlist"));
const ProfilePage = lazy(() => import("@/pages/Profile"));
const UploadPage = lazy(() => import("@/pages/Upload"));
const AssistantPage = lazy(() => import("@/pages/Assistant"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
const AdminPage = lazy(() => import("@/pages/Admin"));

function Guard({ children, admin }: { children: React.ReactNode; admin?: boolean }) {
  const { user, checking } = useAuth(); const loc = useLocation();
  if (checking) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  if (admin && !user.isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const init = useAuth((s) => s.init);
  useEffect(() => { void init(); }, [init]);
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route index element={<HomePage />} />
          <Route path="search" element={<Suspense fallback={<Loading />}><SearchPage /></Suspense>} />
          <Route path="playlist/:id" element={<Suspense fallback={<Loading />}><PlaylistPage /></Suspense>} />
          <Route path="u/:id" element={<Suspense fallback={<Loading />}><ProfilePage /></Suspense>} />
          <Route path="library" element={<Guard><Suspense fallback={<Loading />}><LibraryPage /></Suspense></Guard>} />
          <Route path="upload" element={<Guard><Suspense fallback={<Loading />}><UploadPage /></Suspense></Guard>} />
          <Route path="assistant" element={<Guard><Suspense fallback={<Loading />}><AssistantPage /></Suspense></Guard>} />
          <Route path="settings" element={<Guard><Suspense fallback={<Loading />}><SettingsPage /></Suspense></Guard>} />
          <Route path="admin" element={<Guard admin><Suspense fallback={<Loading />}><AdminPage /></Suspense></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
