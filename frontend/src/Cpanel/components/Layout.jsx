import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { CpanelContext } from '../context/CpanelProvider';

export default function Layout() {
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

        <main className="flex-1 bg-accent-bg/60 px-2 py-6 dark:bg-dark-bg/80 md:px-6 lg:px-8">
          <div className="card-surface dark:bg-dark-card p-5 shadow-soft">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>

      {sidebar ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={handleSidebar}
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
        />
      ) : null}
    </div>
  );
}
