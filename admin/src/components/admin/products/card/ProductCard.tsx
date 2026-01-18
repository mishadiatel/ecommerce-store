import { useRef } from 'react';
import { toast } from 'react-toastify';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import Image from 'next/image';
import { generateFileUrl } from '@/lib/utils';
import {
  Dialog,
  DialogContent, DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import { FullProductWithTranslations } from '@/types/product';
import { deleteProduct } from '@/services/product';
import UpdateProductForm from '@/components/admin/products/forms/UpdateProductForm';

interface ProductCardProps {
  product: FullProductWithTranslations,
  updateProductList: () => void;
  categoriesList: Array<{ _id: string, text: string }>;
}

export default function ProductCard({product, updateProductList, categoriesList}: ProductCardProps) {
  const closeRemoveModalRef = useRef<HTMLButtonElement>(null);
  const onRemoveProductClick = () => {
    deleteProduct(product._id)
      .then(data => {
        toast.success('successfully removed');
        updateProductList()
      }).catch(error => {
      toast.error(error?.response?.data?.message || 'problem with removing, try again letter');
    }).finally(() => {
      closeRemoveModalRef.current?.click();
    })
  }

  return (
    <div className={'flex justify-between'}>
      <div>{product.slug}</div>
      <div>{product.order}</div>
      <div>{product.isVisible ? <AiFillEye /> : <AiFillEyeInvisible />}</div>

      <div>
        {product.cardImage && (
          <Image src={generateFileUrl(product.cardImage)} alt={product.slug} width={30} height={30} className={'w-[30px] max-h-[30px]'} />
        )}
      </div>

      <div className={'flex gap-5'}>
        <Dialog>
          <DialogTrigger>
            <div className={'cursor-pointer'}>
              <FaEdit />
            </div>
          </DialogTrigger>
          <DialogContent className={'max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            <UpdateProductForm updateProductsList={updateProductList} product={product} categoriesList={categoriesList} />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger>
            <div className={'cursor-pointer'}>
              <MdDelete />
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                You will delete product {product.slug}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" ref={closeRemoveModalRef}>Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={onRemoveProductClick}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

    </div>
  )
}