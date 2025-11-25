import { useContext } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { CpanelContext } from '../context/CpanelProvider';

export default function Layout({ children }) {
  const { sidebar, handleSidebar } = useContext(CpanelContext);

  return (
    <div className="relative min-h-screen bg-light-bg text-light-text dark:bg-dark-bg dark:text-text-light">
      <Sidebar />

      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${
          sidebar ? 'md:ml-[250px]' : 'md:ml-[90px]'
        } ml-0`}
      >
        <Header onMenuClick={handleSidebar} />

        <main className="flex-1 bg-accent-bg/60 px-4 py-6 dark:bg-dark-bg/80 md:px-6 lg:px-6">
          <div className="card-surface dark:bg-dark-card p-5 shadow-soft">{children}</div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
