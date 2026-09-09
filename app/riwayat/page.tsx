"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getInvoices } from "@/app/actions/invoice";

export default function RiwayatPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const res = await getInvoices();
      if (res.success && res.data) {
        setInvoices(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-100 p-6 text-neutral-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Riwayat Transaksi</h1>
            <p className="text-xs text-neutral-600 mt-1">
              Daftar seluruh nota penjualan yang tersimpan di Neon
            </p>
          </div>
          <Link
            href="/"
            className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            ← Kembali ke Kasir
          </Link>
        </div>

        {/* Tabel Riwayat */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-300 overflow-hidden print:hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-neutral-500">
              Memuat data transaksi...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500">
              Belum ada transaksi yang tersimpan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">No. Nota</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Metode</th>
                    <th className="py-3 px-4">Jumlah Item</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3 px-4 font-mono font-medium text-xs">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 text-xs">
                        {new Date(inv.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {inv.customerName || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block bg-neutral-100 text-neutral-700 text-xs px-2 py-0.5 rounded border border-neutral-300">
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 text-xs">
                        {inv.items.length} Barang
                      </td>
                      <td className="py-3 px-4 font-bold text-right">
                        Rp {inv.totalAmount.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium transition"
                        >
                          Lihat Nota
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Pop-up Tampilan Nota & Cetak */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-transparent">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-neutral-300 font-mono text-neutral-900 relative print:border-none print:shadow-none print:w-full print:max-w-none">
              {/* Tombol Tutup (Sembunyi saat cetak) */}
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-sm font-bold font-sans print:hidden"
              >
                ✕ Tutup
              </button>

              {/* Header Toko */}
              <div className="text-center border-b border-neutral-300 pb-4 mb-4 mt-2">
                <h2 className="font-bold text-lg text-neutral-900">{selectedInvoice.store.name}</h2>
                <p className="text-xs text-neutral-600">{selectedInvoice.store.address}</p>
                <p className="text-xs text-neutral-600">{selectedInvoice.store.phone}</p>
              </div>

              {/* Rincian Nota */}
              <div className="text-xs space-y-1 mb-4 text-neutral-700">
                <div className="flex justify-between">
                  <span>No: {selectedInvoice.invoiceNumber}</span>
                  <span>{new Date(selectedInvoice.createdAt).toLocaleDateString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan: {selectedInvoice.customerName || "-"}</span>
                  <span>Bayar: {selectedInvoice.paymentMethod}</span>
                </div>
              </div>

              {/* Tabel Barang */}
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
                  {selectedInvoice.items.map((item: any) => (
                    <tr key={item.id} className="border-b border-neutral-200">
                      <td className="py-1">{item.itemName}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">{item.unitPrice.toLocaleString("id-ID")}</td>
                      <td className="py-1 text-right">{item.subtotal.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Belanja */}
              <div className="flex justify-between font-bold text-sm border-t border-neutral-300 pt-2 mb-6 text-neutral-900">
                <span>TOTAL</span>
                <span>Rp {selectedInvoice.totalAmount.toLocaleString("id-ID")}</span>
              </div>

              <div className="text-center text-xs text-neutral-500 mb-6">
                Terima kasih atas kunjungan Anda!
              </div>

              {/* Tombol Cetak Nota */}
              <div className="flex gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-neutral-900 hover:bg-black text-white py-2 rounded text-sm font-sans font-medium transition"
                >
                  Cetak Nota Ulang
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 border border-neutral-300 rounded text-sm font-sans font-medium text-neutral-700 hover:bg-neutral-100 transition"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
