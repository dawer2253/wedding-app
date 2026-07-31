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
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signUp } from "../api";

export default function SignupPage() {
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm();

   async function onSubmit(data) {
      try {
         await dispatch(
            signUp({
               email: data.email,
               password: data.password,
            }),
         ).unwrap();
         toast.success("Zarejestrowano!");
         navigate("/");
      } catch (err) {
         toast.error(err);
      }
   }

   return (
      <Card className="w-full max-w-md">
         <CardHeader>
            <CardTitle className="text-xl">Zarejestruj się</CardTitle>
            <CardDescription>
               Załóż konto i zacznij planować wesele
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
               <Input
                  label="Hasło"
                  type="password"
                  {...register("password", {
                     minLength: {
                        value: 8,
                        message: "Hasło musi mieć min. 8 znaków",
                     },
                     required: "Hasło wymagane",
                  })}
                  error={errors.password?.message}
               />
               <Input
                  label="Potwierdź hasło"
                  type="password"
                  {...register("passwordConfirm", {
                     required: "Powtórz hasło",
                     validate: (value, formValues) =>
                        value === formValues.password ||
                        "Hasła się nie zgadzają",
                  })}
                  error={errors.passwordConfirm?.message}
               />
               <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Spinner />}
                  Zarejestruj się
               </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
               Masz konto?{" "}
               <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
               >
                  Zaloguj się
               </Link>
            </p>
         </CardContent>
      </Card>
   );
}
