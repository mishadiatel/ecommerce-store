import { useEffect, useRef, useState } from 'react';

import { toast } from 'react-toastify';
import { Input } from '@/components/admin/shadcnuiComponents/input';
import PageControl from '@/components/admin/ui/pageControl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/shadcnuiComponents/select';

import { Order } from '@/types/order';
import { getAdminOrders } from '@/services/order';
import OrderCard from '@/components/admin/orders/card/OrderCard';

export default function OrdersList() {
  const isFirstRender = useRef(true);
  const [ordersState, setOrdersState] = useState<Order[] | undefined>([]);
  const [searchWord, setSearchWord] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);
  const [totalDocuments, setTotalDocuments] = useState<number | undefined>(undefined);
  const [limit] = useState<number>(25);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  const updateOrdersList = () => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const query: Record<string, string | number> = {
      page: currentPage,
      limit: limit,
      sortOrder,
    };

    if (searchWord.trim()) {
      query.search = searchWord.trim();
    }

    if (selectedStatus && selectedStatus !== 'all') {
      query.status = selectedStatus;
    }

    if (selectedPaymentStatus && selectedPaymentStatus !== 'all') {
      query.paymentStatus = selectedPaymentStatus;
    }

    getAdminOrders(query)
      .then((pagesResult) => {
        setOrdersState(pagesResult?.data);
        setTotalPages(pagesResult?.totalPages);
        setTotalDocuments(pagesResult?.totalDocuments);
      })
      .catch(() => {
        toast.error('error loading orders.');
      });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedPaymentStatus, sortOrder]);

  useEffect(() => {
    updateOrdersList();
  }, [currentPage, selectedStatus, selectedPaymentStatus, sortOrder]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateOrdersList();
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchWord]);

  return (
    <>
      <div className={'flex gap-4 items-center flex-wrap'}>
        <Input
          type={'text'}
          placeholder={'Search order, email, phone, name...'}
          className={'w-[280px] flex-shrink max-w-full max-[500px]:w-full'}
          value={searchWord}
          onChange={(e) => setSearchWord(e.target.value)}
        />

        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
          <SelectTrigger className={'w-[180px]'}>
            <SelectValue placeholder={'Status'} />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={'all'}>All statuses</SelectItem>
            <SelectItem value={'pending'}>Pending</SelectItem>
            <SelectItem value={'processing'}>Processing</SelectItem>
            <SelectItem value={'shipped'}>Shipped</SelectItem>
            <SelectItem value={'delivered'}>Delivered</SelectItem>
            <SelectItem value={'completed'}>Completed</SelectItem>
            <SelectItem value={'cancelled'}>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedPaymentStatus}
          onValueChange={(value) => setSelectedPaymentStatus(value)}
        >
          <SelectTrigger className={'w-[180px]'}>
            <SelectValue placeholder={'Payment status'} />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={'all'}>All payments</SelectItem>
            <SelectItem value={'pending'}>Pending</SelectItem>
            <SelectItem value={'paid'}>Paid</SelectItem>
            <SelectItem value={'failed'}>Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
          <SelectTrigger className={'w-[180px]'}>
            <SelectValue placeholder={'Sort'} />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value={'desc'}>Newest first</SelectItem>
            <SelectItem value={'asc'}>Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={'flex flex-col gap-5'}>
        {ordersState && ordersState.length > 0 ? (
          <>
            {ordersState.map((order) => (
              <OrderCard key={order._id} order={order} updateOrdersList={updateOrdersList} />
            ))}
            {totalPages && totalDocuments && (
              <PageControl
                currentPage={currentPage}
                limit={limit}
                totalDocuments={totalDocuments}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                documentsLength={ordersState.length}
              />
            )}
          </>
        ) : (
          <div>no orders found</div>
        )}
      </div>
    </>
  );
}
