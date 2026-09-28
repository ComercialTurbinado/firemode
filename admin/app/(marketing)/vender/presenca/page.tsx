import { redirect } from "next/navigation";

/** URL antiga da LP — canônica agora é a raiz `/`. */
export default function VenderPresencaRedirect() {
  redirect("/");
}
