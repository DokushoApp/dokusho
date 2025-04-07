// Layout.jsx
import React from 'react';
import {Outlet} from 'react-router';
import {AppSidebar} from './AppSidebar.jsx';
import {cn} from "@/lib/utils.js";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "../ui/sidebar.jsx";

const Base = () => {
  return (
    <div className={cn(
      "flex w-full flex-1 flex-col overflow-hidden bg-gray-100 md:flex-row  dark:bg-neutral-800",
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
          <div>
            <SidebarTrigger/>
          </div>
          <Outlet/>
        </SidebarInset>
      </SidebarProvider>

    </div>
  );
};

export default Base;