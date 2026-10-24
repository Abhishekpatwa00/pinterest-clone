import { useInfiniteQuery } from "@tanstack/react-query";
import { GalleryItems } from "./galleryitems";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios"


export const Gallery = ({
  search,
  userPins,
  boardId,
}: {
  search?: string | null;
  userPins?: string | null;
  boardId?: string | null;
}) => {
  const fetchPins = async ({
    pageParam,
    search,
    userPins,
    boardId,
  }: {
    pageParam?: number;
    search?: string | null;
    userPins?: string | null;
    boardId?: string | null;
  }) => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_ENDPOINT}/pins?cursor=${pageParam}&search=${search || ""}&userPins=${userPins || ""}&boardId=${boardId || ""}`
    );
    return res.data;
  };

  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["pins", search, userPins, boardId],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      fetchPins({ pageParam, search, userPins, boardId }),
    initialPageParam: 0,
    getNextPageParam: (lastpage) => lastpage.nextCursor,
  });

 
  if (status==="pending") return "Loading"
  console.log(data)
  const allPins = data?.pages.flatMap((page)=>page.pins) || []
  return (
    <>
    <InfiniteScroll dataLength={allPins.length} next={fetchNextPage} hasMore={hasNextPage} loader={
      <h1>Loading...</h1>
    } endMessage={
      <p>End of pins</p>
    }>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 w-full p-4">
            {allPins.map((item) => (
              <GalleryItems key={item._id} item={item} />
            ))}
          </div>
    </InfiniteScroll>
      
    </>
  );
}
