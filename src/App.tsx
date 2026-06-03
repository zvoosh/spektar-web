import { useRoutes } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import MainLayout from "./components/shared/MainLayout";
import FeedPage from "./pages/Feed/FeedPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

const App = () => {
  const { isAuthenticated } = useAuthStore();

  const routes = useRoutes([
    {
      path: "/",
      element: isAuthenticated ? <MainLayout /> : <LoginPage />,
      children: [{ index: true, element: <FeedPage /> }],
    },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
  ]);

  return routes;
};

export default App;
