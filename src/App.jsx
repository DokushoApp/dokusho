import React from "react";
import {BrowserRouter, Routes, Route} from "react-router";
import Library from './screens/Library.jsx';
import Browse from "./screens/Browse.jsx";
import History from "./screens/History.jsx";
import Settings from "./screens/Settings.jsx";
import Base from "./components/layout/Base.jsx";


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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
