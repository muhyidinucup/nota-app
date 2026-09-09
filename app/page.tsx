"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { createInvoice } from "@/app/actions/invoice";

export default function CashierPage() {
  const [storeName, setStoreName] = useState("Toko Saya");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [items, setItems] = useState([
    { itemName: "", quantity: 1, unitPrice: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<any>(null);

  const receiptRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);

    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      // Fitur Web Share API untuk perangkat mobile (langsung kirim via WA / simpan ke Galeri)
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${invoiceResult.invoiceNumber}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Nota ${invoiceResult.invoiceNumber}`,
          text: `Nota transaksi dari ${invoiceResult.store.name}`,
        });
      } else {
        const link = document.createElement("a");
        link.download = `${invoiceResult.invoiceNumber}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Gagal membuat gambar nota:", err);
      alert("Gagal menyimpan gambar nota.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-4 sm:p-6 text-neutral-900">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 print:block">
        {/* Form Kasir */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-neutral-300 print:hidden text-neutral-900">
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
                <option value="CASH">Cash / Tunai</option>
                <option value="QRIS">QRIS</option>
                <option value="TRANSFER">Transfer Bank</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-neutral-800">Daftar Barang</span>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs bg-neutral-900 hover:bg-black text-white font-medium px-2.5 py-1 rounded transition"
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

        {/* Kolom Lembar Nota */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-neutral-300 print:border-none print:shadow-none flex flex-col justify-between">
          {invoiceResult ? (
            <div>
              {/* Area Struk yang Dikonversi ke Gambar */}
              <div
                ref={receiptRef}
                className="bg-white p-4 font-mono text-neutral-900 border border-neutral-200 rounded-lg"
              >
                <div className="text-center border-b border-neutral-300 pb-3 mb-3">
                  <h2 className="font-bold text-base text-neutral-900">{invoiceResult.store.name}</h2>
                  <p className="text-xs text-neutral-600">{invoiceResult.store.address}</p>
                  <p className="text-xs text-neutral-600">{invoiceResult.store.phone}</p>
                </div>

                <div className="text-xs space-y-1 mb-3 text-neutral-700">
                  <div className="flex justify-between">
                    <span>No: {invoiceResult.invoiceNumber}</span>
                    <span>{new Date(invoiceResult.createdAt).toLocaleDateString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pelanggan: {invoiceResult.customerName || "-"}</span>
                    <span>Bayar: {invoiceResult.paymentMethod}</span>
                  </div>
                </div>

                <table className="w-full text-xs mb-3 text-neutral-900">
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
                      <tr key={item.id} className="border-b border-neutral-100">
                        <td className="py-1">{item.itemName}</td>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">{item.unitPrice.toLocaleString("id-ID")}</td>
                        <td className="py-1 text-right">{item.subtotal.toLocaleString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-between font-bold text-sm border-t border-neutral-300 pt-2 mb-3 text-neutral-900">
                  <span>TOTAL</span>
                  <span>Rp {invoiceResult.totalAmount.toLocaleString("id-ID")}</span>
                </div>

                <div className="text-center text-xs text-neutral-500">
                  Terima kasih atas kunjungan Anda!
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="mt-4 space-y-2 print:hidden">
                <button
                  onClick={handleDownloadImage}
                  disabled={downloading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  {downloading ? "Memproses..." : "Simpan Gambar / Kirim WA"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full bg-neutral-900 hover:bg-black text-white py-2 rounded-lg text-xs font-medium transition"
                >
                  Cetak Nota (Print / PDF)
                </button>
              </div>
            </div>
          ) : (
            <div className="h-48 md:h-full flex items-center justify-center text-neutral-500 text-xs text-center font-mono">
              Nota akan otomatis muncul di sini setelah Anda menekan tombol "Simpan & Buat Nota".
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
