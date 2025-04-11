import React, {useEffect} from 'react';
import {Outlet} from 'react-router';
import {AppSidebar} from './AppSidebar.jsx';
import {cn} from "@/lib/utils.js";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar.jsx";
import AppBar from "@/components/base/AppBar.jsx";
import {useAtom} from "jotai";
import {initializeLibraryAtom} from "@/store/library.js";
import {initializeSettingsAtom} from "@/store/settings.js";


const Base = () => {
  const [, initializeLibrary] = useAtom(initializeLibraryAtom)
  const [, initializeSettings] = useAtom(initializeSettingsAtom)
  useEffect( () => {
    initializeLibrary();
    initializeSettings();
  },[])
  return (
    <div className={cn(
      "flex w-full flex-1 flex-col overflow-hidden md:flex-row",
      "h-screen"
    )}>
      <SidebarProvider
        style={{
          "--sidebar-width": "12rem",
          "--sidebar-width-mobile": "10rem",
        }}
      >
        <AppSidebar variant="inset"/>
        <SidebarInset className={"p-2"}>
          <AppBar/>
          <div className="px-4 flex flex-1">
            <Outlet/>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Base;