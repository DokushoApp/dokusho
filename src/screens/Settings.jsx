import React from "react";
import Menubar from "@/components/ui/menubar";

// Import the individual settings components
import GeneralSettings from "@/components/library/GeneralSettings";
import LibrarySettings from "@/components/library/LibrarySettings";
import ReaderSettings from "@/components/library/ReaderSettings";
import ExtensionSettings from "@/components/library/ExtensionSettings";
import AboutSettings from "@/components/library/AboutSettings";

const SettingsScreen = () => {
  // Active settings tab
  const [activeTab, setActiveTab] = React.useState("general");

  // Settings tabs for the MenuBar
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

      <div className="py-6">
        {/* Render the appropriate settings component based on active tab */}
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