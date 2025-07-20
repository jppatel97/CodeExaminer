import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  XCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { FaEnvelope } from 'react-icons/fa';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalExams: 0,
    totalSubmissions: 0,
    pendingVerification: 0,
    averageScore: 0,
    totalContacts: 0,
    newContacts: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Verify teacher role
    if (userData.role !== 'teacher') {
      toast.error('Access denied. Teacher privileges required.');
      navigate('/login');
      return;
    }

    fetchExams();
    fetchContacts();
  }, [navigate]);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      console.log('Fetching exams for teacher:', userData.id);
      
      const response = await fetch('http://localhost:5000/api/exams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch exams');
      }

      const data = await response.json();
      console.log('Fetched exams data:', data);
      
      // The backend should already filter exams for the teacher
      // No need to filter again on the frontend
      setExams(data.data || []);
      console.log('Setting exams:', data.data);

      // Calculate stats
      const totalSubmissions = data.data.reduce((acc, exam) => 
        acc + (exam.submissions?.length || 0), 0
      );

      const pendingVerification = data.data.reduce((acc, exam) => 
        acc + (exam.submissions?.filter(sub => !sub.verified)?.length || 0), 0
      );

      const allScores = data.data
        .flatMap(exam => exam.submissions || [])
        .filter(sub => sub.verified)
        .map(sub => sub.score || 0);

      const averageScore = allScores.length > 0
        ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
        : 0;

      setStats({
        totalExams: data.data.length,
        totalSubmissions,
        pendingVerification,
        averageScore
      });

    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/contact', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.data || []);

      // Update contact stats
      const newContacts = data.data.filter(contact => contact.status === 'new').length;
      
      setStats(prevStats => ({
        ...prevStats,
        totalContacts: data.data.length,
        newContacts: newContacts
      }));

    } catch (err) {
      console.error('Error fetching contacts:', err);
      // Don't set error for contacts as it's not critical
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleCreateExam = () => {
    navigate('/create-exam');
  };

  const handleEditExam = async (examId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch the exam details first
      const response = await fetch(`http://localhost:5000/api/exams/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch exam details');
      }

      const data = await response.json();
      console.log('Fetched exam details:', data);
      
      // Store the exam data in localStorage for editing
      localStorage.setItem('editExam', JSON.stringify(data.data));
      
      // Navigate to edit page
      navigate(`/edit-exam/${examId}`);
    } catch (err) {
      console.error('Error fetching exam details:', err);
      setError(err.message || 'Failed to fetch exam details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmissions = async (examId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch the exam details with submissions
      const response = await fetch(`http://localhost:5000/api/exams/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch exam submissions');
      }

      const data = await response.json();
      console.log('Fetched exam submissions:', data);
      
      // Store the exam data in localStorage for viewing submissions
      localStorage.setItem('examSubmissions', JSON.stringify(data.data));
      
      // Navigate to submissions page
      navigate(`/exam-submissions/${examId}`);
    } catch (err) {
      console.error('Error fetching exam submissions:', err);
      setError(err.message || 'Failed to fetch exam submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete exam');
      }

      // Show success toast
      toast.success('Exam deleted successfully', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#4CAF50',
          color: '#fff',
        },
      });

      // Refresh the exams list
      fetchExams();
    } catch (err) {
      console.error('Error deleting exam:', err);
      // Show error toast
      toast.error(err.message || 'Failed to delete exam', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#f44336',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                <BookOpenIcon className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <AcademicCapIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">
                  {JSON.parse(localStorage.getItem('userData') || '{}').name || 'Teacher'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
            {error}
          </div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Total Exams</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalExams}</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 text-white">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Submissions</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSubmissions}</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
                <ClockIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Pending</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingVerification}</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                <AcademicCapIcon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Avg. Score</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <FaEnvelope className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Total Contacts</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalContacts}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
                <FaEnvelope className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">New Messages</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.newContacts}</p>
          </div>
        </div>

        {/* Create Exam Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Exams</h2>
          <button
            onClick={handleCreateExam}
            className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <PlusIcon className="h-5 w-5" />
            Create New Exam
          </button>
        </div>

        {/* Exam List */}
        <div className="grid grid-cols-1 gap-6 mb-12">
          {exams.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-white/50">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No exams created yet</h3>
              <p className="text-gray-600 mb-6">Create your first exam to get started with CodeExaminer</p>
              <button
                onClick={handleCreateExam}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <PlusIcon className="h-5 w-5" />
                Create Your First Exam
              </button>
            </div>
          ) : (
            exams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-2xl rounded-2xl transition-all duration-500 transform hover:-translate-y-1 border border-white/50"
              >
                <div className="px-8 py-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-6">
                      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                        <DocumentTextIcon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {exam.title}
                        </h3>
                        <div className="flex items-center gap-6 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                            <span className="font-medium">{exam.duration} minutes</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{exam.questions.length}</span> Questions
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{exam.submissions?.length || 0}</span> Submissions
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Subject:</span> {exam.subject}
                        </div>
                        <div className="text-sm text-gray-600">
                          {exam.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewSubmissions(exam._id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                        title="View Submissions"
                        disabled={loading}
                      >
                        <UserGroupIcon className="h-5 w-5" />
                        <span>Submissions</span>
                      </button>
                      <button
                        onClick={() => handleEditExam(exam._id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300"
                        title="Edit Exam"
                        disabled={loading}
                      >
                        <PencilIcon className="h-5 w-5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam._id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                        title="Delete Exam"
                        disabled={loading}
                      >
                        <TrashIcon className="h-5 w-5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact Submissions */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Contact Submissions</h2>
          <div className="grid grid-cols-1 gap-6">
            {contacts.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-white/50">
                <FaEnvelope className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No contact submissions yet</h3>
                <p className="text-gray-600">Contact form submissions from your website will appear here</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-2xl rounded-2xl transition-all duration-500 transform hover:-translate-y-1 border border-white/50"
                >
                  <div className="px-8 py-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-6">
                        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                          <FaEnvelope className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                              {contact.subject}
                            </h3>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              contact.status === 'new' 
                                ? 'bg-orange-100 text-orange-800' 
                                : contact.status === 'read'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                            <span className="font-semibold text-gray-700">{contact.name}</span>
                            <span>{contact.email}</span>
                            <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-gray-700 leading-relaxed">
                            {contact.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 