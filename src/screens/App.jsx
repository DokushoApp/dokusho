import React, {useState} from "react";
import {Sidebar, SidebarBody, SidebarLink} from "../components/ui/sidebar";
import Reader from '../components/Reader';
import {
  IconLibrary,
  IconSearch,
  IconSettings,
  IconHistory,
  IconTorii,
} from "@tabler/icons-react";
import {motion} from "motion/react";
import {cn} from "../lib/utils.js";

export function App() {
  const links = [
    {
      label: "Library",
      href: "#",
      icon: (
        <IconLibrary className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200"/>
      ),
    },
    {
      label: "Browse",
      href: "#",
      icon: (
        <IconSearch className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200"/>
      ),
    },
    {
      label: "History",
      href: "#",
      icon: (
        <IconHistory className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200"/>
      ),
    },
  ];
  const [open, setOpen] = useState(true);
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-screen"
      )}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo/> : <LogoIcon/>}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link}/>
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Settings",
                href: "#",
                icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200"/>
              }}/>
          </div>
        </SidebarBody>
      </Sidebar>
      <Reader/>
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white">
      <div
        className="h-5 w-6 shrink-0">
        <IconTorii/>
      </div>
      <motion.span
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        className="font-medium whitespace-pre text-black dark:text-white">
        Dokusho
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div
        className="h-5 w-6 shrink-0">
        <IconTorii className="h-5 w-5 shrink-0 text-white"/>
      </div>
    </a>
  );
};

export default App;
