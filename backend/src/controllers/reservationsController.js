import { prisma } from '../config/prisma.js';
import { createReservation } from '../services/reservationService.js';

async function getTop3Purchasers(dropId) {
  const purchases = await prisma.purchase.findMany({
    where: { dropId },
    orderBy: { purchasedAt: 'desc' },
    take: 3,
    include: { user: { select: { username: true } } },
  });

  return purchases.map((p) => ({ username: p.user.username, purchasedAt: p.purchasedAt }));
}

export async function reserve(req, res, next) {
  const { userId, dropId } = req.body;

  if (!userId || !dropId) {
    return res.status(400).json({ error: 'userId and dropId are required', code: 'VALIDATION_ERROR' });
  }

  try {
    const { reservation, newStock } = await createReservation(userId, dropId, prisma);

    req.io.emit('stock:updated', {
      dropId,
      newStock,
      reason: 'reservation_placed',
    });

    res.status(201).json({ reservation, newStock });
  } catch (err) {
    next(err);
  }
}

export async function completePurchase(req, res, next) {
  const { id: reservationId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required', code: 'VALIDATION_ERROR' });
  }

  try {
    const purchase = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { drop: true },
      });

      if (!reservation) throw Object.assign(new Error('Reservation not found'), { statusCode: 404, code: 'NOT_FOUND' });
      if (reservation.userId !== userId) throw Object.assign(new Error('Forbidden'), { statusCode: 403, code: 'FORBIDDEN' });
      if (reservation.status !== 'PENDING') throw Object.assign(new Error(`Reservation is ${reservation.status}`), { statusCode: 409, code: 'RESERVATION_EXPIRED' });
      if (new Date() > reservation.expiresAt) throw Object.assign(new Error('Reservation has expired'), { statusCode: 409, code: 'RESERVATION_EXPIRED' });

      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'COMPLETED' },
      });

      const newPurchase = await tx.purchase.create({
        data: {
          userId,
          dropId: reservation.dropId,
          reservationId,
          amount: reservation.drop.price,
        },
        include: { user: { select: { username: true } } },
      });

      return newPurchase;
    });

    const top3 = await getTop3Purchasers(purchase.dropId);

    req.io.emit('purchase:completed', {
      dropId: purchase.dropId,
      purchasers: top3,
    });

    res.json({ success: true, purchase });
  } catch (err) {
    next(err);
  }
}

export async function cancelReservation(req, res, next) {
  const { id: reservationId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required', code: 'VALIDATION_ERROR' });
  }

  try {
    const newStock = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });

      if (!reservation) throw Object.assign(new Error('Reservation not found'), { statusCode: 404, code: 'NOT_FOUND' });
      if (reservation.userId !== userId) throw Object.assign(new Error('Forbidden'), { statusCode: 403, code: 'FORBIDDEN' });
      if (reservation.status !== 'PENDING') throw Object.assign(new Error(`Reservation is ${reservation.status}`), { statusCode: 409, code: 'RESERVATION_EXPIRED' });

      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'CANCELLED' },
      });

      const result = await tx.$queryRaw`
        UPDATE "Drop"
        SET stock = stock + 1, "updatedAt" = NOW()
        WHERE id = ${reservation.dropId}
        RETURNING stock
      `;

      return { stock: result[0].stock, dropId: reservation.dropId };
    });

    req.io.emit('stock:updated', {
      dropId: newStock.dropId,
      newStock: newStock.stock,
      reason: 'reservation_cancelled',
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
