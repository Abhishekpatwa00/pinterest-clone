import { useState, useRef, useEffect, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Trash2, Plus, Loader2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { apiReq } from "@/lib/apiReq";
import { userAuthStore } from "@/lib/authStore";

interface Board {
  _id: string;
  title: string;
}

export const Create = () => {
  const { currentUser } = userAuthStore();
  const navigate = useNavigate();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 1000,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<"file" | "url">("file");
  const [imageUrlInput, setImageUrlInput] = useState("");

  const [boards, setBoards] = useState<Board[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [creatingBoard, setCreatingBoard] = useState(false);

  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    link: "",
    board: "",
    tags: "",
  });

  // Fetch logged-in user's boards
  useEffect(() => {
    if (currentUser?._id) {
      setLoadingBoards(true);
      apiReq
        .get(`/boards/user/${currentUser._id}`)
        .then((res) => {
          setBoards(Array.isArray(res.data) ? res.data : []);
        })
        .catch((err) => {
          console.error("Error fetching boards:", err);
        })
        .finally(() => {
          setLoadingBoards(false);
        });
    }
  }, [currentUser?._id]);

  // Process image file and get base64 with dimensions
  const processImageFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPG, PNG, WEBP, etc.)");
      return;
    }
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        // If image is larger than 1600px on any side, scale it down for efficient storage
        const maxDim = 1600;
        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);

          setImageDimensions({ width: w, height: h });
          setImagePreview(compressed);
        } else {
          setImageDimensions({ width: w || 800, height: h || 1000 });
          setImagePreview(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return;
    setErrorMessage("");

    const testImg = new window.Image();
    testImg.onload = () => {
      setImageDimensions({
        width: testImg.naturalWidth || 800,
        height: testImg.naturalHeight || 1000,
      });
      setImagePreview(imageUrlInput.trim());
    };
    testImg.onerror = () => {
      setErrorMessage("Could not load image from this URL. Please verify the link.");
    };
    testImg.src = imageUrlInput.trim();
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Quick create a new board
  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim() || !currentUser?._id) return;
    try {
      setCreatingBoard(true);
      const res = await apiReq.post("/boards", {
        title: newBoardTitle.trim(),
        userId: currentUser._id,
      });
      if (res.data?._id) {
        setBoards((prev) => [res.data, ...prev]);
        setFormData((prev) => ({ ...prev, board: res.data._id }));
        setNewBoardTitle("");
        setShowNewBoardInput(false);
      }
    } catch (err) {
      console.error("Error creating board:", err);
      setErrorMessage("Failed to create board. Please try again.");
    } finally {
      setCreatingBoard(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!imagePreview) {
      setErrorMessage("Please upload or provide an image for your pin.");
      return;
    }

    if (!formData.title.trim()) {
      setErrorMessage("Please enter a title for your pin.");
      return;
    }

    setIsPublishing(true);

    try {
      const payload = {
        media: imagePreview,
        width: imageDimensions.width,
        height: imageDimensions.height,
        title: formData.title.trim(),
        desc: formData.desc.trim(),
        description: formData.desc.trim(),
        link: formData.link.trim(),
        board: formData.board || undefined,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        userId: currentUser?._id,
      };

      const res = await apiReq.post("/pins", payload);

      if (res.data?._id) {
        navigate(`/pin/${res.data._id}`);
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error("Error publishing pin:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to publish pin. Please check your connection and try again."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button
              variant="ghost"
              size="icon-lg"
              className="rounded-full hover:bg-muted cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Create Pin</h1>
        </div>

        <Button
          type="submit"
          form="create-pin-form"
          disabled={isPublishing}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-full text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
        >
          {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPublishing ? "Publishing..." : "Publish"}
        </Button>
      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-destructive/70 hover:text-destructive cursor-pointer ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="border border-border rounded-3xl p-6 md:p-8 bg-card shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Media Upload Column */}
          <div className="flex flex-col gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              id="file-upload"
            />

            {!imagePreview ? (
              <div className="flex flex-col gap-3">
                {/* Mode Selector */}
                <div className="flex items-center gap-2 p-1 bg-muted/60 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setInputMode("file")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      inputMode === "file"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("url")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      inputMode === "url"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    Image URL
                  </button>
                </div>

                {inputMode === "file" ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center w-full min-h-[380px] md:min-h-[460px] p-6 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                      isDragging
                        ? "border-foreground bg-muted/80 scale-[0.99]"
                        : "border-border hover:border-muted-foreground/60 bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center max-w-xs">
                      <div className="p-4 rounded-full bg-background border border-border shadow-sm mb-4">
                        <Upload className="w-6 h-6 text-foreground" />
                      </div>
                      <p className="font-semibold text-sm md:text-base text-foreground mb-1">
                        Choose a file or drag and drop it here
                      </p>
                      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                        We recommend using high quality .jpg or .png files less than 20MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center w-full min-h-[380px] md:min-h-[460px] p-6 border-2 border-dashed rounded-3xl bg-muted/20 border-border">
                    <div className="flex flex-col items-center text-center max-w-sm mx-auto w-full gap-4">
                      <div className="p-4 rounded-full bg-background border border-border shadow-sm">
                        <ImageIcon className="w-6 h-6 text-foreground" />
                      </div>
                      <p className="font-semibold text-sm text-foreground">
                        Paste an image link from the web
                      </p>
                      <div className="w-full flex gap-2">
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-ring outline-none"
                        />
                        <Button
                          type="button"
                          onClick={handleApplyUrl}
                          className="rounded-xl px-4 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
                        >
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full min-h-[380px] md:min-h-[460px] rounded-3xl overflow-hidden border border-border bg-muted/20 flex items-center justify-center group">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full h-full object-contain max-h-[500px] rounded-2xl"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={removeImage}
                  className="absolute top-4 right-4 rounded-full bg-background/90 hover:bg-background text-destructive shadow-md backdrop-blur-sm cursor-pointer"
                  aria-label="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Form Fields Column */}
          <div className="flex flex-col">
            <form
              id="create-pin-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 justify-between h-full"
            >
              <div className="flex flex-col gap-5">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="Title" className="text-xs font-semibold text-muted-foreground">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="Add a title"
                    name="title"
                    id="Title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-base md:text-lg font-medium rounded-xl border border-border bg-background focus:ring-2 focus:ring-ring focus:border-foreground outline-none transition-all placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="Desc" className="text-xs font-semibold text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    placeholder="Add a detailed description"
                    name="desc"
                    id="Desc"
                    rows={4}
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-ring focus:border-foreground outline-none resize-none transition-all placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Link */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="Link" className="text-xs font-semibold text-muted-foreground">
                    Link
                  </label>
                  <input
                    placeholder="Add a link"
                    name="link"
                    id="Link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full h-10 px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-ring focus:border-foreground outline-none transition-all placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Board */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="Board" className="text-xs font-semibold text-muted-foreground">
                      Board
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewBoardInput(!showNewBoardInput)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {showNewBoardInput ? "Cancel" : "New board"}
                    </button>
                  </div>

                  {showNewBoardInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Board name"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        className="flex-1 h-10 px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-ring outline-none"
                      />
                      <Button
                        type="button"
                        onClick={handleCreateBoard}
                        disabled={creatingBoard || !newBoardTitle.trim()}
                        className="h-10 px-4 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                      >
                        {creatingBoard ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  ) : (
                    <select
                      name="board"
                      id="Board"
                      value={formData.board}
                      onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                      disabled={loadingBoards}
                      className="w-full h-10 px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-ring focus:border-foreground outline-none cursor-pointer transition-all text-foreground"
                    >
                      <option value="">Choose a board (optional)</option>
                      {boards.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Tagged Topics */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="Tags" className="text-xs font-semibold text-muted-foreground">
                    Tagged Topics
                  </label>
                  <input
                    type="text"
                    id="Tags"
                    name="tags"
                    placeholder="Add tags (comma separated, e.g. art, design)"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full h-10 px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-ring focus:border-foreground outline-none transition-all placeholder:text-muted-foreground/60"
                  />
                  <small className="text-xs text-muted-foreground">
                    Separate tags with commas to help others find your pin.
                  </small>
                </div>
              </div>

              {/* Bottom Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isPublishing}
                  className="w-full h-11 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-full text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPublishing ? "Publishing Pin..." : "Publish Pin"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
