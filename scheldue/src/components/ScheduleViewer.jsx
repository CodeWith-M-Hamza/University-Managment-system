
import React, { useState, useEffect } from 'react';
import { timetableService } from '../services/timetableService';
import classSectionAPI from '../services/classSectionAPI';
import { academicSessionAPI } from '../services/academicSessionAPI';
import { Calendar, Clock, Users, BookOpen, MapPin, Search } from 'lucide-react';

const ScheduleViewer = () => {
  const [schedules, setSchedules] = useState([]);
  const [sections, setSections] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('section');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSession, setSelectedSession] = useState('');

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' }
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [sectionsData, sessionsData, schedulesData] = await Promise.all([
        classSectionAPI.getAllSections().catch(err => {
          console.warn('Sections not available:', err);
          return [];
        }),
        academicSessionAPI.getAll().catch(err => {
          console.warn('Sessions not available:', err);
          return [];
        }),
        timetableService.getAllSchedules().catch(err => {
          console.warn('Schedules not available:', err);
          return [];
        })
      ]);

      const toArray = (data) => Array.isArray(data) ? data : [];

      setSections(toArray(sectionsData));
      setSessions(toArray(sessionsData));
      setSchedules(toArray(schedulesData));

      console.log('Loaded data:', {
        sections: toArray(sectionsData).length,
        sessions: toArray(sessionsData).length,
        schedules: toArray(schedulesData).length
      });

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resolve teacher name from various API shapes
  const getTeacherNameInline = (teacher) => {
    if (!teacher) return 'Unknown Teacher';
    // Shape 1: { teacher_name: 'Name', ... }
    if (typeof teacher.teacher_name === 'string' && teacher.teacher_name.trim()) {
      return teacher.teacher_name.trim();
    }
    // Shape 2: { user: { first_name, last_name, username, ... }, ... }
    const tUser = teacher.user;
    if (tUser && typeof tUser === 'object') {
      const first = tUser.first_name ?? '';
      const last = tUser.last_name ?? '';
      const full = [first, last].filter(Boolean).join(' ').trim();
      if (full) return full;
      if (typeof tUser.username === 'string' && tUser.username) return tUser.username;
    }
    return 'Unknown Teacher';
  };

  // Helper to safely stringify IDs for comparison
  const toId = (v) => (typeof v === 'string' ? v : String(v));

  // Filter schedules by selected section or session
  const getFilteredSchedules = () => {
    let filtered = schedules;
    if (activeTab === 'section' && selectedSection) {
      const secId = toId(selectedSection);
      filtered = filtered.filter(s => toId(s.class_section?.id) === secId);
    }
    if (activeTab === 'session' && selectedSession) {
      const sessId = toId(selectedSession);
      filtered = filtered.filter(s => toId(s.academic_session?.id) === sessId);
    }
    return filtered;
  };

  // Get schedule for a specific day
  const getScheduleForDay = (day, scheduleList) => {
    const dayValue = day?.value;
    return (scheduleList || [])
      .filter(item => item.time_slot?.day === dayValue)
      .sort((a, b) => {
        const sa = a.time_slot?.start_time;
        const sb = b.time_slot?.start_time;
        if (sa && sb) return sa.localeCompare(sb);
        return 0;
      });
  };

  // Format time safely
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const parts = String(timeString).split(':');
    if (parts.length < 2) return timeString;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return timeString;
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Display helpers for section / session names
  const getSectionName = (sectionId) => {
    const s = sections.find(sec => String(sec.id) === String(sectionId));
    return s?.name ?? 'Unknown Section';
  };

  const getSessionName = (sessionId) => {
    const s = sessions.find(sess => String(sess.id) === String(sessionId));
    return s?.name ?? 'Unknown Session';
  };

  const filteredSchedules = getFilteredSchedules();

  // Inline teacher rendering for session schedule
  const renderTeacherName = (teacher) => getTeacherNameInline(teacher);

  // UI
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule Viewer</h1>
              <p className="mt-2 text-sm text-gray-600">
                View class schedules by section or academic session
              </p>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => {
                  setActiveTab('section');
                  setSelectedSession('');
                }}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'section'
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Section Schedule
              </button>
              <button
                onClick={() => {
                  setActiveTab('session');
                  setSelectedSection('');
                }}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'session'
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Session Schedule
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Section Schedule Tab */}
            {activeTab === 'section' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Class Section
                    </label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Choose a section...</option>
                      {sections.map(section => (
                        <option key={section.id} value={section.id}>
                          {section.name} - {section.department?.name} (Sem {section.semester})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={loadInitialData}
                      disabled={loading}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Search className="h-4 w-4" />
                      {loading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </div>

                {selectedSection && filteredSchedules.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Schedule for {getSectionName(selectedSection)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {daysOfWeek.map(day => {
                        const daySchedule = getScheduleForDay(day, filteredSchedules);
                        if (daySchedule.length === 0) return null;
                        return (
                          <div key={day.value} className="bg-gray-50 rounded-lg p-4 border">
                            <h4 className="font-semibold text-gray-800 mb-3 text-lg">
                              {day.label}
                            </h4>
                            <div className="space-y-3">
                              {daySchedule.map((item, idx) => (
                                <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Clock className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm font-medium text-gray-600">
                                        {formatTime(item.time_slot?.start_time)} - {formatTime(item.time_slot?.end_time)}
                                      </span>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${item.course?.course_type === 'lab' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                      {item.course?.course_type || 'Theory'}
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <BookOpen className="h-4 w-4 text-blue-500" />
                                      <div>
                                        <span className="font-medium text-gray-900">{item.course?.name}</span>
                                        <span className="text-xs text-gray-500 block">{item.course?.code}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Users className="h-4 w-4 text-green-500" />
                                      <span className="text-sm text-gray-700">
                                        {getTeacherNameInline(item.teacher)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-red-500" />
                                      <span className="text-sm text-gray-700">{item.room?.room_number}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {filteredSchedules.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No classes scheduled for this section.
                      </div>
                    )}
                  </div>
                ) : selectedSection ? (
                  <div className="text-center py-8 text-gray-500">
                    No schedule data available for the selected section.
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Please select a section to view its schedule.
                  </div>
                )}
              </div>
            )}

            {/* Session Schedule Tab */}
            {activeTab === 'session' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Academic Session
                    </label>
                    <select
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Choose a session...</option>
                      {sessions.map(session => (
                        <option key={session.id} value={session.id}>
                          {session.name} ({session.session_type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={loadInitialData}
                      disabled={loading}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Search className="h-4 w-4" />
                      {loading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                </div>

                {selectedSession && filteredSchedules.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Schedule for {getSessionName(selectedSession)}
                    </h3>
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredSchedules.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 capitalize font-medium text-gray-900">
                                  {item.time_slot?.day}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {formatTime(item.time_slot?.start_time)} - {formatTime(item.time_slot?.end_time)}
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="font-medium text-gray-900">{item.course?.name}</div>
                                    <div className="text-xs text-gray-500">{item.course?.code}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {renderTeacherName(item.teacher)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {item.class_section?.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">
                                  {item.room?.room_number}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${item.course?.course_type === 'lab' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {item.course?.course_type || 'Theory'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : selectedSession ? (
                  <div className="text-center py-8 text-gray-500">
                    No schedule data available for the selected session.
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Please select an academic session to view its schedule.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Data Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Data Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>{sections.length} Class Sections</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <span>{sessions.length} Academic Sessions</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <span>{schedules.length} Scheduled Classes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleViewer;