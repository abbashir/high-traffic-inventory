import { prisma } from '../config/prisma.js';

export function startExpiryService(io) {
  const POLL_INTERVAL_MS = 5000;

  setInterval(async () => {
    await processExpiredReservations(io);
  }, POLL_INTERVAL_MS);

  console.log(`Expiry service started. Polling every ${POLL_INTERVAL_MS / 1000}s`);
}

async function processExpiredReservations(io) {
  const expiredReservations = await prisma.$transaction(async (tx) => {
    const expired = await tx.reservation.findMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: new Date() },
      },
      select: { id: true, dropId: true, userId: true },
    });

    if (expired.length === 0) return [];

    const expiredIds = expired.map((r) => r.id);

    await tx.reservation.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: 'EXPIRED' },
    });

    const dropCounts = {};
    expired.forEach((r) => {
      dropCounts[r.dropId] = (dropCounts[r.dropId] || 0) + 1;
    });

    for (const [dropId, count] of Object.entries(dropCounts)) {
      await tx.$executeRaw`
        UPDATE "Drop"
        SET stock = stock + ${count}, "updatedAt" = NOW()
        WHERE id = ${dropId}
      `;
    }

    return expired;
  });

  for (const reservation of expiredReservations) {
    const drop = await prisma.drop.findUnique({
      where: { id: reservation.dropId },
      select: { id: true, stock: true },
    });

    io.emit('stock:updated', {
      dropId: reservation.dropId,
      newStock: drop.stock,
      reason: 'reservation_expired',
    });

    io.emit('reservation:expired', {
      reservationId: reservation.id,
      userId: reservation.userId,
      dropId: reservation.dropId,
    });
  }
}
