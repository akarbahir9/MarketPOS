import React from 'react';
import { t } from '../constants/translations';
import { Truck } from 'lucide-react';

const Suppliers: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Truck className="h-16 w-16 mb-4 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">{t.suppliers}</h1>
        <p className="text-text-secondary mt-2">{t.pageUnderDevelopment}</p>
    </div>
  );
};

export default Suppliers;
