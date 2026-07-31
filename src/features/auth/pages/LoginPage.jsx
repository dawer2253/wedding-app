import Input from "@/components/Input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { login } from "../api";

export default function LoginPage() {
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const location = useLocation();

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm();

   async function onSubmit(data) {
      try {
         await dispatch(login(data)).unwrap();
         toast.success("Zalogowano");
         navigate(location.state?.from?.pathname ?? "/");
      } catch (err) {
         toast.error(err);
      }
   }

   return (
      <Card className="w-full max-w-md">
         <CardHeader>
            <CardTitle className="text-xl">Zaloguj się</CardTitle>
            <CardDescription>
               Zaplanuj swoje wesele w jednym miejscu
            </CardDescription>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <Input
                  label="E-mail"
                  type="email"
                  {...register("email", { required: "E-mail wymagany" })}
                  error={errors.email?.message}
               />
               <div>
                  <Input
                     label="Hasło"
                     type="password"
                     {...register("password", { required: "Hasło wymagane" })}
                     error={errors.password?.message}
                  />
                  <div className="mt-1.5 flex justify-end">
                     <Link
                        to="/reset-password"
                        className="text-sm text-primary hover:underline"
                     >
                        Zapomniałeś hasła?
                     </Link>
                  </div>
               </div>
               <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Zaloguj się
               </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
               Nie masz konta?{" "}
               <Link
                  to="/signup"
                  className="font-medium text-primary hover:underline"
               >
                  Zarejestruj się
               </Link>
            </p>
         </CardContent>
      </Card>
   );
}
