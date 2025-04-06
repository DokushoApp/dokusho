// Layout.jsx
import React from 'react';
import {Outlet} from 'react-router';
import Navbar from './Navbar';
import {cn} from "../../lib/utils.js";

const Base = () => {
  return (
    <div className={cn(
      "flex w-full flex-1 flex-col overflow-hidden bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
      "h-screen"
    )}>
      <Navbar/>
      <Outlet/>
    </div>
  );
};

export default Base;