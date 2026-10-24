import { Sidebar } from "@/components/landing/sidebar";
import { Navbar } from "@/components/landing/navbar";
import { Gallery } from "@/components/landing/gallery";


export const Homepage = () => {
  return (
    <>
      <div className="min-h-screen  ">
      
          <Sidebar/>
        
        <div className="w-full flex flex-col pl-16  ">
          <Navbar />
          <main  className="flex-1">
            <Gallery/>
          </main>
          
        </div>
      </div>
    </>
  );
}
