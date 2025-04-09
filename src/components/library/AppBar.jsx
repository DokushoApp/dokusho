import {SidebarTrigger} from "@/components/ui/sidebar.jsx";
import {Separator} from "@/components/ui/separator.jsx";
import {DynamicBreadcrumb} from "@/components/ui/dynamicbreadcrumb.jsx";
import React from "react";

const AppBar = () => {
  return (
    <div className={"flex flex-row w-full items-center gap-2 px-3"}>
      <SidebarTrigger/>
      <Separator orientation="vertical" className={"my-2"}/>
      <DynamicBreadcrumb/>
    </div>
  )
}

export default AppBar;