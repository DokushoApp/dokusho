import React from "react";
import Menubar from "@/components/ui/menubar";

// Import the individual settings components
import GeneralSettings from "@/components/settings/GeneralSettings";
import LibrarySettings from "@/components/settings/LibrarySettings";
import ReaderSettings from "@/components/settings/ReaderSettings";
import ExtensionSettings from "@/components/settings/ExtensionSettings";
import AboutSettings from "@/components/settings/AboutSettings";

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