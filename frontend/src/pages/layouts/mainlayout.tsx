import { Sidebar } from "../../components/landing/sidebar";
import { Navbar } from "../../components/landing/navbar";

import { Outlet } from "react-router";

export const MainLayout = ()=>{
    return (
        <>
             <div className="flex  ">
                    <div>
                      <Sidebar/>
                    </div>
                    <div className="w-full flex flex-col pl-16">
                      <Navbar />
                      <main className="flex-1">
                        <Outlet/>
                      </main>
                      
                    </div>
                  </div>
        </>
    );
}