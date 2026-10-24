import { Gallery } from "@/components/landing/gallery";
import { useSearchParams } from "react-router";

export const SearchPage = () => {

const [searchParams] = useSearchParams() 
const search = searchParams.get("search")

    return (
        <div>
            <Gallery search={search}/>
        </div>
    );
};