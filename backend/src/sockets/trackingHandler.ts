import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar';

// Aktif şoförler: driverId -> session
const activeDrivers: Record<string, {
  lat: number; lng: number;
  name: string; startedAt: string;
  socketId: string;
}> = {};

// Disconnect grace period timers (30 sn bekle, kopmuş olabilir)
const disconnectTimers: Record<string, NodeJS.Timeout> = {};

export const setupTrackingSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('🔗 Bağlantı:', socket.id);

    // Şoför sefere başlıyor
    socket.on('driverStartTrip', (data: { token: string; name: string }) => {
      try {
        const decoded: any = jwt.verify(data.token, JWT_SECRET);
        const driverId = String(decoded.id);

        // Eğer bekleyen disconnect timer varsa iptal et (yeniden bağlandı)
        if (disconnectTimers[driverId]) {
          clearTimeout(disconnectTimers[driverId]);
          delete disconnectTimers[driverId];
          console.log(`🔄 Şoför yeniden bağlandı: ${driverId}`);
        }

        activeDrivers[driverId] = {
          lat: 0, lng: 0,
          name: data.name,
          startedAt: new Date().toISOString(),
          socketId: socket.id
        };

        socket.data.driverId = driverId;
        socket.join(`driver_${driverId}`);

        io.emit('driverOnline', { driverId, name: data.name });
        socket.emit('tripStartConfirmed', { driverId });
        console.log(`🚌 Sefer başladı - Şoför ${driverId} (${data.name})`);
      } catch {
        socket.emit('authError', { message: 'Geçersiz oturum.' });
      }
    });

    // GPS güncellemesi
    socket.on('driverLocation', (data: { lat: number; lng: number }) => {
      const driverId = socket.data.driverId;
      if (!driverId || !activeDrivers[driverId]) return;

      activeDrivers[driverId].lat = data.lat;
      activeDrivers[driverId].lng = data.lng;

      io.to(`driver_${driverId}`).emit('busLocation', {
        lat: data.lat, lng: data.lng,
        driverId, name: activeDrivers[driverId].name,
        timestamp: new Date().toISOString()
      });
    });

    // Şoför seferi manuel bitirdi
    socket.on('driverEndTrip', () => {
      const driverId = socket.data.driverId;
      if (!driverId) return;
      _endDriverSession(io, driverId);
    });

    // Veli bir şoförü izlemeye başlıyor
    socket.on('watchDriver', (driverId: string) => {
      socket.join(`driver_${driverId}`);
      const d = activeDrivers[driverId];
      if (d && (d.lat !== 0 || d.lng !== 0)) {
        socket.emit('busLocation', {
          lat: d.lat, lng: d.lng, driverId, name: d.name,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Aktif şoför listesi isteği
    socket.on('getActiveDrivers', () => {
      const list = Object.entries(activeDrivers).map(([id, d]) => ({
        driverId: id, name: d.name, lat: d.lat, lng: d.lng, startedAt: d.startedAt
      }));
      socket.emit('activeDriversList', list);
    });

    // Öğrenci durumu güncellemesi — boardingController buraya emit eder
    socket.on('boardingUpdate', (data: { studentId: number; type: string; driverId?: string }) => {
      const driverId = data.driverId || socket.data.driverId;
      if (!driverId) return;
      // Tüm velileri bilgilendir (haritaya girmemiş olsalar bile)
      io.emit('studentStatusChanged', { ...data, driverId });
    });

    // Disconnect: anında kapatma, 30 sn grace period ver
    socket.on('disconnect', () => {
      const driverId = socket.data.driverId;
      if (!driverId) return;

      console.log(`⚠️ Şoför bağlantısı kesildi (30sn bekleniyor): ${driverId}`);

      disconnectTimers[driverId] = setTimeout(() => {
        if (activeDrivers[driverId]) {
          console.log(`🔌 Grace period doldu, sefer kapatılıyor: ${driverId}`);
          _endDriverSession(io, driverId);
        }
        delete disconnectTimers[driverId];
      }, 30000); // 30 saniye grace period
    });
  });
};

function _endDriverSession(io: Server, driverId: string) {
  delete activeDrivers[driverId];
  io.to(`driver_${driverId}`).emit('driverOffline', { driverId });
  io.emit('driverOffline', { driverId });
  console.log(`🏁 Sefer kapatıldı: ${driverId}`);
}
