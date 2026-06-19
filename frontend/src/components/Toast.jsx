import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return <Toaster position="top-right" toastOptions={{ duration: 3500 }} />;
}
