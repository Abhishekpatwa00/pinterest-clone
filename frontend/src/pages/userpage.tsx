import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Gallery } from "@/components/landing/gallery";
import { Button } from "@/components/ui/button";
import { Collections } from "@/components/collections/collections";
import { FollowButton } from "@/components/user/FollowButton";
import { FollowListModal } from "@/components/user/FollowListModal";
import { userAuthStore } from "@/lib/authStore";
import apiReq from "@/lib/apiReq";
import { Share2, Check, MessageSquare, Edit3 } from "lucide-react";

export const UserPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const userName = (params.userName as string) || "";

  const { currentUser } = userAuthStore();
  const isOwnProfile = Boolean(
    currentUser?.userName && currentUser.userName.toLowerCase() === userName.toLowerCase()
  );

  const [isCreated, setIsCreated] = useState<"created" | "saved">("created");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"followers" | "following">("followers");
  const [copied, setCopied] = useState(false);

  const fetchUser = async () => {
    const res = await apiReq.get(`/user/${userName}`);
    return res.data;
  };

  const {
    isPending,
    error,
    data,
  } = useQuery({
    queryKey: ["user", userName],
    queryFn: fetchUser,
    enabled: Boolean(userName),
  });

  const handleOpenModal = (tab: "followers" | "following") => {
    setModalTab(tab);
    setModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4 max-w-xl mx-auto">
        <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
        <div className="w-48 h-6 bg-muted rounded-md animate-pulse" />
        <div className="w-32 h-4 bg-muted rounded-md animate-pulse" />
        <div className="w-56 h-4 bg-muted rounded-md animate-pulse" />
        <div className="flex gap-3 mt-2">
          <div className="w-24 h-9 bg-muted rounded-full animate-pulse" />
          <div className="w-24 h-9 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-4">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-sm text-muted-foreground">
          The user @{userName} does not exist or may have been removed.
        </p>
        <Button onClick={() => navigate("/")} className="mt-2 rounded-full">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-2.5 p-6 pt-8">
        {/* Avatar */}
        <div className="relative group">
          <img
            src={data.img || data.image || "/general/noAvatar.png"}
            alt={data.displayName}
            className="w-32 h-32 rounded-full object-cover ring-2 ring-border shadow-md"
          />
        </div>

        {/* Display name & username */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {data.displayName}
        </h1>
        <span className="text-muted-foreground text-sm font-medium">@{data.userName}</span>

        {/* Follower / Following clickable metrics */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <button
            type="button"
            onClick={() => handleOpenModal("followers")}
            className="font-medium hover:text-foreground hover:underline transition-colors cursor-pointer"
          >
            <span className="font-bold text-foreground">{data.followerCount || 0}</span> followers
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => handleOpenModal("following")}
            className="font-medium hover:text-foreground hover:underline transition-colors cursor-pointer"
          >
            <span className="font-bold text-foreground">{data.followingCount || 0}</span> following
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-3">
          <Button
            variant="outline"
            className="rounded-full px-4 h-9 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            onClick={handleShare}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </Button>

          {isOwnProfile ? (
            <Button
              variant="secondary"
              className="rounded-full px-4 h-9 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              onClick={() => alert("Profile editing coming soon!")}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit profile</span>
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                className="rounded-full px-4 h-9 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </Button>
              <FollowButton
                userName={data.userName}
                isFollowing={data.isFollowing}
                size="default"
              />
            </>
          )}
        </div>
      </div>

      {/* Tabs: Created vs Saved */}
      <div className="flex gap-6 items-center justify-center border-b border-border/40 mb-4 mt-2">
        <button
          type="button"
          className={`pb-3 font-semibold text-sm transition-all relative cursor-pointer ${
            isCreated === "created"
              ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setIsCreated("created")}
        >
          Created
        </button>
        <button
          type="button"
          className={`pb-3 font-semibold text-sm transition-all relative cursor-pointer ${
            isCreated === "saved"
              ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setIsCreated("saved")}
        >
          Saved
        </button>
      </div>

      {/* Pins / Collections Gallery */}
      <div className="p-4">
        {isCreated === "created" ? (
          <Gallery userPins={data._id} />
        ) : (
          <Collections userId={data._id} userName={data.userName} />
        )}
      </div>

      {/* Followers & Following List Modal */}
      <FollowListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userName={data.userName}
        initialTab={modalTab}
        followerCount={data.followerCount || 0}
        followingCount={data.followingCount || 0}
      />
    </>
  );
};