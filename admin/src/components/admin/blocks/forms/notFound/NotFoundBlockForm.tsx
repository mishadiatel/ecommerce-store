'use client';
import { useFormContext } from 'react-hook-form';
import InputGroup from '@/components/admin/ui/inputGroup';
import FileInput from '@/components/admin/ui/fileInput';
import EditorInput from '@/components/admin/ui/editorInput';

export default function NotFoundBlockForm() {
  const { control } = useFormContext();
  return (
    <div className="flex flex-col gap-4 border p-4 rounded-xl bg-muted">
      <EditorInput control={control} name={'blockData.text'} label={'not found text'} placeholder={'not found text'}/>
      <InputGroup control={control} name={'blockData.buttonText'} label={'button text'} placeholder={'button text'}/>
      <FileInput control={control} name={'blockData.backgroundImage'} label={'backgroundImage'} placeholder={'backgroundImage'}/>
    </div>
  );
}
