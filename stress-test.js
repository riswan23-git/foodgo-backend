import http from 'k6/http';
import { sleep, check } from 'k6';

// Konfigurasi Stress Test: Bertahap naik sampai 200 User
export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Pemanasan: Naik ke 50 user dalam 30 detik
    { duration: '1m', target: 200 },  // Puncak: Naik ke 200 user dan tahan selama 1 menit
    { duration: '30s', target: 0 },   // Pendinginan: Turun perlahan ke 0 user dalam 30 detik
  ],
};

export default function () {
  const res = http.get('http://localhost:5000/api/menu');
  
  check(res, {
    'status adalah 200 (sukses)': (r) => r.status === 200,
  });
  sleep(1);
}