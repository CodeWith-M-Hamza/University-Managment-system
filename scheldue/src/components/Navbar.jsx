
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  AcademicCapIcon,
  BookOpenIcon,
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChevronDownIcon,
  CogIcon,
  ExclamationTriangleIcon,
  DocumentChartBarIcon,
  CubeIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';

const Navbar = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  // Core navigation groups
  const coreNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, description: 'Overview and analytics' },
    { name: 'Schedule', href: '/schedule', icon: ClockIcon, description: 'View timetables' },
    { name: 'Master Timetable', href: '/master-timetable', icon: TableCellsIcon, description: 'Complete timetable view' },
  ];

  const academicNavigation = [
    { name: 'Sessions', href: '/sessions', icon: CalendarDaysIcon, description: 'Academic sessions' },
    { name: 'Sections', href: '/sections', icon: UsersIcon, description: 'Class sections' },
    { name: 'Students', href: '/students', icon: AcademicCapIcon, description: 'Student management' },
    { name: 'Programs', href: '/programs', icon: DocumentChartBarIcon, description: 'Degree programs' },
  ];

  const teachingNavigation = [
    { name: 'Assignments', href: '/assignments', icon: UserGroupIcon, description: 'Teacher assignments' },
    { name: 'Teachers', href: '/teachers', icon: ChartBarIcon, description: 'Faculty management' },
    { name: 'Courses', href: '/courses', icon: BookOpenIcon, description: 'Course catalog' },
    { name: 'Course Offerings', href: '/course-offerings', icon: CubeIcon, description: 'Course offerings' },
  ];

  const systemNavigation = [
    { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon, description: 'Department setup' },
    { name: 'Rooms', href: '/rooms', icon: BuildingOfficeIcon, description: 'Room management' },
    { name: 'Time Slots', href: '/time-slots', icon: ClockIcon, description: 'Time slot management' },
  ];

  const scheduleManagementNavigation = [
    { name: 'Generated Schedules', href: '/generated-schedules', icon: DocumentChartBarIcon, description: 'Schedule versions' },
    { name: 'Schedule Exceptions', href: '/schedule-exceptions', icon: ExclamationTriangleIcon, description: 'Class changes' },
  ];

  const authNavigation = [
    { name: 'Login', href: '/login', icon: ArrowRightOnRectangleIcon },
    { name: 'Register', href: '/register', icon: UserPlusIcon }
  ];

  // Helpers
  const isActiveRoute = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setIsOpen(false);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.username || user.email?.split('@')[0] || 'User';
  };

  const getUserRole = () => {
    if (!user) return '';
    return user.user_type ? user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1) : 'User';
  };

  // Desktop dropdown component with very high z-index
  const DesktopDropdownGroup = ({ label, items, icon: Icon }) => (
    <div className="relative group" style={{ zIndex: 1000 }}>
      <button
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-200"
        aria-haspopup="true"
      >
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDownIcon className="w-4 h-4 ml-1" />
      </button>
      <div
        className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
        style={{ zIndex: 1001 }}
      >
        <div className="p-2">
          {items.map((item) => (
            <Link 
              key={item.name} 
              to={item.href} 
              className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-50 group transition-colors duration-150"
              aria-label={item.name}
            >
              {item.icon && <item.icon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />}
              <div>
                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0" style={{ zIndex: 999 }} role="navigation" aria-label="Main">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-4">
            <Link 
              to={isAuthenticated ? "/dashboard" : "/"} 
              className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
              aria-label="Home"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <CalendarDaysIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">AcademicPro</span>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-1" role="menubar" aria-label="Main navigation">
                {coreNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActiveRoute(item.href) 
                        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    role="menuitem"
                    aria-label={item.name}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    <span className="whitespace-nowrap">{item.name}</span>
                  </Link>
                ))}

                <DesktopDropdownGroup label="Academic" icon={AcademicCapIcon} items={academicNavigation} />
                <DesktopDropdownGroup label="Teaching" icon={UserGroupIcon} items={teachingNavigation} />
                <DesktopDropdownGroup label="Schedules" icon={CalendarDaysIcon} items={scheduleManagementNavigation} />
                <DesktopDropdownGroup label="System" icon={CogIcon} items={systemNavigation} />
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="relative group" style={{ zIndex: 1000 }} aria-label="User menu">
                <button 
                  className="flex items-center space-x-2 bg-white hover:bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  aria-label="User menu"
                >
                  <UserCircleIcon className="h-6 w-6 text-gray-500" />
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
                    <div className="text-xs text-gray-500">{getUserRole()}</div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
                <div 
                  className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                  style={{ zIndex: 1001 }}
                >
                  <div className="p-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150"
                      role="menuitem"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                {authNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md border border-gray-200 transition-all duration-200"
                      aria-label={item.name}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0" style={{ zIndex: 2000 }} role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Drawer Panel */}
          <aside 
            className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            style={{ zIndex: 2001 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <CalendarDaysIcon className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-lg text-gray-900">AcademicPro</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <UserCircleIcon className="h-8 w-8 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">{getUserDisplayName()}</div>
                      <div className="text-sm text-gray-500">{getUserRole()}</div>
                    </div>
                  </div>

                  {/* Navigation Sections */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                      Core
                    </div>
                    {coreNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                          isActiveRoute(item.href)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        aria-label={item.name}
                      >
                        {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>

                  {[
                    { title: 'Academic', items: academicNavigation },
                    { title: 'Teaching', items: teachingNavigation },
                    { title: 'Schedules', items: scheduleManagementNavigation },
                    { title: 'System', items: systemNavigation },
                  ].map((section) => (
                    <div key={section.title} className="space-y-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                        {section.title}
                      </div>
                      {section.items.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          aria-label={item.name}
                        >
                          {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  ))}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors duration-200 mt-6"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  {authNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        aria-label={item.name}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </nav>
  );
};

export default Navbar;