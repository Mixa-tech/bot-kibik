import { Hourglass } from "lucide-react";

export function PendingApprovalPage() {
  return (
    <div className="min-h-screen text-white p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center scale-110" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop)', filter: 'blur(4px)' }} />
      <div className="absolute inset-0 bg-slate-900/70" />
      <div className="relative z-10 flex flex-col items-center">
        <Hourglass size={60} className="text-yellow-400 animate-spin mb-6" style={{ animationDuration: '3s' }} />
        <h1 className="text-4xl font-black tracking-tighter mb-2 drop-shadow-lg">ЗАЯВКА НА РАССМОТРЕНИИ</h1>
        <p className="text-neutral-300 max-w-sm">
          Мы получили вашу анкету. Администратор скоро рассмотрит её.
          Пожалуйста, ожидайте. Вы получите уведомление о решении.
        </p>
      </div>
    </div>
  );
}