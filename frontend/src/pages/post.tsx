import { Gallery } from "@/components/landing/gallery";
import { Images } from "@/components/ui/images";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { Link  } from "react-router";
import { Comments } from "@/components/comments/comments";
import { FollowButton } from "@/components/user/FollowButton";
import { useQuery  } from "@tanstack/react-query";
import apiReq from "@/lib/apiReq";
import { useParams } from "react-router";

export const Post = () => {

  const {id} =  useParams();
  const fetchPin = async()=>{
    const res = await apiReq.get(`/pins/${id}`)
    return res.data
  }
  const {isPending,error,data} = useQuery({
    queryKey:["pin",id],
    queryFn: fetchPin
  })

  if (isPending) return "Loading"
  if(error) return "Something went wrong"
  if(!data) return "Pin not Found"
  return (
    <>
      <div >
        <div className="flex border-2 rounded-2xl m-4 ">
          <Link to={"/"} className="p-4">
            <Button size={"icon-lg"} variant={"ghost"} className="rounded-full">
              <ArrowLeft  />
            </Button>
          </Link>
            <div className="w-3/5 flex  justify-center p-4">
              <Images src={data.media} w={440} h={550} className="rounded-2xl"/>
          </div>
          <div className=" w-2/5 p-4 flex flex-col gap-4">
            <div className="flex justify-between">
              <div>
                <Button size={"icon-lg"} variant={"ghost"} className="rounded-full">
                  <Heart/>
                </Button>
                <Button size={"icon-lg"} variant={"ghost"} className="rounded-full">
                  <MessageCircle/>
                </Button>
                <Button size={"icon-lg"} variant={"ghost"} className="rounded-full">
                  <MoreHorizontal/>
                </Button>
              </div>
              <div>
                <Button className="bg-red-600 hover:bg-red-700 mr-4 text-white font-semibold px-4 py-2 rounded-full text-sm">Save</Button>
              </div>
            </div>
            <div className="flex flex-col flex-1 min-h-0 w-full justify-between gap-4">
              <div className="flex items-center justify-between">
                <Link to={`/user/${data.user?.userName}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <img src={data.user?.image || data.user?.img || "/general/noAvatar.png"} alt={data.user?.displayName} className="w-9 h-9 rounded-full object-cover ring-1 ring-border" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{data.user?.displayName}</span>
                  </div>
                </Link>
                {data.user?.userName && (
                  <FollowButton userName={data.user.userName} size="sm" />
                )}
              </div>
              <div className="w-full flex-1 flex flex-col min-h-0">
                <Comments />
              </div>
            </div>
          </div>

        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl">Explore More Content</span>
          <Gallery />
        </div>
      </div>
    </>
  );
}
