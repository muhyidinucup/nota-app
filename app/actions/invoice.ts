"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInvoice(formData: {
  storeName: string;
  customerName: string;
  paymentMethod: string;
  items: { itemName: string; quantity: number; unitPrice: number }[];
}) {
  try {
    // 1. Ambil atau buat toko default
    let store = await prisma.store.findFirst();
    if (!store) {
      store = await prisma.store.create({
        data: {
          name: formData.storeName || "Toko Serbaguna",
          address: "Jl. Contoh No. 123",
          phone: "081234567890",
        },
      });
    }

    // 2. Hitung total belanja
    const totalAmount = formData.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );

    // 3. Buat nomor nota unik otomatis (misal: INV-1725841234)
    const invoiceNumber = `INV-${Date.now()}`;

    // 4. Simpan transaksi beserta daftar barangnya ke Neon
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerName: formData.customerName,
        paymentMethod: formData.paymentMethod,
        totalAmount,
        storeId: store.id,
        items: {
          create: formData.items.map((item) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
        store: true,
      },
    });

    revalidatePath("/");
    return { success: true, data: newInvoice };
  } catch (error) {
    console.error("Gagal membuat nota:", error);
    return { success: false, error: "Gagal menyimpan nota." };
  }
}

export async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: true,
        store: true,
      },
    });
    return { success: true, data: invoices };
  } catch (error) {
    console.error("Gagal mengambil data nota:", error);
    return { success: false, error: "Gagal mengambil riwayat transaksi." };
  }
}
