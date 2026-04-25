import { FullCategoryWithTranslation } from '@/types/category';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { deleteCategory } from '@/services/category';
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
import UpdateCategoryForm from '@/components/admin/category/forms/UpdateCategoryForm';

interface CategoryCardProps {
  category: FullCategoryWithTranslation,
  updateCategoriesList: () => void;
}

export default function CategoryCard({category, updateCategoriesList}: CategoryCardProps) {
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');
  const closeRemoveModalRef = useRef<HTMLButtonElement>(null);
  const onRemoveCategoryClick = () => {
    deleteCategory(category._id)
      .then(data => {
        toast.success(t('toast.deleted'));
        updateCategoriesList();
      }).catch(error => {
      toast.error(error?.response?.data?.message || t('toast.deleteError'));
    }).finally(() => {
      closeRemoveModalRef.current?.click();
    })
  }

  return (
    <div className={'admin-card flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4'}>
      <div className={'flex items-center gap-3 min-w-0 flex-1'}>
        {category.image && (
          <Image
            src={generateFileUrl(category.image)}
            alt={category.slug}
            width={40}
            height={40}
            className={'h-10 w-10 rounded-md object-cover flex-shrink-0'}
          />
        )}
        {category.backgroundColor && (
          <div
            className={'h-8 w-8 rounded-md border border-border flex-shrink-0'}
            style={{ backgroundColor: category.backgroundColor }}
            aria-hidden
          />
        )}
        <div className={'min-w-0 flex-1'}>
          <div className={'font-medium truncate'}>{category.slug}</div>
          <div className={'text-xs text-muted-foreground'}>#{category.order}</div>
        </div>
        <div className={'flex-shrink-0'}>
          {category.isVisible ? (
            <AiFillEye className={'text-green-600'} />
          ) : (
            <AiFillEyeInvisible className={'text-red-600'} />
          )}
        </div>
      </div>

      <div className={'flex gap-4 sm:gap-5 justify-end sm:justify-start sm:ml-auto'}>
        <Dialog>
          <DialogTrigger>
            <div className={'cursor-pointer p-1'} aria-label={tCommon('edit')}>
              <FaEdit />
            </div>
          </DialogTrigger>
          <DialogContent className={'w-[calc(100%-1.5rem)] max-w-[1000px] sm:max-w-[1000px] max-h-screen overflow-y-auto'}>
            <UpdateCategoryForm updateCategoriesList={updateCategoriesList} category={category} />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger>
            <div className={'cursor-pointer p-1'} aria-label={tCommon('delete')}>
              <MdDelete />
            </div>
          </DialogTrigger>
          <DialogContent className={'w-[calc(100%-1.5rem)] max-w-md'}>
            <DialogHeader>
              <DialogTitle>{tCommon('confirmDeleteTitle')}</DialogTitle>
              <DialogDescription>
                {t('deleteDescription', { slug: category.slug })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className={'flex-col sm:flex-row gap-2'}>
              <DialogClose asChild>
                <Button variant="outline" ref={closeRemoveModalRef}>{tCommon('cancel')}</Button>
              </DialogClose>
              <Button type="button" onClick={onRemoveCategoryClick}>{tCommon('delete')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

    </div>
  )
}
