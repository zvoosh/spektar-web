import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";

/** Initializes and returns the global shared socket */
export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const { socket, connect, disconnect } = useSocketStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      connect(token);
    } else {
      disconnect();
    }
  }, [isAuthenticated, token, connect, disconnect]);

  return socket;
}
