import React from 'react';
import { Settings, User, Moon, Sun } from 'lucide-react';
import { CalendarWidget } from './CalendarWidget';
import { NotesWidget } from './NotesWidget';

interface SidebarProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ darkMode, toggleDarkMode }) => {
    return (
        <div className="w-[300px] h-screen bg-[#F7F7F5] dark:bg-[#202020] border-r border-[#E9E9E7] dark:border-[#2F2F2F] flex flex-col font-sans transition-colors duration-200">
            {/* Profile / Workspace Header */}
            <div className="p-4 hover:bg-[#EDECE9] dark:hover:bg-[#2C2C2C] cursor-pointer transition-colors duration-200">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-orange-400 rounded text-white flex items-center justify-center text-xs font-bold">
                        R
                    </div>
                    <span className="text-sm font-medium text-[#37352F] dark:text-[#D4D4D4] overflow-hidden text-ellipsis whitespace-nowrap">
                        Ritam's Agent
                    </span>
                </div>
            </div>

            {/* Navigation / Tools */}
            <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
                <div className="text-xs font-semibold text-[#9B9A97] dark:text-[#737373] px-2 mb-2 uppercase tracking-wide">
                    Workspace
                </div>

                <CalendarWidget />

                <NotesWidget />
            </div>

            {/* Bottom Actions */}
            <div className="p-2 border-t border-[#E9E9E7] dark:border-[#2F2F2F]">
                <div
                    onClick={toggleDarkMode}
                    className="px-2 py-1 flex items-center gap-2 text-[#37352F] dark:text-[#D4D4D4] hover:bg-[#EDECE9] dark:hover:bg-[#2C2C2C] rounded cursor-pointer text-sm mb-1"
                >
                    {darkMode ? <Sun size={16} className="text-[#9B9A97]" /> : <Moon size={16} className="text-[#9B9A97]" />}
                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <div className="px-2 py-1 flex items-center gap-2 text-[#37352F] dark:text-[#D4D4D4] hover:bg-[#EDECE9] dark:hover:bg-[#2C2C2C] rounded cursor-pointer text-sm">
                    <Settings size={16} className="text-[#9B9A97]" />
                    <span>Settings</span>
                </div>
                <div className="px-2 py-1 flex items-center gap-2 text-[#37352F] dark:text-[#D4D4D4] hover:bg-[#EDECE9] dark:hover:bg-[#2C2C2C] rounded cursor-pointer text-sm">
                    <User size={16} className="text-[#9B9A97]" />
                    <span>Profile</span>
                </div>
            </div>
        </div>
    );
};
