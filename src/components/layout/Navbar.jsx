import React, {useState} from "react";
import {Sidebar, SidebarBody, SidebarLink} from "../ui/Sidebar.jsx";
import {
  IconLibrary,
  IconSearch,
  IconSettings,
  IconHistory,
  IconTorii,
} from "@tabler/icons-react";
import {motion} from "motion/react";

const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white">
      <div
        className="h-5 w-6 shrink-0">
        <IconTorii className="h-6 w-6 shrink-0 text-black dark:text-white"/>
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
const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div
        className="h-5 w-6 shrink-0">
        <IconTorii className="h-6 w-6 shrink-0 text-black dark:text-white"/>
      </div>
    </a>
  );
};

export function Navbar() {
  const links = [
    {
      label: "Library",
      href: "/",
      icon: (
        <IconLibrary className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200"/>
      ),
    },
    {
      label: "Browse",
      href: "/browse",
      icon: (
        <IconSearch className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200"/>
      ),
    },
    {
      label: "History",
      href: "/history",
      icon: (
        <IconHistory className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200"/>
      ),
    },
  ];
  const [open, setOpen] = useState(true);
  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <span onClick={() => setOpen(!open)}>
              {open ? <Logo/> : <LogoIcon/>}
            </span>
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
              href: "/settings",
              icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200"/>
            }}/>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

export default Navbar;
