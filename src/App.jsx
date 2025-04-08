import React from "react";
import {BrowserRouter, Routes, Route} from "react-router";
import Library from './screens/Library.jsx';
import Browse from "./screens/Browse.jsx";
import History from "./screens/History.jsx";
import Settings from "./screens/Settings.jsx";
import Base from "@/components/library/Base.jsx";
import Reader from "@/screens/Reader.jsx";


export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Base/>}>
          <Route path={"/"} element={<Library/>}/>
          <Route path={"/browse"} element={<Browse/>}/>
          <Route path={"/history"} element={<History/>}/>
          <Route path={"/settings"} element={<Settings/>}/>
        </Route>

        <Route path={"/reader"} element={<Reader/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
