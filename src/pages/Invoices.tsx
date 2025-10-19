import React from 'react';
import { t } from '../constants/translations';
import { FileText } from 'lucide-react';

const Invoices: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <FileText className="h-16 w-16 mb-4 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">{t.invoices}</h1>
        <p className="text-text-secondary mt-2">{t.pageUnderDevelopment}</p>
    </div>
  );
};

export default Invoices;
