import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, UserPlus, UserX, Ban } from "lucide-react";
import { communitiesApi } from "@/api/communities";
import type { Community } from "@/types";

const ROLE_SR: Record<string, string> = {
  owner: "Vlasnik",
  moderator: "Moderator",
  member: "ÄŒlan",
};

interface Props {
  community: Community;
  members: any[];
  isOwner: boolean;
  isMod: boolean;
  currentUserId?: string;
  onShowInvite: () => void;
}

const CommunityMembersTab = memo(({ community, members, isOwner, isMod, currentUserId, onShowInvite }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const invalidateMembers = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["members", community.id] }),
    [queryClient, community.id]
  );

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "moderator" | "member" }) =>
      communitiesApi.setMemberRole(community.id, userId, role),
    onSuccess: () => {
      toast.success("Uloga je promenjena");
      invalidateMembers();
    },
    onError: () => toast.error("Promena uloge nije uspela"),
  });

  const kickMutation = useMutation({
    mutationFn: (userId: string) => communitiesApi.kickMember(community.id, userId),
    onSuccess: () => {
      toast.success("Korisnik je izbaÄen");
      invalidateMembers();
    },
    onError: () => toast.error("Izbacivanje nije uspelo"),
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) => communitiesApi.banMember(community.id, userId),
    onSuccess: () => {
      toast.success("Korisnik je banovan");
      invalidateMembers();
    },
    onError: () => toast.error("Banovanje nije uspelo"),
  });

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="px-5 py-4 border-b border-surface-2 flex items-center justify-between">
        <span className="font-semibold text-[14px] text-text-1">
          ÄŒlanovi ({community.membersCount.toLocaleString("sr-RS")})
        </span>
        {isMod && (
          <button
            onClick={onShowInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] text-text-2 bg-surface cursor-pointer hover:bg-accent-soft hover:text-accent hover:border-accent transition-colors"
          >
            <UserPlus size={13} strokeWidth={2} />
            Pozovi
          </button>
        )}
      </div>

      {!members?.length ? (
        <div className="text-center py-10 text-text-3 text-[13px]">Nema Älanova</div>
      ) : (
        members.map((m: any) => (
          <div
            key={m.id}
            className="flex items-center gap-3 px-5 py-3 border-b border-surface-2 last:border-b-0 hover:bg-surface-2-2 transition-colors"
          >
            <div
              onClick={() => navigate(`/u/${m.user?.username}`)}
              className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent overflow-hidden border border-border shrink-0 cursor-pointer hover:opacity-80"
            >
              {m.user?.avatar ? (
                <img loading="lazy" src={m.user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                m.user?.username?.slice(0, 2).toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <div
                onClick={() => navigate(`/u/${m.user?.username}`)}
                className="text-[13px] font-medium text-text-1 cursor-pointer hover:text-accent transition-colors"
              >
                {m.user?.username}
              </div>
              <div className="text-[11px] text-text-3">{ROLE_SR[m.role] ?? m.role}</div>
            </div>

            <div className="text-[11px] text-text-3 mr-2">
              {new Date(m.joinedAt).toLocaleDateString("sr-RS")}
            </div>

            {/* Moderation buttons â€” samo vlasnik, ne za sebe ni za drugog vlasnika */}
            {isOwner && m.userId !== currentUserId && m.role !== "owner" && (
              <>
                <button
                  onClick={() =>
                    roleMutation.mutate({
                      userId: m.userId,
                      role: m.role === "moderator" ? "member" : "moderator",
                    })
                  }
                  disabled={roleMutation.isPending}
                  title={m.role === "moderator" ? "Ukloni moderatora" : "Postavi za moderatora"}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 ${
                    m.role === "moderator"
                      ? "border-warning/30 bg-warning-soft text-warning hover:bg-red-50"
                      : "border-accent/30 bg-accent-soft text-accent hover:bg-accent hover:text-white"
                  }`}
                >
                  {m.role === "moderator" ? (
                    <ShieldOff size={14} strokeWidth={2} />
                  ) : (
                    <ShieldCheck size={14} strokeWidth={2} />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Kickovati ${m.user?.username}?`)) kickMutation.mutate(m.userId);
                  }}
                  disabled={kickMutation.isPending}
                  title="Kick Älana"
                  className="w-8 h-8 rounded-lg border border-orange-300/50 bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                >
                  <UserX size={14} strokeWidth={2} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Banovati ${m.user?.username}? Korisnik neÄ‡e moÄ‡i da se ponovo pridruÅ¾i.`))
                      banMutation.mutate(m.userId);
                  }}
                  disabled={banMutation.isPending}
                  title="Ban Älana"
                  className="w-8 h-8 rounded-lg border border-red-300/50 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Ban size={14} strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
});

export default CommunityMembersTab;
