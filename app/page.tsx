import { ViolationForm } from "../components/ViolationForm";

export default function Home() {
  return (
    <main className="min-h-screen py-10 px-4 bg-[#F8F9FA] flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <ViolationForm />
      </div>
    </main>
  );
}
