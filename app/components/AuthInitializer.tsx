"use client";
import { useEffect, useRef } from "react";
import axios from "axios";
import { useUserStore } from "@/app/store/useUserStore";

/**
 * Mounted once in root layout.
 * On hard reload, isAuthenticated is still true (persisted in sessionStorage)
 * but user/accessToken are gone (they are NOT persisted — by design).
 * This fires a single silent POST /api/auth/refresh to re-hydrate the store.
 * Uses plain axios to avoid the axiosPrivate interceptor looping on itself.
 */
const AuthInitializer = () => {
  // const { isAuthenticated, setUser, clearUser } = useUserStore();
  // const attempted = useRef(false); // guard against StrictMode double-fire

  // console.log("Auth initializer")

  
  // useEffect(() => {
  //   console.log("Auth initializer data")
  //   if (!isAuthenticated || attempted.current) return;
  //   attempted.current = true;

  //   console.log("Before silent refresh function")
  //   const silentRefresh = async () => {
  //     try {
  //       const { data } = await axios.post(
  //         "/api/auth/refresh",
  //         {},
  //         { withCredentials: true }
  //       );

  //       const { accessToken, id, email, firstName, lastName, role } = data.data;
        
  //       // Decode the JWT payload to rebuild the user object without a /me call.
  //       // The payload is not sensitive — it is already on the client.
  //       // const payloadB64 = accessToken.split(".")[1];
  //       // const payload    = JSON.parse(atob(payloadB64));

  //       setUser({
  //         id,   
  //         email,
  //         firstName,
  //         lastName,
  //         role,
  //         accessToken,
  //       });
  //     } catch {
  //       // Cookie is gone or expired — clear the persisted flag.
  //       // The user will be sent to /auth/login on their next protected action.
  //       clearUser();
  //     }
  //   };

  //   silentRefresh();
  // }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // return null;
};

export default AuthInitializer;