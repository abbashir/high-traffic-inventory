export default function StockBadge({ stock, totalStock }) {
  const colorClass =
    stock <= 5
      ? 'bg-red-100 text-red-700 border-red-300'
      : stock <= 20
        ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
        : 'bg-green-100 text-green-700 border-green-300';

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${colorClass}`}>
      {stock} of {totalStock} left
    </span>
  );
}
