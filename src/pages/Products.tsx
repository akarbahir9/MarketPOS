import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { t } from '../constants/translations';
import { Database } from '../types/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProductForm from '../components/products/ProductForm';

type Product = Database['public']['Tables']['products']['Row'];

const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US').format(amount);

const Products: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { data: products, isLoading } = useQuery({ queryKey: ['products'], queryFn: fetchProducts });

    const deleteMutation = useMutation({
        mutationFn: async (productId: string) => {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            toast.success(t.productDeletedSuccess);
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
            setIsDeleteModalOpen(false);
            setSelectedProduct(null);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const openAddModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const openDeleteModal = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedProduct) {
            deleteMutation.mutate(selectedProduct.id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t.products}</h1>
                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t.addProduct}
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : !products || products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center rounded-lg border-2 border-dashed border-border">
                    <Package className="h-16 w-16 mb-4 text-secondary" />
                    <h2 className="text-xl font-semibold">{t.noProductsFound}</h2>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border bg-surface">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-secondary">{t.productName}</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-secondary">{t.productBarcode}</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-secondary">{t.productBuyPrice}</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-secondary">{t.productSellPrice}</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-secondary">{t.productStock}</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-secondary">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{product.barcode || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatCurrency(product.buy_price)} {t.iqd}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatCurrency(product.sell_price)} {t.iqd}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center gap-x-4">
                                            <button onClick={() => openEditModal(product)} className="text-blue-400 hover:text-blue-300"><Edit className="h-5 w-5" /></button>
                                            <button onClick={() => openDeleteModal(product)} className="text-red-500 hover:text-red-400"><Trash2 className="h-5 w-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedProduct ? t.editProduct : t.addProduct}>
                <ProductForm product={selectedProduct} onFinished={() => setIsModalOpen(false)} />
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t.deleteProduct}>
                <div>
                    <p className="text-text-secondary">{t.deleteProductConfirmation}</p>
                    <div className="mt-6 flex justify-end gap-4">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>{t.cancel}</Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} loading={deleteMutation.isPending}>{t.delete}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Products;
