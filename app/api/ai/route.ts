import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feature, payload, aiEnabled } = body;

    // If AI is disabled by user settings, immediately return rule-based fallback
    if (aiEnabled === false) {
      const fallbackResult = getRuleBasedFallback(feature, payload);
      return NextResponse.json({
        success: true,
        source: 'rule_fallback',
        badge: 'AI tidak aktif (Mode Aturan)',
        result: fallbackResult
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback if no API key is configured
      const fallbackResult = getRuleBasedFallback(feature, payload);
      return NextResponse.json({
        success: true,
        source: 'rule_fallback',
        badge: 'Mode Aturan (Kunci AI Belum Diatur)',
        result: fallbackResult
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    if (feature === 'saran_kulakan') {
      const prompt = `Anda adalah asisten manajer inventaris warung sembako / toko kelontong di Indonesia.
Analisis data stok dan penjualan berikut, lalu buatkan daftar rekomendasi kulakan/restock belanja mingguan yang cerdas, hemat modal, dan memprioritaskan barang fast-moving dan yang stoknya di bawah batas minimal.

Data Produk Warung:
${JSON.stringify(payload.products, null, 2)}

Format jawaban yang diinginkan (Bahasa Indonesia santun, ringkas, terstruktur untuk pedagang warung):
1. Ringkasan Singkat (1-2 kalimat kondisi stok saat ini).
2. Daftar Prioritas Kulakan (Nama Produk, Jumlah Unit yg perlu dibeli, Estimasi Modal Kulakan, dan Alasan Singkat).
3. Tips Pembelian Grosir (produk mana yang sebaiknya dibeli per dus/slop/karung agar dapat harga lebih murah).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return NextResponse.json({
        success: true,
        source: 'ai',
        badge: 'Dibantu AI Gemini',
        result: response.text || getRuleBasedFallback(feature, payload)
      });
    } 
    
    if (feature === 'pesan_tagih_halus') {
      const { customerName, amount, daysOverdue, notes } = payload;
      const prompt = `Anda adalah pemilik warung sembako ramah di Indonesia yang ingin mengirim pesan WhatsApp penagihan kasbon (utang belanjaan) kepada tetangga / langganan.
Pesan harus SANGAT HALUS, ramah, kekeluargaan, tidak menyinggung perasaan, sopan, namun jelas nominalnya.

Data Pelanggan:
- Nama: ${customerName}
- Total Kasbon: Rp ${Number(amount).toLocaleString('id-ID')}
- Status: ${daysOverdue > 0 ? `Sudah lewat jatuh tempo ${daysOverdue} hari` : 'Mendekati jatuh tempo'}
- Catatan: ${notes || 'Langganan setia'}

Tuliskan SATU draf pesan WhatsApp lengkap dengan salam hangat khas Indonesia, pengingat santun, dan ucapan terima kasih. Jangan gunakan kata-kata kasar atau mengancam.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return NextResponse.json({
        success: true,
        source: 'ai',
        badge: 'Dibantu AI Gemini',
        result: response.text?.trim() || getRuleBasedFallback(feature, payload)
      });
    }

    if (feature === 'cerita_omzet') {
      const { totalOmzet, totalProfit, trxCount, topProduct, kasbonToday } = payload;
      const prompt = `Anda adalah konsultan keuangan ramah untuk pemilik warung kelontong tradisional Indonesia.
Buat ringkasan "Cerita Omzet Hari Ini" tepat dalam 3 kalimat bahasa Indonesia yang hangat, membangkitkan semangat, dan mudah dipahami:
- Kalimat 1: Ucapkan apresiasi atas omzet hari ini (Rp ${Number(totalOmzet).toLocaleString('id-ID')}) dari ${trxCount} transaksi.
- Kalimat 2: Soroti produk terlaris hari ini (${topProduct || 'Sembako'}) serta estimasi margin/keuntungan bersih (Rp ${Number(totalProfit).toLocaleString('id-ID')}).
- Kalimat 3: Catatan pengingat kasbon baru (Rp ${Number(kasbonToday).toLocaleString('id-ID')}) dan kata penyemangat untuk besok.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return NextResponse.json({
        success: true,
        source: 'ai',
        badge: 'Dibantu AI Gemini',
        result: response.text?.trim() || getRuleBasedFallback(feature, payload)
      });
    }

    // Default unknown feature fallback
    return NextResponse.json({
      success: true,
      source: 'rule_fallback',
      badge: 'Mode Aturan',
      result: getRuleBasedFallback(feature, payload)
    });

  } catch (error: any) {
    console.error('AI Route Error:', error);
    // Graceful fallback to rule-based logic
    return NextResponse.json({
      success: true,
      source: 'rule_fallback',
      badge: 'AI tidak aktif (Fallback Otomatis)',
      result: getRuleBasedFallback(req.headers.get('x-feature') || '', {})
    });
  }
}

// Rule-based fallback functions (works 100% offline without any AI or internet)
function getRuleBasedFallback(feature: string, payload: any): string {
  if (feature === 'saran_kulakan') {
    const products = payload?.products || [];
    const lowStock = products.filter((p: any) => p.stock <= p.min_stock);

    if (lowStock.length === 0) {
      return `📦 Kondisi Stok Aman!\nSemua stok barang saat ini masih di atas batas minimal aman. Anda belum perlu kulakan darurat hari ini. Pantau kembali saat akhir pekan.`;
    }

    let report = `📦 REKOMENDASI KULAKAN (RUMUS ATURAN STOK MINIMAL):\n`;
    report += `Ditemukan ${lowStock.length} produk yang stoknya menipis atau di bawah batas minimal:\n\n`;

    let totalEstModal = 0;
    lowStock.forEach((p: any, idx: number) => {
      // Rule: restock = min_stock * 2 - current stock (or bundle_qty if larger)
      const targetQty = Math.max(p.min_stock * 2 - p.stock, p.bundle_qty || 5);
      const estCost = targetQty * p.cost_price;
      totalEstModal += estCost;
      report += `${idx + 1}. ${p.name}\n   - Stok saat ini: ${p.stock} ${p.unit} (Batas Min: ${p.min_stock})\n   - Sarankan beli: ${targetQty} ${p.unit}\n   - Est. Modal Kulakan: Rp ${estCost.toLocaleString('id-ID')}\n   - Alasan: Stok sudah mencapai ambang batas kritis.\n\n`;
    });

    report += `💡 Total Estimasi Modal Belanja: Rp ${totalEstModal.toLocaleString('id-ID')}.\nTips: Belilah dalam satuan dus atau slop dari agen grosir untuk menghemat biaya modal hingga 5-8%.`;
    return report;
  }

  if (feature === 'pesan_tagih_halus') {
    const name = payload?.customerName || 'Bapak/Ibu Pelanggan';
    const amount = Number(payload?.amount || 0).toLocaleString('id-ID');
    const days = payload?.daysOverdue || 0;

    if (days > 0) {
      return `Assalamu’alaikum wr. wb. Selamat siang ${name}.\n\nSemoga ${name} dan keluarga senantiasa sehat dan berkah rezekinya. 🙏\n\nSekadar info silaturahmi yang santun dari Warung Berkah, kami ingin menginformasikan catatan kasbon belanjaan warung sebesar *Rp ${amount}* yang telah melewati jatuh tempo sekitar ${days} hari yang lalu.\n\nBila senggang dan ada rezeki, monggo bisa mampir ke warung atau via transfer bila lebih praktis nggih. Matur suwun sanget atas pengertian dan kerja samanya. Sehat selalu! 😊`;
    }

    return `Assalamu’alaikum wr. wb. Selamat siang ${name}.\n\nSemoga ${name} sekeluarga selalu dalam lindungan Tuhan Yang Maha Esa. 🙏\n\nMenyambung silaturahmi, sekadar pengingat lembut dari Warung Berkah terkait catatan kasbon belanjaan senilai *Rp ${amount}*.\n\nApabila berkenan dan sudah ada kelonggaran, bisa diselesaikan saat senggang nggih. Terima kasih banyak atas kepercayaannya selalu berbelanja di warung kami. Salam hangat! ✨`;
  }

  if (feature === 'cerita_omzet') {
    const omzet = Number(payload?.totalOmzet || 0).toLocaleString('id-ID');
    const profit = Number(payload?.totalProfit || 0).toLocaleString('id-ID');
    const trx = payload?.trxCount || 0;
    const top = payload?.topProduct || 'Sembako & Minuman';
    const kasbon = Number(payload?.kasbonToday || 0).toLocaleString('id-ID');

    return `Alhamdulillah, penjualan warung hari ini berhasil membukukan omzet sebesar Rp ${omzet} dari total ${trx} transaksi pelanggan. Produk terlaris hari ini dipimpin oleh kategori ${top} dengan estimasi keuntungan kotor sebesar Rp ${profit}. Terdapat kasbon baru hari ini sebesar Rp ${kasbon}; tetap pantau buku piutang dan semoga besok dagangan semakin laris manis serta berkah melimpah!`;
  }

  return 'Data berhasil diproses sesuai aturan warung.';
}
