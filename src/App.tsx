import { useRoutes, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import MainLayout from "./components/shared/MainLayout";
import FeedPage from "./pages/Feed/FeedPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
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

const ProtectedLayout = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <MainLayout />;
};

const App = () => {
  const routes = useRoutes([
    {
      path: "/",
      element: <ProtectedLayout />,
      children: [
        { index: true, element: <FeedPage /> },
        { path: "post/:id", element: <PostDetailPage /> },
        { path: "new-post", element: <CreatePostPage /> },
        { path: "c/:slug", element: <CommunityPage /> },
        { path: "communities", element: <CommunitiesPage /> },
        { path: "communities/new", element: <CreateCommunityPage /> },
        { path: "saved", element: <SavedPage /> },
        { path: "notifications", element: <NotificationsPage /> },
        { path: "profile", element: <ProfilePage /> },
        { path: "u/:username", element: <PublicProfilePage /> },
        { path: "chat", element: <ChatPage /> },
        { path: "chat/:conversationId", element: <ChatPage /> },
        { path: "popular", element: <PopularPage /> },
        { path: "search", element: <SearchPage /> },
      ],
    },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
  ]);

  return routes;
};

export default App;
