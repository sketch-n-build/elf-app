"use client";
import { useUserStore } from "@/app/store/useUserStore";
import useAxiosPrivate from "./useAxiosPrivate";

const useLogout = () => {
  const { clearUser } = useUserStore();
  const axiosPrivate = useAxiosPrivate();

  const logout = async () => {
    try {
      await axiosPrivate.post("/api/auth/logout");
    } catch {
      // Swallow — always clear client state regardless of server response
    } finally {
      clearUser();
      sessionStorage.clear();
      window.location.href = "/auth/login";
    }
  };

  return { logout };
};

export default useLogout;