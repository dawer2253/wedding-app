import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";

export default function ProtectedLayout() {
   const user = useAppSelector((state) => state.auth.user);
   const location = useLocation();

   if (!user) {
      return <Navigate to="/login" replace state={{ from: location }} />;
   }

   return (
      <>
         <Outlet />
      </>
   );
}
