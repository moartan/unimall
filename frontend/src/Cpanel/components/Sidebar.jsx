import { useContext, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowDropleftCircle, IoIosArrowDown } from 'react-icons/io';
import {
  FaChartPie,
  FaBox,
  FaShoppingBag,
  FaUsers,
  FaUserTie,
  FaTags,
  FaPlusCircle,
  FaList,
  FaThLarge,
  FaFileInvoice,
  FaChartLine,
  FaCogs,
  FaQuestionCircle,
  FaBullhorn,
} from 'react-icons/fa';
import logo from '../../assets/logoSmall.png';
import { CpanelContext } from '../context/CpanelProvider';

export default function Sidebar() {
  const { sidebar, handleSidebar } = useContext(CpanelContext);
  const { pathname } = useLocation();
  const [hovered, setHovered] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    products: false,
    categories: false,
    employees: false,
  });

  const isProductsActive = pathname.startsWith('/cpanel/products');
  const isCategoriesActive = pathname.startsWith('/cpanel/categories');
  const isEmployeesActive = pathname.startsWith('/cpanel/employees');

  useEffect(() => {
    setOpenMenus({
      products: isProductsActive,
      categories: isCategoriesActive,
      employees: isEmployeesActive,
    });
  }, [isProductsActive, isCategoriesActive, isEmployeesActive]);

  const toggleMenu = (key) =>
    setOpenMenus((prev) => ({
      ...Object.fromEntries(Object.keys(prev).map((k) => [k, false])),
      [key]: !prev[key],
    }));

  const mainLinkClass = ({ isActive }) =>
    [
      'flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-all duration-200',
      isActive
        ? 'bg-primary/15 dark:bg-primary/25 text-primary border-l-4 border-primary shadow-[var(--shadow-soft)]'
        : 'text-text-primary dark:text-text-light hover:bg-primary/10 hover:text-primary',
    ].join(' ');

  const subLinkClass = ({ isActive }) =>
    [
      'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all duration-200',
      isActive
        ? 'bg-primary/15 dark:bg-primary/25 text-primary border-l-4 border-primary font-semibold shadow-[var(--shadow-soft)]'
        : 'text-text-secondary dark:text-text-light/80 hover:bg-primary/10 hover:text-primary',
    ].join(' ');

  const parentClass = (active) =>
    [
      'flex items-center justify-between px-3 py-2 rounded-md font-medium transition-all duration-200',
      active
        ? 'bg-primary/15 dark:bg-primary/25 text-primary border-l-4 border-primary shadow-[var(--shadow-soft)]'
        : 'text-text-primary dark:text-text-light hover:bg-primary/10 hover:text-primary',
    ].join(' ');

  const SectionTitle = ({ title }) => (
    <div className="mt-4 mb-1 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 text-text-secondary/60 dark:text-text-light/60">
      {!sidebar && !hovered ? (
        <div className="w-full border-t border-primary/30" />
      ) : (
        <>
          <div className="flex-1 border-t border-primary/30" />
          <span className="text-[11px]">{title}</span>
          <div className="flex-1 border-t border-primary/30" />
        </>
      )}
    </div>
  );

  const isSidebarOpen = sidebar || hovered;
  const [textVisible, setTextVisible] = useState(isSidebarOpen);

  useEffect(() => {
    let timer;
    if (isSidebarOpen) {
      timer = setTimeout(() => setTextVisible(true), 120);
    } else {
      setTextVisible(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSidebarOpen]);

  return (
    <motion.aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        width: isSidebarOpen ? '250px' : '90px',
      }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className={`
        fixed top-0 left-0 z-30 h-screen p-4
        bg-light-card dark:bg-dark-card
        border-r border-primary/10
        shadow-soft dark:shadow-strong
        transition-all duration-300 transform
        ${sidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}
      style={{ width: isSidebarOpen ? '250px' : '90px' }}
    >
      <div
        className={`absolute -right-4 top-4 transition-opacity duration-300 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <IoIosArrowDropleftCircle
          onClick={handleSidebar}
          className={`text-3xl text-primary rounded-full cursor-pointer transition-transform duration-500 ${
            sidebar ? '' : 'rotate-180'
          }`}
        />
      </div>

      <div className="flex flex-col mb-5">
      <div className="flex items-center gap-2 px-2">
        <img src={logo} alt="UniMall" className="w-10 h-10 object-contain" />
        {textVisible && (
          <div className="flex">
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">Uni</h1>
            <h1 className="text-2xl font-extrabold text-text-primary dark:text-text-light tracking-tight">
              Mall
            </h1>
            </div>
          )}
        </div>
        <div className="h-0.5 rounded-full mt-3 bg-primary/30" />
      </div>

      <nav
        className="sidebar-scroll flex flex-1 flex-col gap-2 overflow-y-scroll pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#8dd4de transparent' }}
      >
        <NavLink to="/cpanel/dashboard" className={mainLinkClass}>
          <FaChartPie className="text-lg" />
          {textVisible && <span>Dashboard</span>}
        </NavLink>

        <SectionTitle title="Products" />
        <button onClick={() => toggleMenu('products')} className={parentClass(isProductsActive)}>
          <div className="flex items-center gap-3">
            <FaBox className="text-lg" />
            {textVisible && <span>Products</span>}
          </div>
          {textVisible && (
            <IoIosArrowDown className={`transition-transform ${openMenus.products ? 'rotate-180' : ''}`} />
          )}
        </button>

        <AnimatePresence>
          {(sidebar || hovered) && openMenus.products && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="pl-9 flex flex-col gap-1"
            >
              <NavLink to="/cpanel/products/add" className={subLinkClass}>
                <FaPlusCircle className="text-[13px]" /> Add Product
              </NavLink>
              <NavLink to="/cpanel/products/list" className={subLinkClass}>
                <FaList className="text-[13px]" /> Product List
              </NavLink>
              <NavLink to="/cpanel/products/grid" className={subLinkClass}>
                <FaThLarge className="text-[13px]" /> Grid View
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={() => toggleMenu('categories')} className={parentClass(isCategoriesActive)}>
          <div className="flex items-center gap-3">
            <FaTags className="text-lg" />
            {textVisible && <span>Categories</span>}
          </div>
          {textVisible && (
            <IoIosArrowDown className={`transition-transform ${openMenus.categories ? 'rotate-180' : ''}`} />
          )}
        </button>

        <AnimatePresence>
          {(sidebar || hovered) && openMenus.categories && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="pl-9 flex flex-col gap-1"
            >
              <NavLink to="/cpanel/categories/add" className={subLinkClass}>
                <FaPlusCircle className="text-[13px]" /> Add Category
              </NavLink>
              <NavLink to="/cpanel/categories/list" className={subLinkClass}>
                <FaList className="text-[13px]" /> Category List
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>

        <SectionTitle title="Sales" />
        <NavLink to="/cpanel/orders" className={mainLinkClass}>
          <FaShoppingBag className="text-lg" />
          {textVisible && <span>Orders</span>}
        </NavLink>
        <NavLink to="/cpanel/invoices" className={mainLinkClass}>
          <FaFileInvoice className="text-lg" />
          {textVisible && <span>Invoices</span>}
        </NavLink>
        <NavLink to="/cpanel/reports" className={mainLinkClass}>
          <FaChartLine className="text-lg" />
          {textVisible && <span>Reports</span>}
        </NavLink>

        <SectionTitle title="Users" />
        <button onClick={() => toggleMenu('employees')} className={parentClass(isEmployeesActive)}>
          <div className="flex items-center gap-3">
            <FaUserTie className="text-lg" />
            {textVisible && <span>Employees</span>}
          </div>
          {textVisible && (
            <IoIosArrowDown className={`transition-transform ${openMenus.employees ? 'rotate-180' : ''}`} />
          )}
        </button>

        <AnimatePresence>
          {(sidebar || hovered) && openMenus.employees && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="pl-9 flex flex-col gap-1"
            >
              <NavLink to="/cpanel/employees/add" className={subLinkClass}>
                <FaPlusCircle className="text-[13px]" /> Add Employee
              </NavLink>
              <NavLink to="/cpanel/employees/list" className={subLinkClass}>
                <FaList className="text-[13px]" /> Employee List
              </NavLink>
            </motion.div>
          )}
        </AnimatePresence>

        <NavLink to="/cpanel/customers" className={mainLinkClass}>
          <FaUsers className="text-lg" />
          {textVisible && <span>Customers</span>}
        </NavLink>

        <SectionTitle title="System" />
        <NavLink to="/cpanel/announcements" className={mainLinkClass}>
          <FaBullhorn className="text-lg" />
          {textVisible && <span>Announcements</span>}
        </NavLink>
        <NavLink to="/cpanel/integrations" className={mainLinkClass}>
          <FaCogs className="text-lg" />
          {textVisible && <span>Integrations</span>}
        </NavLink>
        <NavLink to="/cpanel/help" className={mainLinkClass}>
          <FaQuestionCircle className="text-lg" />
          {textVisible && <span>Help Center</span>}
        </NavLink>
      </nav>
    </motion.aside>
  );
}
