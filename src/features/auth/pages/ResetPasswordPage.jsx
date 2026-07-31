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
import { Link } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";
import { resetPassword } from "../api";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ResetPasswordPage() {
   //TODO: Recovery po kliknięciu w maila

   const dispatch = useAppDispatch();
   const navigate = useNavigate();

   async function onEmailSubmit({ email }) {
      try {
         await dispatch(resetPassword(email)).unwrap();
         toast.success(
            "Jeżeli email istnieje wysłano na niego link do zresetowania hasła",
         );
         navigate("/login");
      } catch (err) {
         toast.error(err);
      }
   }

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm();

   return (
      <Card className="w-full max-w-md">
         <CardHeader>
            <CardTitle className="text-xl">Zresetuj hasło</CardTitle>
            <CardDescription>
               Podaj e-mail, a wyślemy Ci link do zresetowania hasła
            </CardDescription>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
               <Input
                  label="E-mail"
                  type="email"
                  {...register("email", { required: "E-mail wymagany" })}
                  error={errors.email?.message}
               />
               <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Wyślij link
               </Button>
            </form>
            <p className="mt-6 text-center text-sm">
               <Link to="/login" className="text-primary hover:underline">
                  &#8592; Wróć do logowania
               </Link>
            </p>
         </CardContent>
      </Card>
   );
}
