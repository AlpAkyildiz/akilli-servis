// Tüm API ve Socket URL'leri buradan yönetilir
// Canlıya alırken sadece .env.local dosyasını güncelle

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
