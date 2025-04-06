import React, {useState} from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from "../ui/sidebar.jsx";
import {
  IconLibrary,
  IconSearch,
  IconSettings,
  IconHistory,
  IconTorii,
} from "@tabler/icons-react";
import {motion} from "motion/react";
import {NavLink} from "react-router";

export function AppSidebar() {
  // Menu items.
  const items = [
    {
      title: "Library",
      url: "/",
      icon: IconLibrary,
    },
    {
      title: "Browse",
      url: "/browse",
      icon: IconSearch,
    },
    {
      title: "History",
      url: "/history",
      icon: IconHistory,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ]
  const [open, setOpen] = useState(true);
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
