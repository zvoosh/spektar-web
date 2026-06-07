import { useRoutes, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import MainLayout from "./components/shared/MainLayout";
import AuthModal from "./components/shared/AuthModal";
import FeedPage from "./pages/Feed/FeedPage";
import PostDetailPage from "./pages/Post/PostDetailPage";
import CreatePostPage from "./pages/Post/CreatePostPage";
import CommunityPage from "./pages/Community/CommunityPage";
import CommunitiesPage from "./pages/Communities/CommunitiesPage";
import CreateCommunityPage from "./pages/Communities/CreateCommunityPage";
import SavedPage from "./pages/Saved/SavedPage";
import NotificationsPage from "./pages/Notifications/NotificationsPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import PublicProfilePage from "./pages/Profile/PublicProfilePage";
import ChatPage from "./pages/Chat/ChatPage";
import PopularPage from "./pages/Popular/PopularPage";
import SearchPage from "./pages/Search/SearchPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";

// Wrapper za rute koje zahtevaju login
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Definicija svih child ruta (reuse za oba useRoutes poziva)
const mainChildren = [
  { index: true, element: <FeedPage /> },
  { path: "post/:id", element: <PostDetailPage /> },
  { path: "c/:slug", element: <CommunityPage /> },
  { path: "communities", element: <CommunitiesPage /> },
  { path: "popular", element: <PopularPage /> },
  { path: "search", element: <SearchPage /> },
  { path: "u/:username", element: <PublicProfilePage /> },
  {
    path: "new-post",
    element: (
      <PrivateRoute>
        <CreatePostPage />
      </PrivateRoute>
    ),
  },
  {
    path: "communities/new",
    element: (
      <PrivateRoute>
        <CreateCommunityPage />
      </PrivateRoute>
    ),
  },
  {
    path: "saved",
    element: (
      <PrivateRoute>
        <SavedPage />
      </PrivateRoute>
    ),
  },
  {
    path: "notifications",
    element: (
      <PrivateRoute>
        <NotificationsPage />
      </PrivateRoute>
    ),
  },
  {
    path: "profile",
    element: (
      <PrivateRoute>
        <ProfilePage />
      </PrivateRoute>
    ),
  },
  {
    path: "chat",
    element: (
      <PrivateRoute>
        <ChatPage />
      </PrivateRoute>
    ),
  },
  {
    path: "chat/:conversationId",
    element: (
      <PrivateRoute>
        <ChatPage />
      </PrivateRoute>
    ),
  },
  {
    path: "settings",
    element: (
      <PrivateRoute>
        <SettingsPage />
      </PrivateRoute>
    ),
  },
];

const App = () => {
  const location = useLocation();
  const state = location.state as { background?: Location } | null;

  // Background location — stranica koja ostaje iza auth modala
  // Ako nema background state (direktna navigacija na /login), koristi "/" kao fallback
  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";
  const backgroundLocation = state?.background ?? (isAuthRoute ? ({ pathname: "/" } as unknown as Location) : location);

  // Glavne rute renderovane na background lokaciji (vidljive iza modala)
  const mainRoutes = useRoutes(
    [
      { path: "/", element: <MainLayout />, children: mainChildren },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
    backgroundLocation
  );

  // Auth modal rute — renderuju se kao overlay iznad pozadine
  const authRoutes = useRoutes([
    { path: "/login", element: <AuthModal mode="login" /> },
    { path: "/register", element: <AuthModal mode="register" /> },
  ]);

  return (
    <>
      {mainRoutes}
      {isAuthRoute && authRoutes}
    </>
  );
};

export default App;
