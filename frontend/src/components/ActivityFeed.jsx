function relativeTime(isoDate) {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function ActivityFeed({ purchasers }) {
  if (!purchasers || purchasers.length === 0) {
    return <p className="text-sm text-gray-400 italic">No purchases yet</p>;
  }

  return (
    <ul className="space-y-1">
      {purchasers.slice(0, 3).map((p, i) => (
        <li
          key={`${p.username}-${p.purchasedAt}`}
          className="flex justify-between text-sm text-gray-600 animate-[slideIn_0.3s_ease-out]"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <span className="font-medium">{p.username}</span>
          <span className="text-gray-400">{relativeTime(p.purchasedAt)}</span>
        </li>
      ))}
    </ul>
  );
}
