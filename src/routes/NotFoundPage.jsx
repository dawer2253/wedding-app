import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
   Empty,
   EmptyContent,
   EmptyDescription,
   EmptyHeader,
   EmptyMedia,
   EmptyTitle,
} from "@/components/ui/empty";

export default function NotFoundPage() {
   return (
      <div className="flex min-h-screen items-center justify-center p-4">
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <Compass />
               </EmptyMedia>
               <EmptyTitle>404 — nie znaleziono strony</EmptyTitle>
               <EmptyDescription>
                  Strona, której szukasz, nie istnieje albo została
                  przeniesiona.
               </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
               <Button asChild>
                  <Link to="/">Wróć do aplikacji</Link>
               </Button>
            </EmptyContent>
         </Empty>
      </div>
   );
}
