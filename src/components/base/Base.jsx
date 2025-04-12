import React, {useEffect} from 'react';
import {Outlet} from 'react-router';
import {AppSidebar} from './AppSidebar.jsx';
import {cn} from "@/lib/utils.js";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar.jsx";
import AppBar from "@/components/base/AppBar.jsx";
import {useAtom, useAtomValue} from "jotai";
import {initializeLibraryAtom} from "@/store/library.js";
import {initializeSettingsAtom, settingsAtom} from "@/store/settings.js";
import {focusAtom} from "jotai-optics";

const themeAtom = focusAtom(settingsAtom, optic => optic.prop("theme"))

const Base = () => {
  const theme = useAtomValue(themeAtom);
  const [, initializeLibrary] = useAtom(initializeLibraryAtom)
  const [, initializeSettings] = useAtom(initializeSettingsAtom)
  useEffect(() => {
    initializeLibrary();
    initializeSettings();
  }, [])

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme])
  return (
    <div className={cn(
      "flex w-full flex-1 flex-col md:flex-row",
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
          <AppBar className="flex-shrink-0"/>
          <div className="px-4 flex flex-1 overflow-hidden">
            <Outlet/>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Base;