import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/store/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    const { user, initialized } = useAuth.getState();
    
    if (!initialized) {
      // If auth state is not initialized, we can't be sure if they are logged in or not.
      // We might want to handle this gracefully, but generally beforeLoad runs quickly
      // and we shouldn't block rendering if not strictly necessary, or we should wait.
      // But Zustand state is available immediately if persisted, though Firebase might
      // take a moment to confirm.
      // Actually, since this is an admin route, strict security is preferred.
    }

    if (user?.role !== "admin") {
      throw redirect({
        to: "/admin/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AdminLayoutGuard,
});

function AdminLayoutGuard() {
  return <Outlet />;
}
