"use client";

import { useState } from "react";
import Link from "next/link";
import { createInvoice } from "@/app/actions/invoice";

export default function CashierPage() {
  const [storeName, setStoreName] = useState("Toko Saya");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [items, setItems] = useState([
    { itemName: "", quantity: 1, unitPrice: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<any>(null);

  const addItemRow = () => {
    setItems([...items, { itemName: "", quantity: 1, unitPrice: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const grandTotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

  const handleSave = async () => {
    setLoading(true);
    const res = await createInvoice({
      storeName,
      customerName,
      paymentMethod,
      items: items.map((i) => ({
        itemName: i.itemName,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    });

    if (res.success) {
      setInvoiceResult(res.data);
    } else {
      alert("Gagal membuat nota");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-6 text-neutral-900">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 print:block">
        {/* Form Kasir (Sembunyi saat cetak) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-300 print:hidden text-neutral-900">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-neutral-900">Aplikasi Nota Penjualan</h1>
            <Link
              href="/riwayat"
              className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 px-3 py-1.5 rounded-lg font-medium transition"
            >
              Lihat Riwayat →
            </Link>
          </div>

          <div className="space-y-3 mb-6">
            <div>
              <label className="text-xs font-semibold text-neutral-700">Nama Toko</label>
              <input
                type="text"
                className="w-full border border-neutral-400 bg-white text-neutral-900 placeholder:text-neutral-400 rounded-lg p-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Nama Pelanggan</label>
              <input
                type="text"
                placeholder="Misal: Budi"
                className="w-full border border-neutral-400 bg-white text-neutral-900 placeholder:text-neutral-400 rounded-lg p-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Metode Bayar</label>
              <select
                className="w-full border border-neutral-400 bg-white text-neutral-900 rounded-lg p-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="CASH" className="text-neutral-900">Cash / Tunai</option>
                <option value="QRIS" className="text-neutral-900">QRIS</option>
                <option value="TRANSFER" className="text-neutral-900">Transfer Bank</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-neutral-800">Daftar Barang</span>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs bg-neutral-900 hover:bg-neutral-800 text-white font-medium px-2.5 py-1 rounded"
              >
                + Tambah Item
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Nama Barang"
                  className="flex-1 border border-neutral-400 bg-white text-neutral-900 placeholder:text-neutral-400 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={item.itemName}
                  onChange={(e) => updateItem(idx, "itemName", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  className="w-16 border border-neutral-400 bg-white text-neutral-900 placeholder:text-neutral-400 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-center"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Harga"
                  className="w-28 border border-neutral-400 bg-white text-neutral-900 placeholder:text-neutral-400 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-right"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-red-500 hover:text-red-700 font-bold px-1.5 text-base"
                  title="Hapus baris"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-200 flex justify-between items-center mb-4 font-bold text-neutral-900">
            <span>Total</span>
            <span className="text-lg">Rp {grandTotal.toLocaleString("id-ID")}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-sm"
          >
            {loading ? "Menyimpan..." : "Simpan & Buat Nota"}
          </button>
        </div>

        {/* Lembar Nota / Tampilan Cetak */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-300 print:border-none print:shadow-none font-mono text-neutral-900">
          {invoiceResult ? (
            <div>
              <div className="text-center border-b border-neutral-300 pb-4 mb-4">
                <h2 className="font-bold text-lg text-neutral-900">{invoiceResult.store.name}</h2>
                <p className="text-xs text-neutral-600">{invoiceResult.store.address}</p>
                <p className="text-xs text-neutral-600">{invoiceResult.store.phone}</p>
              </div>

              <div className="text-xs space-y-1 mb-4 text-neutral-700">
                <div className="flex justify-between">
                  <span>No: {invoiceResult.invoiceNumber}</span>
                  <span>{new Date(invoiceResult.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan: {invoiceResult.customerName || "-"}</span>
                  <span>Bayar: {invoiceResult.paymentMethod}</span>
                </div>
              </div>

              <table className="w-full text-xs mb-4 text-neutral-900">
                <thead>
                  <tr className="border-b border-neutral-300 text-left font-bold">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Harga</th>
                    <th className="py-1 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceResult.items.map((item: any) => (
                    <tr key={item.id} className="border-b border-neutral-200">
                      <td className="py-1">{item.itemName}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">{item.unitPrice.toLocaleString("id-ID")}</td>
                      <td className="py-1 text-right">{item.subtotal.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between font-bold text-sm border-t border-neutral-300 pt-2 mb-6 text-neutral-900">
                <span>TOTAL</span>
                <span>Rp {invoiceResult.totalAmount.toLocaleString("id-ID")}</span>
              </div>

              <div className="text-center text-xs text-neutral-500 mb-6">
                Terima kasih atas kunjungan Anda!
              </div>

              <button
                onClick={() => window.print()}
                className="w-full bg-neutral-900 hover:bg-black text-white py-2 rounded text-sm font-sans font-medium print:hidden"
              >
                Cetak Nota (Print / PDF)
              </button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-500 text-xs text-center">
              Nota akan otomatis muncul di sini setelah Anda menekan tombol "Simpan & Buat Nota".
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
