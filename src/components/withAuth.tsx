import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import type { ComponentType } from "react";

export function withAuth<T extends object>(WrappedComponent: ComponentType<T>) {
  return function WithAuthComponent(props: T) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user && router.pathname !== "/auth") {
        router.replace("/auth");
      }
      // Redirect away from auth page if already logged in
      if (!loading && user && router.pathname === "/auth") {
        router.replace("/dashboard");
      }
    }, [user, loading, router]);

    // Show nothing while loading
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    // If on auth page and not logged in, show the component
    if (!user && router.pathname === "/auth") {
      return <WrappedComponent {...props} />;
    }

    // If logged in and not on auth page, show the component
    if (user && router.pathname !== "/auth") {
      return <WrappedComponent {...props} />;
    }

    // Otherwise show nothing while redirecting
    return null;
  };
}
