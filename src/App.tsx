import { lazy, Suspense } from "react";
import { useRoutes, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import MainLayout from "./components/shared/MainLayout";
import AuthModal from "./components/shared/AuthModal";

// ─── Eager (needed immediately on first paint) ────────────────────────────────
import FeedPage from "./pages/Feed/FeedPage";

// ─── Lazy (code-split, loaded on navigation) ─────────────────────────────────
const PostDetailPage      = lazy(() => import("./pages/Post/PostDetailPage"));
const CreatePostPage      = lazy(() => import("./pages/Post/CreatePostPage"));
const CommunityPage       = lazy(() => import("./pages/Community/CommunityPage"));
const CommunitiesPage     = lazy(() => import("./pages/Communities/CommunitiesPage"));
const CreateCommunityPage = lazy(() => import("./pages/Communities/CreateCommunityPage"));
const SavedPage           = lazy(() => import("./pages/Saved/SavedPage"));
const NotificationsPage   = lazy(() => import("./pages/Notifications/NotificationsPage"));
const ProfilePage         = lazy(() => import("./pages/Profile/ProfilePage"));
const PublicProfilePage   = lazy(() => import("./pages/Profile/PublicProfilePage"));
const ChatPage            = lazy(() => import("./pages/Chat/ChatPage"));
const PopularPage         = lazy(() => import("./pages/Popular/PopularPage"));
const SearchPage          = lazy(() => import("./pages/Search/SearchPage"));
const SettingsPage        = lazy(() => import("./pages/Settings/SettingsPage"));
const ResetPasswordPage   = lazy(() => import("./pages/Auth/ResetPasswordPage"));

// ─── Fallback spinner ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center py-24 text-text-3 text-[13px]">
    <div className="w-5 h-5 border-2 border-border border-t-accent rounded-full animate-spin mr-3" />
    Učitavam...
  </div>
);

// ─── Auth guard ───────────────────────────────────────────────────────────────
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ─── Route definitions ────────────────────────────────────────────────────────
const mainChildren = [
  { index: true, element: <FeedPage /> },
  { path: "post/:id",    element: <PostDetailPage /> },
  { path: "c/:slug",     element: <CommunityPage /> },
  { path: "communities", element: <CommunitiesPage /> },
  { path: "popular",     element: <PopularPage /> },
  { path: "search",      element: <SearchPage /> },
  { path: "u/:username", element: <PublicProfilePage /> },
  {
    path: "new-post",
    element: <PrivateRoute><CreatePostPage /></PrivateRoute>,
  },
  {
    path: "communities/new",
    element: <PrivateRoute><CreateCommunityPage /></PrivateRoute>,
  },
  {
    path: "saved",
    element: <PrivateRoute><SavedPage /></PrivateRoute>,
  },
  {
    path: "notifications",
    element: <PrivateRoute><NotificationsPage /></PrivateRoute>,
  },
  {
    path: "profile",
    element: <PrivateRoute><ProfilePage /></PrivateRoute>,
  },
  {
    path: "chat",
    element: <PrivateRoute><ChatPage /></PrivateRoute>,
  },
  {
    path: "chat/:conversationId",
    element: <PrivateRoute><ChatPage /></PrivateRoute>,
  },
  {
    path: "settings",
    element: <PrivateRoute><SettingsPage /></PrivateRoute>,
  },
];

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  const location = useLocation();
  const state = location.state as { background?: Location } | null;

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/register";
  const backgroundLocation =
    state?.background ?? (isAuthRoute ? ({ pathname: "/" } as unknown as Location) : location);

  const mainRoutes = useRoutes(
    [
      {
        path: "/",
        element: <MainLayout />,
        children: mainChildren,
      },
      {
        path: "/reset-password",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ResetPasswordPage />
          </Suspense>
        ),
      },
    ],
    backgroundLocation
  );

  const authRoutes = useRoutes([
    { path: "/login",    element: <AuthModal mode="login" /> },
    { path: "/register", element: <AuthModal mode="register" /> },
  ]);

  return (
    <Suspense fallback={<PageLoader />}>
      {mainRoutes}
      {isAuthRoute && authRoutes}
    </Suspense>
  );
};

export default App;
