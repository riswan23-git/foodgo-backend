const calculateTotal = (price, quantity) => price * quantity;

test('Harus menghitung total harga dengan benar', () => {
    expect(calculateTotal(10000, 2)).toBe(20000);
});