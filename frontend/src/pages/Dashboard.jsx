import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api.js';
import { useDropStore } from '../store/useDropStore.js';
import { useSocket } from '../hooks/useSocket.js';
import DropCard from '../components/DropCard.jsx';
import Toast from '../components/Toast.jsx';

export default function Dashboard() {
  const drops = useDropStore((s) => s.drops);
  const setDrops = useDropStore((s) => s.setDrops);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');

  useSocket();

  useEffect(() => {
    api
      .get('/api/drops')
      .then(({ data }) => setDrops(data.drops))
      .catch(() => toast.error('Failed to load drops'));

    api
      .get('/api/users')
      .then(({ data }) => {
        setUsers(data.users);
        if (data.users.length > 0) setUserId(data.users[0].id);
      })
      .catch(() => toast.error('Failed to load users'));
  }, [setDrops]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Toast />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sneaker Drop</h1>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>
      </div>

      {drops.length === 0 ? (
        <p className="text-gray-400">No active drops.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {drops.map((drop) => (
            <DropCard key={drop.id} drop={drop} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}
