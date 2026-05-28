import Input from "@/components/Input";
import Button from "@/components/Button";
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
      <div className="max-w-md mx-auto mt-20 p-6 bg-white">
         <Link
            className="text-sm text-rose-600 hover:text-rose-800"
            to="/login"
         >
            &#8592; Wróć do strony logowania
         </Link>
         <div className="flex justify-center my-6">
            <h1>Register</h1>
         </div>
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
                     value: 6,
                     message: "Hasło musi mieć min 6 znaków",
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
                     value === formValues.password || "Hasła się nie zgadzają",
               })}
               error={errors.passwordConfirm?.message}
            />
            <div className="flex justify-end ">
               <Button disabled={isSubmitting} variant="primary">
                  Zarejestruj się
               </Button>
            </div>
         </form>
      </div>
   );
}
