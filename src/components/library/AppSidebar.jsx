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
  IconLibrary,
  IconSearch,
  IconSettings,
  IconHistory,
  IconTorii
} from "@tabler/icons-react";
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
  ]
  const [open, setOpen] = useState(true);
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row p-1 gap-2">
            <IconTorii />
            <h1>Dokusho</h1>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/settings">
                <IconSettings />
                <span>Settings</span>
              </NavLink>
            </SidebarMenuButton> </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
