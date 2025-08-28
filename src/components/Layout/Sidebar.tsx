import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  BarChart3, 
  CheckSquare, 
  Trophy,
  Target,
  User,
  Home,
  FileText,
  Award,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const guruNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Manajemen Kelas', href: '/kelas', icon: Users },
    { name: 'Manajemen Siswa', href: '/siswa', icon: GraduationCap },
    { name: 'Verifikasi Aktivitas', href: '/verifikasi', icon: CheckSquare },
    { name: 'Rekap Aktivitas', href: '/rekap', icon: BarChart3 },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Level & Target', href: '/level', icon: Target },
    { name: 'Profil', href: '/profil', icon: User },
  ];

  const siswaNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Tambah Aktivitas', href: '/aktivitas/tambah', icon: BookOpen },
    { name: 'Daftar Aktivitas', href: '/aktivitas', icon: FileText },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Profil', href: '/profil', icon: User },
  ];

  const navigation = user?.role === 'guru' ? guruNavigation : siswaNavigation;

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lentera</h1>
            <p className="text-sm text-gray-500">Aktivitas Literasi</p>
          </div>
        </div>
      </div>

      <nav className="px-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;