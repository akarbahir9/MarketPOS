import React from 'react';
import { useLocation } from 'react-router-dom';
import { t } from '../../constants/translations';
import { navLinks } from './Sidebar';

const Header: React.FC = () => {
  const location = useLocation();
  const currentLink = navLinks.find(link => link.href === location.pathname);
  const pageTitle = currentLink ? currentLink.label : t.dashboard;

  return (
    <header className="flex-shrink-0 border-b border-border bg-surface">
      <div className="flex h-16 items-center px-4 md:px-6 lg:px-8">
        <h1 className="text-xl font-semibold text-text-primary">{pageTitle}</h1>
      </div>
    </header>
  );
};

export default Header;
