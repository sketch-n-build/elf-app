"use client";
import axios from "axios";                        // ← plain axios, NOT axiosPrivate
import { useUserStore } from "@/app/store/useUserStore";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const useRefreshToken = () => {
  const { setUser, clearUser } = useUserStore();
  const router = useRouter();

  const refresh = async (): Promise<string> => {
    try {
      // ✅ Use plain axios here — axiosPrivate would go through the response
      //    interceptor in useAxiosPrivate, which on 401 calls refresh() again,
      //    creating an infinite loop. Plain axios bypasses the interceptor entirely.
      console.log("Running useRefreshToken Hook")
      const res = await axios.post(
        "/api/auth/refresh",
        {},
        { withCredentials: true }  // needed so the httpOnly cookie is sent
      );

      const { accessToken, id, email, firstName, lastName, role } = res.data.data;

      setUser((prev) => {
        // On hard reload AuthInitializer sets the full user before any API
        // call fires, so prev should always exist here. Guard just in case.
        if (!prev) {
          return { id, email, firstName, lastName, role, accessToken };
        }
        return { ...prev, accessToken };
      });

      console.log("new accessToken added", accessToken)

      return accessToken;
    } catch (error: unknown) {
      let status: number | undefined;

      if (axios.isAxiosError(error)) {
        status = error.response?.status;
      }

      if (status === 401 || status === 403) {
        toast.warning("Your session has expired. Please log in again.", {
          autoClose: 5000,
        });
      } else {
        toast.error("Session error. Please log in again.", { autoClose: 5000 });
      }

      clearUser();

      const from = typeof window !== "undefined"
        ? encodeURIComponent(window.location.pathname)
        : "";
      router.push(`/auth/login${from ? `?from=${from}` : ""}`);

      throw error;
    }
  };

  return refresh;
};

export default useRefreshToken;