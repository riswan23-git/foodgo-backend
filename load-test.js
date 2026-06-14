import http from 'k6/http';
import { sleep, check } from 'k6';

// Konfigurasi Load Test: 50 User selama 1 menit
export const options = {
  vus: 50,
  duration: '1m',
};

export default function () {
  // Kita tembak rute /api/menu karena ini yang paling sering diakses
  const res = http.get('http://localhost:5000/api/menu');
  
  check(res, {
    'status adalah 200 (sukses)': (r) => r.status === 200,
  });
  sleep(1); // Jeda 1 detik antar request agar seperti user asli
}