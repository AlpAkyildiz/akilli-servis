import { Server, Socket } from 'socket.io';

export const setupTrackingSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('🔗 Yeni Socket.IO bağlantısı:', socket.id);

    // Şoförden canlı konum güncellemelerini al ve belirli bir "room"a (rota) yayınla
    socket.on('updateLocation', (data) => {
      // data: { routeId, lat, lng, timestamp }
      const { routeId, lat, lng } = data;
      
      // Şoförün yayınladığı konumu o rotayı dinleyenlere (Velilere/Adminlere) iletiyoruz
      io.to(`route_${routeId}`).emit('trackLocation', { lat, lng });
      
      console.log(`📍 Rota ${routeId} konumu güncellendi: ${lat}, ${lng}`);
    });

    // Veli veya Admin belirli bir rotayı izlemek için o odalara katılır
    socket.on('joinRouteRoom', (routeId) => {
      socket.join(`route_${routeId}`);
      console.log(`👀 İstemci route_${routeId} odasına katıldı.`);
    });

    socket.on('leaveRouteRoom', (routeId) => {
      socket.leave(`route_${routeId}`);
      console.log(`👋 İstemci route_${routeId} odasından ayrıldı.`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 İstemci ayrıldı:', socket.id);
    });
  });
};
