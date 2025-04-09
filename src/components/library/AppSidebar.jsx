import React, {useState} from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup, SidebarGroupContent,
  SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from "../ui/sidebar.jsx";
import {
  Library,
  Search,
  Settings,
  History,
} from "lucide-react";
import {NavLink} from "react-router";
import Icon from "@/assets/icon.png"

export function AppSidebar() {
  // Menu items.
  const items = [
    {
      title: "Library",
      url: "/",
      icon: Library,
    },
    {
      title: "Browse",
      url: "/browse",
      icon: Search,
    },
    {
      title: "History",
      url: "/history",
      icon: History,
    },
  ]
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row p-1 gap-2 items-center">
            <img src={Icon} alt={"icon"} width="42" />
            <span className={"text-lg"}>Dokusho</span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url}>
                      <div className={'w-5'}>
                        <item.icon className={'w-5'} strokeWidth={1.5}/>
                      </div>
                      <span className={'text-md'}>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/settings">
                <div className={'w-5'}>
                  <Settings className="w-5" strokeWidth={1.5}/>
                </div>
                <span className={'text-md'}>Settings</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
