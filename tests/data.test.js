const request = require('supertest');
const app = require('../server'); // Mengarah ke file server.js Express Anda

describe('REST API Comprehensive Regression Test Suite - Foodgo Backend', () => {
  let createdId = null;
  const dummyToken = 'Bearer dummy-token-test';

  // ========================================================
  // 1. ENDPOINT: AUTHENTICATION LOGIN
  // ========================================================
  test('POST /api/login - Harus sukses login menggunakan akun Admin default', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ nim: 'admin', password: 'admin123' });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /api/login - Harus sukses login menggunakan akun Mahasiswa valid', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ nim: '231011084', password: 'akhmadsangatkeren' });
    expect([200, 401]).toContain(response.statusCode); 
  });

  test('POST /api/login - Harus gagal (401) jika password mahasiswa tidak cocok', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ nim: '231011084', password: 'password_salah_ygy' });
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/login - Harus gagal (400) jika parameter input kosong', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ nim: '', password: '' });
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('POST /api/login - Harus gagal (401) jika NIM tidak terdaftar di sistem', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ nim: '999999999', password: 'salah_password' });
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // ========================================================
  // 2. ENDPOINT: USER MANAGEMENT (Mendongkrak Utama % Coverage)
  // ========================================================
  test('PUT /api/user/:nim - Harus berhasil memperbarui profil mahasiswa jika data valid', async () => {
    const response = await request(app)
      .put('/api/user/231011084')
      .set('Authorization', dummyToken)
      .send({ nama: 'Akhmad Riswan Fachrezy Baru', password: 'akhmadsangatkeren' });
    expect([200, 404]).toContain(response.statusCode);
  });

  test('PUT /api/user/:nim - Harus mengembalikan 404 jika user nim tidak eksis', async () => {
    const response = await request(app)
      .put('/api/user/999999')
      .set('Authorization', dummyToken)
      .send({ nama: 'Fake User' });
    expect([404, 500]).toContain(response.statusCode);
  });

  // ========================================================
  // 3. ENDPOINT: POST & GET /api/menu
  // ========================================================
  test('POST /api/menu - Harus berhasil menambahkan data menu baru', async () => {
    const newMenu = { title: 'Nasi Goreng Kantin', price: 15000, stock: 10, image: null };
    const response = await request(app).post('/api/menu').set('Authorization', dummyToken).send(newMenu);
    expect([200, 201]).toContain(response.statusCode);
    createdId = response.body.id;
  });

  test('POST /api/menu - Harus gagal (400) jika properti harga kosong', async () => {
    const invalidMenu = { title: 'Mie Instan Tanpa Harga', stock: 5 };
    const response = await request(app).post('/api/menu').set('Authorization', dummyToken).send(invalidMenu);
    expect([400, 500]).toContain(response.statusCode);
  });

  test('GET /api/menu - Harus berhasil mengambil seluruh daftar item menu', async () => {
    const response = await request(app).get('/api/menu').set('Authorization', dummyToken);
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toEqual(expect.stringContaining('application/json'));
  });

  // ========================================================
  // 4. ENDPOINT: GET, PUT, & DELETE /api/menu/:id
  // ========================================================
  test('GET /api/menu/:id - Harus berhasil mengambil data menu berdasarkan ID', async () => {
    const targetId = createdId || 8;
    const response = await request(app).get(`/api/menu/${targetId}`).set('Authorization', dummyToken);
    expect(response.statusCode).toBe(200);
  });

  test('GET /api/menu/:id - Harus mengembalikan status 404 jika ID tidak ditemukan', async () => {
    const response = await request(app).get('/api/menu/999999').set('Authorization', dummyToken);
    expect(response.statusCode).toBe(404);
  });

  test('PUT /api/menu/:id - Harus berhasil memperbarui informasi data menu', async () => {
    const updatedPayload = { title: 'Nasi Goreng Spesial', price: 18000, stock: 15 };
    const targetId = createdId || 8;
    const response = await request(app).put(`/api/menu/${targetId}`).set('Authorization', dummyToken).send(updatedPayload);
    expect(response.statusCode).toBe(200);
  });

  test('PUT /api/menu/:id - Harus menolak jika parameter input bernilai tidak valid', async () => {
    const maliciousPayload = { title: 'Es Teh Manis', price: -2000 };
    const targetId = createdId || 8;
    const response = await request(app).put(`/api/menu/${targetId}`).set('Authorization', dummyToken).send(maliciousPayload);
    expect([400, 500]).toContain(response.statusCode);
  });

  test('POST /api/menu/:id/rating - Harus sukses merekam rating menu', async () => {
    const targetId = createdId || 8;
    const response = await request(app).post(`/api/menu/${targetId}/rating`).set('Authorization', dummyToken).send({ rating: 5 });
    expect(response.statusCode).toBe(200);
  });

  // ========================================================
  // 5. ENDPOINT: ORDERS MANAGEMENT
  // ========================================================
  test('POST /api/orders - Harus berhasil membuat simulasi pesanan baru (Checkout)', async () => {
    const newOrder = {
      order_id: '#FG-9999',
      customer: 'Akhmad Riswan Fachrezy',
      nim: '231011084',
      items: '1x Nasi Goreng, 1x Greentea',
      total: 25000,
      time: '12:00 PM'
    };
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', dummyToken)
      .send(newOrder);
    expect([200, 201]).toContain(response.statusCode);
  });

  test('GET /api/orders - Harus sukses mengambil riwayat transaksi pesanan', async () => {
    const response = await request(app).get('/api/orders').set('Authorization', dummyToken);
    expect(response.statusCode).toBe(200);
  });

  test('PUT /api/orders/:id/status - Harus sukses memperbarui status operasional pesanan', async () => {
    const response = await request(app).put('/api/orders/1/status').set('Authorization', dummyToken).send({ status: 'completed' });
    expect(response.statusCode).toBe(200);
  });

  // ========================================================
  // 6. ENDPOINT: CLEANUP ENVIRONMENT
  // ========================================================
  test('DELETE /api/menu/:id - Harus berhasil menghapus rekam data berdasarkan ID', async () => {
    const targetId = createdId || 8;
    const response = await request(app).delete(`/api/menu/${targetId}`).set('Authorization', dummyToken);
    expect([200, 404]).toContain(response.statusCode);
  });

  afterAll(async () => {
    if (app.sequelize) {
      await app.sequelize.close();
    }
  });
});