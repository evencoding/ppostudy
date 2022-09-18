import { User } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

interface ProfileResponse {
  ok: boolean;
  profile: User;
}

export default function useUser(pathname = "") {
  const { data, error } = useSWR<ProfileResponse>("/api/user/me");
  const router = useRouter();
  useEffect(() => {
    let isPublic = false;
    if (pathname == "/enter" || "/signin") {
      isPublic = true;
    }
    if (!isPublic) {
      router.push("/enter");
    }
  }, [data, router, pathname]);
  return { user: data?.profile, isLoading: !data && !error };
}
