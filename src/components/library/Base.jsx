// Layout.jsx
import React from 'react';
import {NavLink, Outlet} from 'react-router';
import {AppSidebar} from './AppSidebar.jsx';
import {cn} from "@/lib/utils.js";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar.jsx";
import {DynamicBreadcrumb} from "@/components/ui/dynamicbreadcrumb.jsx"
import {Separator} from "@/components/ui/separator.jsx";
import AppBar from "@/components/library/AppBar.jsx";


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