import { Button } from "@base-ui/react";
import { MoreHorizontal, Share } from "lucide-react";
import { Link } from "react-router";
import { Images } from "../ui/images";


export const GalleryItems = ({
  item,
}: {
  item: { _id: string; media: string; width: number; height: number };
}) => {

  const optimizedHeight = Math.floor((item.height/item.width)*372);

  return (
    <div className="relative mb-4 break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer">
      <Images
     
      src={item.media}
      w={372}
      h={optimizedHeight}
      className="rounded-2xl"
     
    />

      {/* Dim overlay & clickable link to pin */}
      <Link
        to={`/pin/${item._id}`}
        className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
      />

      {/* Save Button (Top Right) */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-full text-sm">
          Save
        </Button>
      </div>

      {/* Bottom Action Buttons (Share & Menu) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-800 shadow">
          <Share size={18} />
        </Button>
        <Button className="p-2 bg-white/90 hover:bg-white rounded-full text-gray-800 shadow">
          <MoreHorizontal size={18} />
        </Button>
      </div>
    </div>
  );
};
