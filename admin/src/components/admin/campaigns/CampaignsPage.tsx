'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { Eye, Send, Trash2, Mail, Loader2 } from 'lucide-react';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import { Button } from '@/components/admin/shadcnuiComponents/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/admin/shadcnuiComponents/dialog';
import { DialogClose } from '@radix-ui/react-dialog';
import PageControl from '@/components/admin/ui/pageControl';
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  getCampaigns,
  sendCampaign,
  testSendCampaign,
  updateCampaign,
} from '@/services/campaigns';
import { Campaign, CampaignStatus } from '@/types/campaign';

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 ring-gray-500/30',
  sending:
    'bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-blue-500/30',
  sent: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30',
  failed: 'bg-red-500/15 text-red-700 dark:text-red-300 ring-red-500/30',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function CampaignsPage() {
  const t = useTranslations('campaignsPage');
  const tCommon = useTranslations('common');

  // ── Форма/редактор ─────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // ── Історія ─────────────────────────────────────────────────
  const [history, setHistory] = useState<Campaign[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | undefined>();
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>();
  const limit = 10;

  const fetchHistory = () => {
    getCampaigns({ page: currentPage, limit })
      .then((res) => {
        setHistory(res?.data ?? []);
        setTotalPages(res?.totalPages);
        setTotalDocuments(res?.totalDocuments);
      })
      .catch(() => toast.error(t('toast.loadError')));
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const resetForm = () => {
    setEditingId(null);
    setSubject('');
    setHtml('');
    setShowPreview(false);
  };

  const handleLoadCampaign = async (id: string) => {
    try {
      const c = await getCampaign(id);
      if (!c) return;
      setEditingId(c._id);
      setSubject(c.subject);
      setHtml(c.html);
      setShowPreview(false);
    } catch {
      toast.error(t('toast.loadError'));
    }
  };

  const handleSaveDraft = async () => {
    if (!subject.trim() || !html.trim()) {
      toast.error(t('toast.emptyFieldsError'));
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await updateCampaign(editingId, { subject, html });
        toast.success(t('toast.updated'));
      } else {
        const created = await createCampaign({ subject, html });
        if (created) setEditingId(created._id);
        toast.success(t('toast.created'));
      }
      fetchHistory();
    } catch {
      toast.error(t('toast.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const ensureSaved = async (): Promise<string | null> => {
    if (editingId) return editingId;
    if (!subject.trim() || !html.trim()) {
      toast.error(t('toast.emptyFieldsError'));
      return null;
    }
    const created = await createCampaign({ subject, html });
    if (!created) return null;
    setEditingId(created._id);
    fetchHistory();
    return created._id;
  };

  const handleTestSend = async () => {
    if (!testEmail.trim()) {
      toast.error(t('toast.testEmailRequired'));
      return;
    }
    setIsTesting(true);
    try {
      const id = await ensureSaved();
      if (!id) return;
      await testSendCampaign(id, testEmail.trim());
      toast.success(t('toast.testSent', { email: testEmail.trim() }));
    } catch {
      toast.error(t('toast.testError'));
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendToAll = async () => {
    setIsSending(true);
    try {
      const id = await ensureSaved();
      if (!id) return;
      const res = await sendCampaign(id);
      toast.success(
        t('toast.sendStarted', { count: res.recipientsCount }),
      );
      resetForm();
      fetchHistory();
    } catch (err) {
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((err as any)?.response?.data?.message as string | undefined) ??
        t('toast.sendError');
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaign(id);
      toast.success(t('toast.deleted'));
      if (editingId === id) resetForm();
      fetchHistory();
    } catch {
      toast.error(t('toast.deleteError'));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Editor ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-semibold text-base">
            {editingId ? t('editingTitle') : t('newTitle')}
          </h3>
          {editingId && (
            <Button variant="outline" size="sm" onClick={resetForm}>
              {t('newCampaign')}
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{t('subjectLabel')}</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t('subjectPlaceholder')}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t('htmlLabel')}{' '}
            <span className="text-xs text-muted-foreground font-normal">
              {t('htmlHint')}
            </span>
          </label>
          <textarea
            className="w-full min-h-[280px] font-mono text-xs rounded-md border border-input bg-transparent px-3 py-2 shadow-xs"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<h1>Привіт!</h1>"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={!html.trim()}
          >
            <Eye className="w-4 h-4 mr-1" />
            {t('previewButton')}
          </Button>

          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? tCommon('saving') : t('saveDraftButton')}
          </Button>
        </div>

        {/* Test send */}
        <div className="mt-2 border-t border-border pt-4 flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t('testSendLabel')}
          </label>
          <div className="flex gap-2 flex-wrap">
            <Input
              type="email"
              placeholder="admin@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <Button variant="outline" onClick={handleTestSend} disabled={isTesting}>
              {isTesting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-1" />
              )}
              {t('testSendButton')}
            </Button>
          </div>
        </div>

        {/* Send to all */}
        <div className="mt-2 border-t border-border pt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full sm:w-auto"
                disabled={!subject.trim() || !html.trim() || isSending}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-1" />
                )}
                {t('sendButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-1.5rem)] max-w-md">
              <DialogHeader>
                <DialogTitle>{t('confirmSendTitle')}</DialogTitle>
                <DialogDescription>
                  {t('confirmSendDescription')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <DialogClose asChild>
                  <Button variant="outline">{tCommon('cancel')}</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleSendToAll}>
                    {t('sendButton')}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── History ──────────────────────────────────────────── */}
      <div>
        <h3 className="font-semibold text-base mb-3">{t('historyTitle')}</h3>
        {history.length === 0 ? (
          <div className="py-6 rounded-xl border border-border bg-card text-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((c) => (
              <div
                key={c._id}
                className="admin-card p-3 flex items-center gap-3 flex-wrap"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{c.subject}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs ring-1 ${STATUS_COLORS[c.status]}`}
                    >
                      {t(`status.${c.status}` as never)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.status === 'sent' || c.status === 'sending'
                      ? t('progressText', {
                          sent: c.sentCount,
                          total: c.recipientsCount,
                          failed: c.failedCount,
                        })
                      : t('createdAt', { date: formatDate(c.createdAt) })}
                    {c.sentAt ? ` · ${formatDate(c.sentAt)}` : ''}
                  </div>
                  {c.lastError && (
                    <div className="text-xs text-red-500 mt-1 truncate">
                      {c.lastError}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadCampaign(c._id)}
                    disabled={c.status === 'sending'}
                  >
                    {c.status === 'draft' ? t('edit') : t('viewOrClone')}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={c.status === 'sending'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[calc(100%-1.5rem)] max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {tCommon('confirmDeleteTitle')}
                        </DialogTitle>
                        <DialogDescription>
                          {t('deleteDescription', { subject: c.subject })}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex-col sm:flex-row gap-2">
                        <DialogClose asChild>
                          <Button variant="outline">{tCommon('cancel')}</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button onClick={() => handleDelete(c._id)}>
                            {tCommon('delete')}
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
            {totalPages && totalDocuments && totalPages > 1 && (
              <PageControl
                currentPage={currentPage}
                limit={limit}
                totalDocuments={totalDocuments}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                documentsLength={history.length}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Preview modal ────────────────────────────────────── */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-[900px] max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('previewTitle')}</DialogTitle>
            <DialogDescription>
              {t('previewDescription', { subject: subject || '—' })}
            </DialogDescription>
          </DialogHeader>
          <div className="border border-border rounded-md overflow-hidden bg-white">
            <iframe
              title="preview"
              srcDoc={html}
              className="w-full min-h-[500px] bg-white"
              sandbox=""
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
