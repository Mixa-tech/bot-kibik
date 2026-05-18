import { Hourglass } from "lucide-react";

export function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2a] to-[#0a0a1a] text-white p-6 flex flex-col items-center justify-center text-center">
      <Hourglass size={60} className="text-yellow-400 animate-spin mb-6" style={{ animationDuration: '3s' }} />
      <h1 className="text-3xl font-black tracking-tighter mb-2">ЗАЯВКА НА РАССМОТРЕНИИ</h1>
      <p className="text-neutral-400 max-w-sm">
        Мы получили вашу анкету. Администратор скоро рассмотрит её.
        Пожалуйста, ожидайте. Вы получите уведомление о решении.
      </p>
    </div>
  );
}