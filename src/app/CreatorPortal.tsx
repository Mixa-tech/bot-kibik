import { useApp } from "../../AppContext";
import { CreatorApplyPage } from "./CreatorApplyPage";
import { CreatorDashboard } from "./CreatorDashboard";
import { PendingApprovalPage } from "./PendingApprovalPage";

export function CreatorPortal() {
  const { creatorProfile } = useApp();

  // Пока профиль грузится, показываем пустой экран
  if (creatorProfile === undefined) {
    return <div className="size-full bg-[#0a0a0a]" />;
  }

  // Если профиля нет, показываем форму заявки
  if (creatorProfile === null) {
    return <CreatorApplyPage />;
  }

  // Если заявка на рассмотрении
  if (creatorProfile.status === 'pending') {
    return <PendingApprovalPage />;
  }

  // Если заявка отклонена
  if (creatorProfile.status === 'rejected') {
    return <div className="size-full bg-red-950 text-white flex items-center justify-center">Ваша заявка была отклонена.</div>;
  }

  // Если всё хорошо, показываем дашборд
  return <CreatorDashboard />;
}