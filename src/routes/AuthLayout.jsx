import { Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { Navigate } from "react-router-dom";

export default function AuthLayout() {
   const user = useAppSelector((state) => state.auth.user);

   if (user) {
      return <Navigate to="/" replace />;
   }

   return <Outlet />;
}
