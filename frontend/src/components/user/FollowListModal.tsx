import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { X, Search, Users, UserCheck } from "lucide-react";
import apiReq from "@/lib/apiReq";
import { FollowButton } from "./FollowButton";

interface FollowUser {
  _id: string;
  userName: string;
  displayName: string;
  img?: string;
  image?: string;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  initialTab?: "followers" | "following";
  followerCount?: number;
  followingCount?: number;
}

export const FollowListModal = ({
  isOpen,
  onClose,
  userName,
  initialTab = "followers",
  followerCount = 0,
  followingCount = 0,
}: FollowListModalProps) => {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setActiveTab(initialTab);
    setSearchQuery("");
  }, [initialTab, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const { data: users = [], isLoading, error } = useQuery<FollowUser[]>({
    queryKey: ["user", userName, activeTab],
    queryFn: async () => {
      const res = await apiReq.get(`/user/${userName}/${activeTab}`);
      return res.data;
    },
    enabled: isOpen && Boolean(userName),
    staleTime: 30 * 1000,
  });

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.userName?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-border/60">
          <h2 className="text-lg font-bold text-foreground">
            @{userName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-border/60 bg-muted/20">
          <button
            type="button"
            onClick={() => setActiveTab("followers")}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-all relative cursor-pointer ${
              activeTab === "followers"
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Followers ({followerCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-all relative cursor-pointer ${
              activeTab === "following"
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Following ({followingCount})
          </button>
        </div>

        {/* Search bar */}
        <div className="p-3 px-6 border-b border-border/40">
          <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 border border-border/60 focus-within:border-foreground/40 transition-colors">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-border/30">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-muted rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <div className="w-24 h-3.5 bg-muted rounded-md" />
                      <div className="w-16 h-3 bg-muted rounded-md" />
                    </div>
                  </div>
                  <div className="w-20 h-7 bg-muted rounded-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load {activeTab}. Please try again.
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              {activeTab === "followers" ? (
                <Users className="w-12 h-12 text-muted-foreground/40 mb-3" />
              ) : (
                <UserCheck className="w-12 h-12 text-muted-foreground/40 mb-3" />
              )}
              <p className="font-semibold text-foreground text-base">
                {searchQuery
                  ? "No matching users found"
                  : activeTab === "followers"
                  ? "No followers yet"
                  : "Not following anyone yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {searchQuery
                  ? "Try searching for a different name or username."
                  : activeTab === "followers"
                  ? "When people follow this profile, they will show up here."
                  : "When this user follows other accounts, they will show up here."}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id || user.userName}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-muted/40 transition-colors"
              >
                <Link
                  to={`/user/${user.userName}`}
                  onClick={onClose}
                  className="flex items-center gap-3 flex-1 min-w-0 pr-3 group"
                >
                  <img
                    src={user.img || user.image || "/general/noAvatar.png"}
                    alt={user.displayName}
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-border group-hover:opacity-90 transition-opacity shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-foreground truncate group-hover:underline">
                      {user.displayName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      @{user.userName}
                    </span>
                  </div>
                </Link>

                <div className="shrink-0">
                  <FollowButton userName={user.userName} size="sm" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
