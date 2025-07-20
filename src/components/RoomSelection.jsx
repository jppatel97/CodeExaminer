import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { 
  UserIcon,
  PlusIcon,
  UserGroupIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CodeBracketIcon,
  SparklesIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const RoomSelection = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize username from localStorage
  React.useEffect(() => {
    // Don't load any saved username - let user enter it manually
    // This ensures only placeholder text shows by default
  }, []);

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    setIsLoading(true);
    try {
      const newRoomId = uuidv4();
      // Simulate a brief loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(`/editor?room=${newRoomId}`, { 
        state: { username: username.trim() } 
      });
    } catch (error) {
      toast.error('Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    if (!joinRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    setIsLoading(true);
    try {
      // Simulate a brief loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate(`/editor?room=${joinRoomId.trim()}`, { 
        state: { username: username.trim() } 
      });
    } catch (error) {
      toast.error('Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-medium mb-6 shadow-lg">
            <SparklesIcon className="h-4 w-4" />
            <span>Collaborative Code Editor</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CodeExaminer</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create a new coding session or join an existing one to start collaborating in real-time
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 lg:p-12">
          {/* Username Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Your Name</label>
            <div className="relative group">
              <UserIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors duration-300" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-12 pr-4 py-4 w-full border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Room */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 hover:border-green-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <PlusIcon className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Create New Room</h3>
              <p className="text-gray-600 mb-6 text-center leading-relaxed">
                Start a new collaborative coding session and invite others to join
              </p>
              <button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating...
                  </div>
                ) : (
                  <>
                    <span>Create Room</span>
                    <ArrowRightIcon className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </div>

            {/* Join Room */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 hover:border-blue-300 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UsersIcon className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Join Existing Room</h3>
              <p className="text-gray-600 mb-6 text-center leading-relaxed">
                Enter a room ID to join an existing collaborative session
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room ID</label>
                  <input
                    type="text"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter room ID"
                  />
                </div>
                <button
                  onClick={handleJoinRoom}
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Joining...
                    </div>
                  ) : (
                    <>
                      <span>Join Room</span>
                      <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:bg-gray-100 px-4 py-2 rounded-lg"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default RoomSelection; 