import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { userAuthStore } from "@/lib/authStore";
import apiReq from "@/lib/apiReq";
import { Loader2 } from "lucide-react";

interface FollowButtonProps {
  userName: string;
  isFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean, followerCount?: number, followingCount?: number) => void;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export const FollowButton = ({
  userName,
  isFollowing: initialIsFollowing,
  onFollowChange,
  className = "",
  size = "default",
}: FollowButtonProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser } = userAuthStore();
  const [isHovered, setIsHovered] = useState(false);

  // If initialIsFollowing is undefined, optionally read from cached user query
  const cachedUserData = queryClient.getQueryData<any>(["user", userName]);
  
  // If still unknown and we are in a context that didn't pass it, query minimal profile
  const shouldFetchStatus = initialIsFollowing === undefined && !cachedUserData;
  const { data: userData } = useQuery({
    queryKey: ["user", userName],
    queryFn: async () => {
      const res = await apiReq.get(`/user/${userName}`);
      return res.data;
    },
    enabled: shouldFetchStatus && Boolean(userName),
    staleTime: 60 * 1000,
  });

  const isFollowing =
    initialIsFollowing !== undefined
      ? initialIsFollowing
      : cachedUserData?.isFollowing !== undefined
      ? cachedUserData.isFollowing
      : Boolean(userData?.isFollowing);

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await apiReq.post(`/user/follow/${userName}`);
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["user", userName] });
      const previousUser = queryClient.getQueryData(["user", userName]);

      const nextIsFollowing = !isFollowing;

      // Optimistically update ["user", userName]
      queryClient.setQueryData(["user", userName], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: nextIsFollowing,
          followerCount: nextIsFollowing
            ? (old.followerCount || 0) + 1
            : Math.max(0, (old.followerCount || 0) - 1),
        };
      });

      onFollowChange?.(nextIsFollowing);
      return { previousUser };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user", userName], context.previousUser);
      }
      onFollowChange?.(isFollowing);
    },
    onSuccess: (data) => {
      if (data?.followerCount !== undefined) {
        queryClient.setQueryData(["user", userName], (old: any) => ({
          ...old,
          isFollowing: data.isFollowing,
          followerCount: data.followerCount,
          followingCount: data.followingCount,
        }));
        onFollowChange?.(data.isFollowing, data.followerCount, data.followingCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userName] });
      queryClient.invalidateQueries({ queryKey: ["user", userName, "followers"] });
      if (currentUser?.userName) {
        queryClient.invalidateQueries({ queryKey: ["user", currentUser.userName, "following"] });
      }
    },
  });

  // Do not show follow button for oneself
  if (currentUser?.userName && currentUser.userName === userName) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      navigate("/auth");
      return;
    }

    followMutation.mutate();
  };

  const sizeClasses = {
    sm: "px-3.5 py-1 text-xs h-7",
    default: "px-5 py-2 text-sm h-9",
    lg: "px-6 py-2.5 text-base h-11",
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={followMutation.isPending}
      className={`font-semibold rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-60 select-none ${sizeClasses} ${
        isFollowing
          ? isHovered
            ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400"
            : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          : "bg-red-600 hover:bg-red-700 text-white"
      } ${className}`}
    >
      {followMutation.isPending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Updating...</span>
        </>
      ) : isFollowing ? (
        isHovered ? "Unfollow" : "Following"
      ) : (
        "Follow"
      )}
    </button>
  );
};
