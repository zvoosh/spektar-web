import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communitiesApi } from "@/api/communities";
import { useAuthStore } from "@/store/authStore";

const CommunitiesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data: communitiesRaw, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: communitiesApi.getAll,
  });

  // Invited zajednice idu prve
  const communities = communitiesRaw
    ? [...communitiesRaw].sort((a: any, b: any) => (b.isInvited ? 1 : 0) - (a.isInvited ? 1 : 0))
    : undefined;

  const joinMutation = useMutation({
    mutationFn: (id: string) => communitiesApi.join(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["communities"] }),
  });

  const acceptInviteMutation = useMutation({
    mutationFn: (id: string) => communitiesApi.acceptInvite(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["communities"] }),
  });

  const rejectInviteMutation = useMutation({
    mutationFn: (id: string) => communitiesApi.rejectInvite(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["communities"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-serif text-[22px] text-text-1">Zajednice</h1>
        <button
          onClick={() => navigate("/communities/new")}
          className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-medium border-none cursor-pointer"
        >
          + Kreiraj zajednicu
        </button>
      </div>

      {isLoading && (
        <div className="text-center p-10 text-text-3">
          Učitavam zajednice...
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {communities?.map((community: any) => (
          <div
            key={community.id}
            onClick={() => navigate(`/c/${community.slug}`)}
            className="bg-surface border border-border rounded-[14px] p-4 flex gap-4 cursor-pointer hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow"
          >
            {community.avatar ? (
              <img
                src={community.avatar}
                alt={community.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-accent-soft flex items-center justify-center text-xl font-semibold text-accent shrink-0">
                {community.name.slice(0, 1)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-serif text-[16px] text-text-1">
                  {community.name}
                </span>
                {community.type !== "public" && (
                  <span className="text-[10px] text-text-3">🔒</span>
                )}
              </div>
              {community.description && (
                <p className="text-[12px] text-text-3 line-clamp-2 mb-2">
                  {community.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-[11px] text-text-3">
                <span>
                  {community.membersCount.toLocaleString("sr-RS")} članova
                </span>
                <span>·</span>
                <span className="capitalize">{community.category}</span>
                {community.location && (
                  <>
                    <span>·</span>
                    <span>📍 {community.location}</span>
                  </>
                )}
              </div>
            </div>

            {/* Action badge */}
            {community.isMember ? (
              <span className="self-center px-3.5 py-1.5 rounded-lg border border-border text-text-3 text-[12px] bg-surface-2 shrink-0">
                ✓ Član
              </span>
            ) : community.isInvited ? (
              <div
                className="self-center flex flex-col gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => acceptInviteMutation.mutate(community.id)}
                  disabled={acceptInviteMutation.isPending || rejectInviteMutation.isPending}
                  className="px-3 py-1 rounded-lg bg-accent text-white text-[11px] font-semibold cursor-pointer hover:bg-accent-hover disabled:opacity-50 transition-colors"
                >
                  ✓ Prihvati poziv
                </button>
                <button
                  onClick={() => rejectInviteMutation.mutate(community.id)}
                  disabled={acceptInviteMutation.isPending || rejectInviteMutation.isPending}
                  className="px-3 py-1 rounded-lg border border-border text-text-3 text-[11px] cursor-pointer hover:bg-surface-2 disabled:opacity-50 transition-colors"
                >
                  Odbij
                </button>
              </div>
            ) : community.type === "public" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAuthenticated) {
                    joinMutation.mutate(community.id);
                  } else {
                    navigate(`/login`);
                  }
                }}
                disabled={joinMutation.isPending}
                className="self-center px-3.5 py-1.5 rounded-lg border border-accent text-accent text-[12px] font-medium bg-surface cursor-pointer shrink-0 hover:bg-accent-soft disabled:opacity-50"
              >
                Pridruži se
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunitiesPage;
