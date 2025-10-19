import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { t } from '../constants/translations';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { DollarSign, Users, Package, TrendingDown, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const fetchStats = async (userId: string | undefined) => {
    if (!userId) return null;

    const { data: sales, error: salesError } = await supabase.rpc('get_total_sales', { p_user_id: userId });
    const { data: expenses, error: expensesError } = await supabase.rpc('get_total_expenses', { p_user_id: userId });
    const { data: customers, error: customersError } = await supabase.rpc('get_total_customers', { p_user_id: userId });
    const { data: products, error: productsError } = await supabase.rpc('get_total_products', { p_user_id: userId });

    if (salesError || expensesError || customersError || productsError) {
        console.error('Error fetching stats:', salesError, expensesError, customersError, productsError);
        throw new Error('Failed to fetch dashboard stats');
    }

    return {
        totalSales: sales,
        totalExpenses: expenses,
        totalCustomers: customers,
        totalProducts: products,
    };
};

const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return `0 ${t.iqd}`;
    return `${new Intl.NumberFormat('en-US').format(amount)} ${t.iqd}`;
};

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['dashboardStats', user?.id],
        queryFn: () => fetchStats(user?.id),
        enabled: !!user,
    });

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (isError) {
        return <div className="text-red-500">Error loading dashboard data.</div>;
    }

    const stats = [
        { title: t.totalSales, value: formatCurrency(data?.totalSales), icon: DollarSign, color: 'text-green-500' },
        { title: t.totalExpenses, value: formatCurrency(data?.totalExpenses), icon: TrendingDown, color: 'text-red-500' },
        { title: t.totalCustomers, value: data?.totalCustomers ?? 0, icon: Users, color: 'text-blue-500' },
        { title: t.totalProducts, value: data?.totalProducts ?? 0, icon: Package, color: 'text-yellow-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle>{stat.title}</CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>{stat.value}</CardContent>
                    </Card>
                ))}
            </div>
            {/* You can add recent invoices/expenses tables here later */}
        </div>
    );
};

export default Dashboard;
