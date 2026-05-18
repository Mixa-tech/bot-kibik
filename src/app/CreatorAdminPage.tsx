import { Check, ShieldX, UserCheck, X } from "lucide-react";
import { useApp } from "../../AppContext";

export function CreatorAdminPage() {
  const { creatorProfiles, updateCreatorStatus } = useApp();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <h1 className="text-2xl font-black tracking-wider mb-4">Заявки Креаторов</h1>
      <div className="flex flex-col gap-3">
        {creatorProfiles.map(profile => (
          <div key={profile.id} className="p-4 rounded-2xl bg-[#111] border border-[#222] flex items-center gap-4">
            <img src={profile.avatar_url || ''} className="w-14 h-14 rounded-full object-cover bg-neutral-700" />
            <div className="flex-1">
              <div className="font-bold">{profile.display_name}</div>
              <div className="text-sm text-neutral-400">{profile.tg_username}</div>
              <div className="text-xs text-neutral-500 font-mono mt-1">ID: {profile.user_id}</div>
            </div>
            
            {profile.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => updateCreatorStatus(profile.id, 'approved')} className="p-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20"><Check /></button>
                <button onClick={() => updateCreatorStatus(profile.id, 'rejected')} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20"><X /></button>
              </div>
            )}

            {profile.status === 'approved' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-green-400 flex items-center gap-1.5"><UserCheck size={16}/> Одобрен</span>
                <button onClick={() => updateCreatorStatus(profile.id, 'untrusted')} className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20" title="Сделать недоверенным">
                  <ShieldX size={16} />
                </button>
              </div>
            )}

            {profile.status === 'untrusted' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-yellow-400 flex items-center gap-1.5"><ShieldX size={16}/> Недоверенный</span>
                 <button onClick={() => updateCreatorStatus(profile.id, 'approved')} className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20" title="Вернуть доверие">
                  <UserCheck size={16} />
                </button>
              </div>
            )}

            {profile.status === 'rejected' && (
              <span className="text-sm font-bold text-red-400">Отклонен</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}