import { FullCategoryWithTranslation } from '@/types/category';
import { useRef } from 'react';
import { toast } from 'react-toastify';
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
  const closeRemoveModalRef = useRef<HTMLButtonElement>(null);
  const onRemoveCategoryClick = () => {
    deleteCategory(category._id)
      .then(data => {
        toast.success('successfully removed');
        updateCategoriesList();
      }).catch(error => {
      toast.error('problem with removing, try again letter');
    }).finally(() => {
      closeRemoveModalRef.current?.click();
    })
  }

  return (
    <div className={'flex justify-between'}>
      <div>{category.slug}</div>
      <div>{category.order}</div>
      <div>{category.isVisible ? <AiFillEye /> : <AiFillEyeInvisible />}</div>

      <div>
        {category.image && (
          <Image src={generateFileUrl(category.image)} alt={category.slug} width={30} height={30} className={'w-[30px] max-h-[30px]'} />
        )}
      </div>
      <div>
        {category.backgroundColor && (
          <div className={'w-[30px] h-[30px]'} style={{backgroundColor: category.backgroundColor}}></div>
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
            <UpdateCategoryForm updateCategoriesList={updateCategoriesList} category={category} />
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
                You will delete category {category.slug}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" ref={closeRemoveModalRef}>Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={onRemoveCategoryClick}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

    </div>
  )
}