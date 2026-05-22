import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./RootLayout";
import AuthLayout from "./AuthLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import ProtectedLayout from "./ProtectedLayout";
import OnboardingPage from "@/features/auth/pages/OnboardingPage";
import WeddingSettingsPage from "@/features/wedding/pages/WeddingSettingsPage";
import GuestListPage from "@/features/guests/pages/GuestListPage";
import GuestNewPage from "@/features/guests/pages/GuestNewPage";
import GuestEditPage from "@/features/guests/pages/GuestEditPage";
import BudgetListPage from "@/features/budget/pages/BudgetListPage";
import BudgetSummaryPage from "@/features/budget/pages/BudgetSummaryPage";
import ExpenseNewPage from "@/features/budget/pages/ExpenseNewPage";
import ExpenseEditPage from "@/features/budget/pages/ExpenseEditPage";
import VendorListPage from "@/features/vendors/pages/VendorListPage";
import VendorNewPage from "@/features/vendors/pages/VendorNewPage";
import VendorEditPage from "@/features/vendors/pages/VendorEditPage";
import VendorComparePage from "@/features/vendors/pages/VendorComparePage";
import NotFoundPage from "./NotFoundPage";

export const router = createBrowserRouter([
   {
      element: <AuthLayout />,
      children: [
         {
            path: "/login",
            element: <LoginPage />,
         },
         {
            path: "/signup",
            element: <SignupPage />,
         },
         {
            path: "/reset-password",
            element: <ResetPasswordPage />,
         },
      ],
   },
   {
      element: <ProtectedLayout />,
      children: [
         {
            path: "/onboarding",
            element: <OnboardingPage />,
         },
         {
            element: <RootLayout />,
            children: [
               { index: true, element: <Navigate to="/guests" replace /> },
               { path: "/guests", element: <GuestListPage /> },
               { path: "/guests/new", element: <GuestNewPage /> },
               { path: "/guests/:id/edit", element: <GuestEditPage /> },
               { path: "/budget", element: <BudgetSummaryPage /> },
               { path: "/budget/list", element: <BudgetListPage /> },
               { path: "/budget/new", element: <ExpenseNewPage /> },
               { path: "/budget/:id/edit", element: <ExpenseEditPage /> },
               { path: "/vendors", element: <VendorListPage /> },
               { path: "/vendors/new", element: <VendorNewPage /> },
               { path: "/vendors/:id/edit", element: <VendorEditPage /> },
               {
                  path: "/vendors/compare/:role",
                  element: <VendorComparePage />,
               },
               { path: "/settings", element: <WeddingSettingsPage /> },
            ],
         },
      ],
   },
   { path: "*", element: <NotFoundPage /> },
]);
