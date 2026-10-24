import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Plus,
  Lock,
  ArrowLeft,
  SlidersHorizontal,
  FolderHeart,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Gallery } from "@/components/landing/gallery";

export interface BoardItem {
  _id: string;
  title: string;
  user: string;
  isPrivate?: boolean;
  pinCount: number;
  previewImages: string[];
  updatedAt?: string;
}

interface CollectionsProps {
  userId: string;
  userName?: string;
}

export const Collections = ({ userId, userName }: CollectionsProps) => {
  const queryClient = useQueryClient();
  const [activeBoard, setActiveBoard] = useState<BoardItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "alphabetical">("recent");

  // Fetch user boards from backend
  const { data: boards = [], isLoading, isError } = useQuery<BoardItem[]>({
    queryKey: ["boards", userId],
    queryFn: async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_API_ENDPOINT}/boards/user/${userId}`
      );
      return res.data;
    },
    enabled: Boolean(userId),
  });

  // Create board mutation
  const createBoardMutation = useMutation({
    mutationFn: async ({ title, isPrivate }: { title: string; isPrivate: boolean }) => {
      const res = await axios.post(`${import.meta.env.VITE_API_ENDPOINT}/boards`, {
        title,
        userId,
        isPrivate,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards", userId] });
      setIsModalOpen(false);
      setNewBoardTitle("");
      setIsSecret(false);
    },
  });

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    createBoardMutation.mutate({
      title: newBoardTitle.trim(),
      isPrivate: isSecret,
    });
  };

  // Sort boards
  const sortedBoards = [...boards].sort((a, b) => {
    if (sortBy === "alphabetical") {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
  });

  // If a board is currently open, show the Board Detail View (with pins in that board)
  if (activeBoard) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 py-2">
        {/* Board Detail Header */}
        <div className="flex flex-col items-center justify-center relative py-6 border-b border-border/40">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveBoard(null)}
            className="absolute left-0 top-6 rounded-full hover:bg-muted"
            title="Back to all boards"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {activeBoard.title}
              </h1>
              {activeBoard.isPrivate && (
                <Lock className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {activeBoard.pinCount} {activeBoard.pinCount === 1 ? "pin" : "pins"}
            </p>
          </div>
        </div>

        {/* Pins inside this board */}
        <Gallery boardId={activeBoard._id} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-2">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between pb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setSortBy((prev) => (prev === "recent" ? "alphabetical" : "recent"))
            }
            className="rounded-full text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sort: {sortBy === "recent" ? "Last updated" : "A to Z"}</span>
          </Button>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create board</span>
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 animate-pulse">
              <div className="aspect-[4/3] rounded-2xl bg-muted/70" />
              <div className="h-4 bg-muted/70 rounded-md w-3/4" />
              <div className="h-3 bg-muted/50 rounded-md w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Unable to load boards. Please try again later.</p>
        </div>
      )}

      {/* Boards Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {/* Create Board Card */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group flex flex-col gap-2 text-left cursor-pointer transition-all"
          >
            <div className="aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-border/80 group-hover:border-foreground/40 bg-muted/20 group-hover:bg-muted/40 flex flex-col items-center justify-center gap-2 transition-all">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                Create board
              </span>
            </div>
            <div className="px-1">
              <p className="font-semibold text-sm text-foreground">New Board</p>
              <p className="text-xs text-muted-foreground">Organize your saves</p>
            </div>
          </button>

          {/* Board Cards */}
          {sortedBoards.map((board) => {
            const previews = board.previewImages || [];

            return (
              <div
                key={board._id}
                onClick={() => setActiveBoard(board)}
                className="group flex flex-col gap-2 text-left cursor-pointer"
              >
                {/* Collage Preview Container */}
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-muted/60 border border-border/30 group-hover:shadow-md transition-all duration-200">
                  {previews.length >= 3 ? (
                    // 3-image collage: 1 large on left, 2 stacked on right
                    <div className="flex h-full w-full gap-0.5">
                      <div className="w-2/3 h-full overflow-hidden">
                        <img
                          src={previews[0]}
                          alt={board.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="w-1/3 h-full flex flex-col gap-0.5 overflow-hidden">
                        <div className="h-1/2 w-full overflow-hidden">
                          <img
                            src={previews[1]}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="h-1/2 w-full overflow-hidden">
                          <img
                            src={previews[2]}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  ) : previews.length === 2 ? (
                    // 2-image collage: split vertically
                    <div className="flex h-full w-full gap-0.5">
                      <div className="w-1/2 h-full overflow-hidden">
                        <img
                          src={previews[0]}
                          alt={board.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="w-1/2 h-full overflow-hidden">
                        <img
                          src={previews[1]}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  ) : previews.length === 1 ? (
                    // 1 image: full cover
                    <div className="w-full h-full overflow-hidden">
                      <img
                        src={previews[0]}
                        alt={board.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    // 0 images: empty board placeholder
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground/60 bg-muted/40">
                      <FolderHeart className="w-8 h-8 stroke-[1.4]" />
                      <span className="text-[11px] font-medium">Empty board</span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

                  {/* Private badge */}
                  {board.isPrivate && (
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white p-1 rounded-full shadow-sm">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Board Info */}
                <div className="px-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-sm text-foreground truncate group-hover:underline">
                      {board.title}
                    </h3>
                    {board.isPrivate && (
                      <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {board.pinCount} {board.pinCount === 1 ? "Pin" : "Pins"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State when no boards at all */}
      {!isLoading && !isError && sortedBoards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto space-y-3">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Nothing saved yet
          </h2>
          <p className="text-sm text-muted-foreground">
            {userName ? `@${userName}` : "This user"} hasn't saved any boards yet.
            Boards help you organize your favorite pins!
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-5 py-2 mt-2"
          >
            Create your first board
          </Button>
        </div>
      )}

      {/* Create Board Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-card text-card-foreground rounded-3xl p-6 shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-center mb-6 text-foreground">
              Create board
            </h2>

            <form onSubmit={handleCreateBoard} className="space-y-5">
              {/* Board Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Name
                </label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder='Like "Places to Go" or "Recipes"'
                  autoFocus
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>

              {/* Secret Board Checkbox */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 border border-border/50">
                <input
                  type="checkbox"
                  id="secretBoard"
                  checked={isSecret}
                  onChange={(e) => setIsSecret(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="secretBoard" className="text-xs cursor-pointer select-none">
                  <span className="font-semibold text-foreground block">
                    Keep this board secret
                  </span>
                  <span className="text-muted-foreground">
                    Only you and collaborators will be able to see it.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full text-xs font-semibold px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newBoardTitle.trim() || createBoardMutation.isPending}
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-5 py-2 disabled:opacity-50"
                >
                  {createBoardMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};