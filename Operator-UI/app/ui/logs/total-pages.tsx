import { fetchTotalPages } from '@/app/lib/druid/logs';
import Pagination from '@/app/ui/shared/pagination';

export default async function TotalPages({ query }: { query: string }) {
  const totalPages = await fetchTotalPages(query); // Fetch total pages on the server

  return (
      <Pagination totalPages={totalPages} />
  );
}