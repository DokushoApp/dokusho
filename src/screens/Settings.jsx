import React from "react";
import Menubar from "@/components/ui/menubar";
import GeneralSettings from "@/components/settings/GeneralSettings";
import LibrarySettings from "@/components/settings/LibrarySettings";
import ReaderSettings from "@/components/settings/ReaderSettings";
import ExtensionSettings from "@/components/settings/ExtensionSettings";
import AboutSettings from "@/components/settings/AboutSettings";

const SettingsScreen = () => {
  const [activeTab, setActiveTab] = React.useState("general");

  const settingsTabs = [
    { id: "general", name: "General" },
    { id: "library", name: "Library" },
    { id: "reader", name: "Reader" },
    { id: "extension", name: "Extension" },
    { id: "about", name: "About" }
  ];

  return (
    <div className="flex flex-col">
      <Menubar
        menuItems={settingsTabs}
        initialItem={activeTab}
        onItemSelect={setActiveTab}
        allowAddItem={false}
      />

      <div>
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "library" && <LibrarySettings />}
        {activeTab === "reader" && <ReaderSettings />}
        {activeTab === "extension" && <ExtensionSettings />}
        {activeTab === "about" && <AboutSettings />}
      </div>
    </div>
  );
};

export default SettingsScreen;