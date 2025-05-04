import AuthForm from "@/components/SignInForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">

    <AuthForm/>
    </div>
  );
}
