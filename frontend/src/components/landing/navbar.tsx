import { useState } from "react";
import { Camera, Search } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import apiReq from "@/lib/apiReq";
import { userAuthStore } from "@/lib/authStore";

export const Navbar = () => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { currentUser, removeCurrentUser } = userAuthStore();
  const isLogged = Boolean(currentUser);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?search=${encodeURIComponent(search.trim())}`);
  };

  const logout = async () => {
    try {
      await apiReq.post("/auth/logout", {});
    } catch (err) {
      console.error("Error during logout", err);
    } finally {
      removeCurrentUser();
      navigate("/auth");
    }
  };

  return (
    <>
      <div className="h-16  w-full pl-4   border-b-2 flex items-center justify-between  ">
        <form onSubmit={handleSubmit} className="flex items-center  border-2 rounded-full  h-12 ">
          <Search className="text-gray-500 ml-2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className=" ml-2 border-none outline-none w-80"
            placeholder="Search"
          />
          <Camera className="text-gray-500 mr-2" />
        </form>
        
        
            { !isLogged ?  
            <>
              <div className="flex gap-4">
                            <Button
              variant={"default"}
              size={"lg"}
              className=" text-black bg-white  border-2 "
              onClick={() => navigate("/auth")}
            >
              Login
            </Button>
            <Button
              variant={"default"}
              size={"lg"}
              className=" text-black bg-white border-2 "
              onClick={() => navigate("/auth")}
            >
              Sign up
            </Button> 

              </div>
            </>
            :
              <>
              <div>
          <Button
            variant={"default"}
            size={"icon-lg"}
            className="rounded-full bg-gray-300 dark:bg-blue-950 border-2 mr-4 relative"
            onClick={() => setIsOpen((prev) => !prev)}
          />
        </div>
        {isOpen && (
           <div className="bg-white border-2 rounded-2xl flex flex-col gap-2 p-2 items-center justify-center absolute z-999 top-16 right-4">
              <Button
              variant={"default"}
              size={"lg"}
              className=" text-black bg-white border-2 "
              onClick={() => navigate(`/user/${currentUser?.userName}`)}
            >
              Profile
            </Button>
              <Button
              variant={"default"}
              size={"lg"}
              className=" text-black bg-white border-2 "
              onClick={logout}
            >
              Log out
            </Button>
             </div>
        )}
             
            </>

          }
         
         
      
      </div>
    </>
  );
};
