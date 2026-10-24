import { Bell, Compass, Home, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router";

export const Sidebar = () => {
  return (
    <>
      <div className=" fixed left-0 top-0 bottom-0 bg-white h-dvh w-16 border-r-2 flex flex-col items-center gap-4 p-4 ">
        <Link to={"/"}>
          <Button size={"icon-lg"} className="rounded-full">
            <img src="./general/logo.png" />
          </Button>
        </Link>
        <Button size={"icon-lg"} className="rounded-full bg-white dark:bg-blue-950">
          <Home className="text-black dark:text-white"/>
        </Button>
        <Button size={"icon-lg"} className="rounded-full  bg-white dark:bg-blue-950">
          <Compass className="text-black dark:text-white"/>
        </Button>
        <Link to={"/create"}>
        <Button size={"icon-lg"} className="rounded-full  bg-white dark:bg-blue-950">
          <PlusCircle className="text-black dark:text-white"/>
        </Button>
        </Link>
        <Button size={"icon-lg"} className="rounded-full  bg-white dark:bg-blue-950">
          <Bell className="text-black dark:text-white"/>
        </Button>
      </div>
    </>
  );
}
