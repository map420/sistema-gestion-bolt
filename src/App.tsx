import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Finances from './components/Finances';
import Library from './components/Library';
import Contacts from './components/Contacts';
import Objectives from './components/Objectives';
import Projects from './components/Projects';
import Habits from './components/Habits';

function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'finances':
        return <Finances />;
      case 'library':
        return <Library />;
      case 'contacts':
        return <Contacts />;
      case 'objectives':
        return <Objectives />;
      case 'projects':
        return <Projects />;
      case 'habits':
        return <Habits />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default App;
