import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { t } from '../../constants/translations';
import { Database } from '../../types/supabase';
import { toast } from 'sonner';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

const productSchema = z.object({
  name: z.string().min(1, t.requiredField),
  barcode: z.string().optional(),
  buy_price: z.coerce.number().min(0, t.invalidNumber),
  sell_price: z.coerce.number().min(0, t.invalidNumber),
  stock: z.coerce.number().int(t.invalidNumber),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  onFinished: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onFinished }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      barcode: product?.barcode || '',
      buy_price: product?.buy_price || 0,
      sell_price: product?.sell_price || 0,
      stock: product?.stock || 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (!user) throw new Error('User not authenticated');

      if (product) {
        // Update
        const updateData: ProductUpdate = { ...data, user_id: user.id };
        const { error } = await supabase.from('products').update(updateData).eq('id', product.id);
        if (error) throw error;
      } else {
        // Create
        const insertData: ProductInsert = { ...data, user_id: user.id };
        const { error } = await supabase.from('products').insert(insertData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(product ? t.productUpdatedSuccess : t.productCreatedSuccess);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      reset();
      onFinished();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">{t.productName}</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="barcode">{t.productBarcode}</Label>
        <Input id="barcode" {...register('barcode')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buy_price">{t.productBuyPrice}</Label>
          <Input id="buy_price" type="number" step="any" {...register('buy_price')} />
          {errors.buy_price && <p className="mt-1 text-xs text-red-500">{errors.buy_price.message}</p>}
        </div>
        <div>
          <Label htmlFor="sell_price">{t.productSellPrice}</Label>
          <Input id="sell_price" type="number" step="any" {...register('sell_price')} />
          {errors.sell_price && <p className="mt-1 text-xs text-red-500">{errors.sell_price.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="stock">{t.productStock}</Label>
        <Input id="stock" type="number" {...register('stock')} />
        {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>}
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onFinished}>
          {t.cancel}
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          {t.save}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
