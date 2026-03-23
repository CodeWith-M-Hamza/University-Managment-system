import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Home, 
  Clock, 
  Users2, 
  Calendar, 
  BookMarked,
  Menu,
  X
} from 'lucide-react';
import TeacherManager from './TeacherManager';
import CoursesManager from './CoursesManager';
import RoomManager from './RoomManager';
import TimeSlotManager from './TimeSlotManager';
import ClassSectionManager from './ClassSectionManager';
import AcademicSessionManager from './AcademicSessionManager';
import CourseOfferingManager from './CourseOfferingManager';

/**
 * Data Entry Hub
 * Beautiful interface to add all system data one by one
 */
const DataEntryHub = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: 'courses', label: 'Courses', icon: BookOpen, component: CoursesManager },
    { id: 'teachers', label: 'Teachers', icon: Users, component: TeacherManager },
    { id: 'rooms', label: 'Rooms', icon: Home, component: RoomManager },
    { id: 'timeslots', label: 'Time Slots', icon: Clock, component: TimeSlotManager },
    { id: 'sections', label: 'Sections', icon: Users2, component: ClassSectionManager },
    { id: 'sessions', label: 'Sessions', icon: Calendar, component: AcademicSessionManager },
    { id: 'offerings', label: 'Course Offerings', icon: BookMarked, component: CourseOfferingManager },
  ];

  const activeComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 shadow-xl flex flex-col`}
      >
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <h2 className="text-xl font-bold">
              <span className="text-indigo-400">Academic</span> Hub
            </h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-2 px-3">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
                title={tab.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
            <p>📊 Data Entry System</p>
            <p className="mt-1">Add your university data one by one</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeComponent && React.createElement(activeComponent)}
      </div>
    </div>
  );
};

export default DataEntryHub;
