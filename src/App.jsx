import React from "react";
import {BrowserRouter, Routes, Route} from "react-router";
import {Provider} from "jotai";
import Library from '@/screens/Library.jsx';
import Browse from "@/screens/Browse.jsx";
import History from "@/screens/History.jsx";
import Settings from "@/screens/Settings.jsx";
import Reader from "@/screens/Reader.jsx";
import Manga from "@/screens/MangaDetails.jsx"; // Import the new Manga screen
import Base from "@/components/base/Base.jsx";


export function App() {
  return (
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route element={<Base/>}>
            <Route path={"/"} element={<Library/>}/>
            <Route path={"/browse"} element={<Browse/>}/>
            <Route path={"/history"} element={<History/>}/>
            <Route path={"/settings"} element={<Settings/>}/>
            <Route path={"/manga"} element={<Manga/>}/>
          </Route>

          <Route path={"/reader"} element={<Reader/>}/>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;