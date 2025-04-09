import {SidebarTrigger} from "@/components/ui/sidebar.jsx";
import {Separator} from "@/components/ui/separator.jsx";
import {DynamicBreadcrumb} from "@/components/ui/dynamicbreadcrumb.jsx";
import React from "react";

const AppBar = () => {
  return (
    <div className="flex flex-row w-full items-center gap-2 px-3">
      <SidebarTrigger/>
      <div className="h-5 flex items-center justify-center">
        <Separator orientation="vertical" className="h-5" />
      </div>
      <DynamicBreadcrumb/>
    </div>
  )
}

export default AppBar;