"use client";
import { useEffect } from "react";
import { axiosPrivate } from "@/lib/axios";
import { useUserStore } from "@/app/store/useUserStore";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { user } = useUserStore();

  useEffect(() => {
    // Tracks the single in-flight refresh so concurrent 401s don't each
    // trigger their own refresh — they all wait on the same promise.
    let refreshingPromise: Promise<string> | null = null;

    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        // Attach token if not already present (prevents overwriting on retry)
        if (!config.headers["Authorization"] && user?.accessToken) {
          config.headers["Authorization"] = `Bearer ${user.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error?.config;

        console.log("Original request", originalRequest.url)

        if (error?.response?.status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;

          // If a refresh is already in flight, wait for it instead of
          // firing a second one (which would invalidate the rotated cookie)
          if (!refreshingPromise) {
            refreshingPromise = refresh().finally(() => {
              refreshingPromise = null;
            });
          }

          try {
            const newAccessToken = await refreshingPromise;
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axiosPrivate(originalRequest);
          } catch (refreshError) {
            // refresh() already cleared the user and redirected — just propagate
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [refresh]); // re-register when token changes

  return axiosPrivate;
};

export default useAxiosPrivate;