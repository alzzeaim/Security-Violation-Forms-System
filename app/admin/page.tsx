import { AdminPanel } from "../../components/AdminPanel";

export const metadata = {
  title: "لوحة الإدارة | نظام تسجيل المخالفات الأمنية",
  description: "إدارة وتعديل بيانات موظفي ومشرفي أمن موقع القدية.",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen py-10 bg-gray-50 flex items-center justify-center">
      <AdminPanel />
    </main>
  );
}
