import { memo } from "react";

interface FriendRequest {
  id: string;
  requesterId: string;
  requester?: { username?: string; avatar?: string };
}

interface Friend {
  id: string;
  username?: string;
  avatar?: string;
  bio?: string;
}

interface Props {
  friends: Friend[] | undefined;
  pendingRequests: FriendRequest[] | undefined;
  onAccept: (requesterId: string) => void;
  onReject: (requesterId: string) => void;
  acceptPending: boolean;
  rejectPending: boolean;
}

const ProfileFriendsTab = memo(({ friends, pendingRequests, onAccept, onReject, acceptPending, rejectPending }: Props) => (
  <div className="space-y-4">
    {/* Pending requests */}
    {(pendingRequests?.length ?? 0) > 0 && (
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
        <div className="px-5 py-3.5 border-b border-surface-2">
          <span className="font-semibold text-[13px] text-text-1">
            Zahtevi za prijateljstvo
            <span className="ml-2 px-2 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold">
              {pendingRequests!.length}
            </span>
          </span>
        </div>
        {pendingRequests!.map((req) => (
          <div key={req.id} className="flex items-center gap-3 px-5 py-3 border-b border-surface-2 last:border-b-0">
            <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent overflow-hidden border border-border shrink-0">
              {req.requester?.avatar
                ? <img loading="lazy" src={req.requester.avatar} alt="" className="w-full h-full object-cover" />
                : req.requester?.username?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text-1">{req.requester?.username}</div>
              <div className="text-[11px] text-text-3">želi da te doda kao prijatelja</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => onAccept(req.requesterId)}
                disabled={acceptPending}
                className="px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-semibold border-none cursor-pointer hover:bg-accent-hover disabled:opacity-50"
              >
                Prihvati
              </button>
              <button
                onClick={() => onReject(req.requesterId)}
                disabled={rejectPending}
                className="px-3 py-1.5 rounded-lg border border-border text-text-2 text-[12px] bg-surface cursor-pointer hover:bg-surface-2-2 disabled:opacity-50"
              >
                Odbij
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Friends list */}
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="px-5 py-3.5 border-b border-surface-2">
        <span className="font-semibold text-[13px] text-text-1">
          Prijatelji ({friends?.length ?? 0})
        </span>
      </div>
      {!friends?.length ? (
        <div className="text-center py-10">
          <div className="text-[36px] mb-2">👋</div>
          <div className="font-serif text-[14px] text-text-1 mb-1">Nema prijatelja još</div>
          <div className="text-[12px] text-text-3">Pronađi ljude kroz pretragu</div>
        </div>
      ) : (
        friends.map((friend) => (
          <div key={friend.id} className="flex items-center gap-3 px-5 py-3 border-b border-surface-2 last:border-b-0 hover:bg-surface-2-2 transition-colors">
            <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent overflow-hidden border border-border shrink-0">
              {friend.avatar
                ? <img loading="lazy" src={friend.avatar} alt="" className="w-full h-full object-cover" />
                : friend.username?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-text-1">{friend.username}</div>
              {friend.bio && <div className="text-[11px] text-text-3 truncate">{friend.bio}</div>}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
));

export default ProfileFriendsTab;
