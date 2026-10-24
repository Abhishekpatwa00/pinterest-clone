import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router";
import { Button } from "../ui/button";
import { apiReq } from "@/lib/apiReq";
import { userAuthStore } from "@/lib/authStore";
import {
  Heart,
  Smile,
  X,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Trash2,
  MessageCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CommentReply {
  id: string;
  user: {
    id?: string;
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

interface CommentItem {
  id: string;
  user: {
    id?: string;
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies: CommentReply[];
}

interface CommentsProps {
  pinId?: string;
}

const formatCommentDate = (dateString?: string) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const now = new Date();
  const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSec < 60) return "Just now";
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// const INITIAL_COMMENTS: CommentItem[] = [
//   {
//     id: "c1",
//     user: {
//       name: "Elena Rostova",
//       username: "elena_r",
//       avatar: "/general/noAvatar.png",
//     },
//     text: "The lighting and mood here are absolutely immaculate! What lens did you use for this shot?",
//     createdAt: "2d ago",
//     likes: 14,
//     isLiked: false,
//     replies: [
//       {
//         id: "r1",
//         user: {
//           name: "John Doe",
//           username: "john",
//           avatar: "/general/noAvatar.png",
//         },
//         text: "Thanks Elena! Used a 35mm f/1.4 prime on a Sony A7IV 🙏",
//         createdAt: "1d ago",
//         likes: 5,
//         isLiked: false,
//       },
//     ],
//   },
//   {
//     id: "c2",
//     user: {
//       name: "Marcus Chen",
//       username: "marcus_c",
//       avatar: "/general/noAvatar.png",
//     },
//     text: "Added this straight to my Architecture & Aesthetics moodboard. Stunning composition!",
//     createdAt: "3d ago",
//     likes: 8,
//     isLiked: false,
//     replies: [],
//   },
//   {
//     id: "c3",
//     user: {
//       name: "Sophia Taylor",
//       username: "sophiat",
//       avatar: "/general/noAvatar.png",
//     },
//     text: "Such peaceful and warm tones. Exactly the inspiration I was looking for today ✨",
//     createdAt: "5d ago",
//     likes: 4,
//     isLiked: false,
//     replies: [],
//   },
// ];

const POPULAR_EMOJIS = ["❤️", "✨", "🔥", "👏", "😍", "🙌", "📌", "💡"];

export const Comments = ({ pinId: propPinId }: CommentsProps) => {
  const { currentUser } = userAuthStore();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const targetPinId = propPinId || params.id;

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    name: string;
    username: string;
  } | null>(null);

  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getComments = async (): Promise<CommentItem[]> => {
    if (!targetPinId) return [];
    const res = await apiReq.get(`/comments/${targetPinId}`);
    return res.data.map((comment: any) => {
      const likesArray = Array.isArray(comment.likes) ? comment.likes : [];
      const currentUserId = currentUser?._id;
      const isLiked = currentUserId
        ? likesArray.some(
            (u: any) => (typeof u === "string" ? u : u?._id) === currentUserId
          )
        : false;

      return {
        id: comment._id || comment.id,
        user: {
          id: comment.user?._id || comment.user?.id,
          name: comment.user?.displayName || comment.user?.name || "User",
          username: comment.user?.userName || comment.user?.username || "user",
          avatar:
            comment.user?.img ||
            comment.user?.image ||
            comment.user?.avatar ||
            "/general/noAvatar.png",
        },
        text: comment.description || comment.text || "",
        createdAt: formatCommentDate(comment.createdAt),
        likes: likesArray.length || comment.likesCount || 0,
        isLiked,
        replies: comment.replies || [],
      };
    });
  };

  const { isPending, error, data } = useQuery({
    queryKey: ["comments", targetPinId],
    queryFn: getComments,
    enabled: !!targetPinId,
  });

  useEffect(() => {
    if (data) {
      setComments(data);
    }
  }, [data]);

  const postCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!targetPinId) throw new Error("Pin ID is required to post a comment");
      const res = await apiReq.post("/comments", {
        description: text,
        pinId: targetPinId,
        userId: currentUser?._id,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", targetPinId] });
      setNewCommentText("");
      setReplyingTo(null);
      setShowEmojiPicker(false);
    },
    onError: (err) => {
      console.error("Failed to post comment:", err);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiReq.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", targetPinId] });
    },
    onError: (err) => {
      console.error("Failed to delete comment:", err);
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await apiReq.post(`/comments/${commentId}/like`, {
        userId: currentUser?._id,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", targetPinId] });
    },
    onError: (err) => {
      console.error("Failed to toggle like:", err);
    },
  });

  const totalCommentsCount =
    comments.length +
    comments.reduce((acc, c) => acc + (c.replies ? c.replies.length : 0), 0);

  const handleToggleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          const nextLiked = !comment.isLiked;
          return {
            ...comment,
            isLiked: nextLiked,
            likes: nextLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1),
          };
        }
        return comment;
      })
    );
    likeCommentMutation.mutate(commentId);
  };

  const handleToggleLikeReply = (commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === replyId) {
                const nextLiked = !reply.isLiked;
                return {
                  ...reply,
                  isLiked: nextLiked,
                  likes: nextLiked ? reply.likes + 1 : Math.max(0, reply.likes - 1),
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      })
    );
  };

  const toggleRepliesCollapse = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleStartReply = (commentId: string, name: string, username: string) => {
    setReplyingTo({ commentId, name, username });
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    deleteCommentMutation.mutate(commentId);
  };

  const handleDeleteReply = (commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: c.replies.filter((r) => r.id !== replyId),
          };
        }
        return c;
      })
    );
  };

  const handleAddEmoji = (emoji: string) => {
    setNewCommentText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCommentText.trim();
    if (!trimmed || !targetPinId || postCommentMutation.isPending) return;

    const content = replyingTo ? `@${replyingTo.username} ${trimmed}` : trimmed;
    postCommentMutation.mutate(content);
  };

  const commentsCountRef = useRef(0);

  useEffect(() => {
    if (comments.length > commentsCountRef.current && commentsCountRef.current > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    commentsCountRef.current = comments.length;
  }, [comments.length]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        Loading comments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        Error fetching comments
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base text-foreground">
            Comments
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {totalCommentsCount}
          </span>
        </div>
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse comments" : "Expand comments"}
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>
      </div>

      {/* Comments List */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 max-h-[340px] scrollbar-thin">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
              <MessageCircle className="size-8 stroke-[1.5] text-muted-foreground/60" />
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const hasReplies = comment.replies && comment.replies.length > 0;
              const areRepliesExpanded = expandedReplies[comment.id];

              return (
                <div key={comment.id} className="group/item flex flex-col gap-1.5 text-sm">
                  {/* Top row: Avatar + Name + Timestamp + Delete */}
                  <div className="flex items-start gap-2.5">
                    <Link
                      to={`/user/${comment.user.username}`}
                      className="shrink-0 transition-opacity hover:opacity-80 pt-0.5"
                    >
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-border/50"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <Link
                          to={`/user/${comment.user.username}`}
                          className="font-semibold text-xs text-foreground hover:underline truncate"
                        >
                          {comment.user.name}
                        </Link>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {comment.createdAt}
                        </span>
                      </div>

                      <p className="text-sm text-foreground/90 mt-0.5 leading-snug break-words">
                        {comment.text}
                      </p>

                      {/* Comment Actions: Like & Reply */}
                      <div className="flex items-center gap-4 mt-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleLikeComment(comment.id)}
                          className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors group/like"
                        >
                          <Heart
                            className={`size-3.5 transition-transform active:scale-125 ${
                              comment.isLiked
                                ? "fill-red-500 text-red-500"
                                : "group-hover/like:text-red-500"
                            }`}
                          />
                          {comment.likes > 0 && <span>{comment.likes}</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStartReply(
                              comment.id,
                              comment.user.name,
                              comment.user.username
                            )
                          }
                          className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Reply
                        </button>

                        {/* Delete comment option (for author's comments) */}
                        {Boolean(
                          (currentUser?._id && comment.user.id === currentUser._id) ||
                          (currentUser?.userName && comment.user.username === currentUser.userName) ||
                          comment.user.username === "you"
                        ) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="opacity-0 group-hover/item:opacity-100 text-[11px] text-muted-foreground hover:text-destructive transition-all"
                            title="Delete comment"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Replies Section */}
                  {hasReplies && (
                    <div className="pl-9 mt-1">
                      <button
                        type="button"
                        onClick={() => toggleRepliesCollapse(comment.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
                      >
                        <CornerDownRight className="size-3" />
                        <span>
                          {areRepliesExpanded
                            ? "Hide replies"
                            : `View ${comment.replies.length} ${
                                comment.replies.length === 1 ? "reply" : "replies"
                              }`}
                        </span>
                      </button>

                      {areRepliesExpanded && (
                        <div className="space-y-3 pl-2 border-l-2 border-muted">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="group/reply flex items-start gap-2 text-xs"
                            >
                              <Link
                                to={`/user/${reply.user.username}`}
                                className="shrink-0 pt-0.5 hover:opacity-80"
                              >
                                <img
                                  src={reply.user.avatar}
                                  alt={reply.user.name}
                                  className="w-5 h-5 rounded-full object-cover ring-1 ring-border/50"
                                />
                              </Link>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <Link
                                    to={`/user/${reply.user.username}`}
                                    className="font-semibold text-xs text-foreground hover:underline truncate"
                                  >
                                    {reply.user.name}
                                  </Link>
                                  <span className="text-[10px] text-muted-foreground shrink-0">
                                    {reply.createdAt}
                                  </span>
                                </div>

                                <p className="text-xs text-foreground/90 mt-0.5 leading-snug break-words">
                                  {reply.text}
                                </p>

                                <div className="flex items-center gap-3 mt-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleLikeReply(comment.id, reply.id)
                                    }
                                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors group/replylike"
                                  >
                                    <Heart
                                      className={`size-3 transition-transform active:scale-125 ${
                                        reply.isLiked
                                          ? "fill-red-500 text-red-500"
                                          : "group-hover/replylike:text-red-500"
                                      }`}
                                    />
                                    {reply.likes > 0 && <span>{reply.likes}</span>}
                                  </button>

                                  {reply.user.username === "you" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteReply(comment.id, reply.id)
                                      }
                                      className="opacity-0 group-hover/reply:opacity-100 text-[10px] text-muted-foreground hover:text-destructive transition-all"
                                      title="Delete reply"
                                    >
                                      <Trash2 className="size-2.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>
      )}

      {/* Input Section */}
      <div className="pt-3 mt-auto border-t border-border/60">
        {/* Replying banner */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-muted/60 px-3 py-1.5 rounded-lg mb-2 text-xs">
            <span className="text-muted-foreground">
              Replying to <span className="font-semibold text-foreground">@{replyingTo.username}</span>
            </span>
            <button
              type="button"
              onClick={handleCancelReply}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Emoji suggestions popup */}
        {showEmojiPicker && (
          <div className="flex items-center gap-1.5 p-2 mb-2 bg-muted/80 backdrop-blur rounded-2xl shadow-sm border border-border/50">
            {POPULAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleAddEmoji(emoji)}
                className="hover:scale-125 transition-transform text-base p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <img
            src={currentUser?.img || currentUser?.image || "/general/noAvatar.png"}
            alt={currentUser?.displayName || "Current user avatar"}
            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-border/50"
          />

          <div className="flex-1 flex items-center bg-muted/50 hover:bg-muted/80 focus-within:bg-background focus-within:ring-1 focus-within:ring-ring border border-border/60 rounded-full px-3 py-1.5 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={
                replyingTo
                  ? `Reply to @${replyingTo.username}...`
                  : "Add a comment..."
              }
              disabled={postCommentMutation.isPending}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full shrink-0"
              title="Add emoji"
            >
              <Smile className="size-4" />
            </button>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={!newCommentText.trim() || postCommentMutation.isPending}
            className={`rounded-full px-4 font-semibold text-xs transition-colors ${
              newCommentText.trim() && !postCommentMutation.isPending
                ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            {postCommentMutation.isPending
              ? "Posting..."
              : replyingTo
              ? "Reply"
              : "Post"}
          </Button>
        </form>
      </div>
    </div>
  );
};
