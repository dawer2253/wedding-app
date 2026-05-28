import { Outlet } from "react-router-dom";
import Button from "@/components/Button";
import { useAppDispatch } from "@/app/hooks";
import { toast } from "sonner";
import { signOut } from "@/features/auth/api";

export default function RootLayout() {
   const dispatch = useAppDispatch();
   async function handleLogout() {
      try {
         await dispatch(signOut()).unwrap;
         toast.success("Wylogowano");
      } catch (err) {
         toast.error(err);
      }
   }
   return (
      <>
         <Button onClick={handleLogout}>Logout</Button>
         <Outlet />
      </>
   );
}
