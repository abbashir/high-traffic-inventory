export async function createReservation(userId, dropId, prisma) {
  // Atomic stock decrement — only succeeds if stock > 0. PostgreSQL's
  // row-level MVCC guarantees only the requests that see stock > 0 at
  // UPDATE time can win, so concurrent reservations can never oversell.
  const result = await prisma.$queryRaw`
    UPDATE "Drop"
    SET stock = stock - 1, "updatedAt" = NOW()
    WHERE id = ${dropId}
      AND stock > 0
      AND "isActive" = true
    RETURNING id, stock
  `;

  if (!result || result.length === 0) {
    const error = new Error('Item is out of stock');
    error.statusCode = 409;
    error.code = 'OUT_OF_STOCK';
    throw error;
  }

  const updatedDrop = result[0];
  const expiresAt = new Date(Date.now() + Number(process.env.RESERVATION_TTL_SECONDS) * 1000);

  let reservation;
  try {
    reservation = await prisma.reservation.create({
      data: {
        userId,
        dropId,
        expiresAt,
        status: 'PENDING',
      },
    });
  } catch (err) {
    // Roll back the decrement if reservation creation fails (e.g. the
    // one-pending-per-user-drop partial unique index rejects a duplicate).
    await prisma.$executeRaw`
      UPDATE "Drop" SET stock = stock + 1, "updatedAt" = NOW() WHERE id = ${dropId}
    `;

    if (err.code === 'P2002' || err.code === '23505') {
      const error = new Error('You already have a pending reservation for this drop');
      error.statusCode = 409;
      error.code = 'ALREADY_RESERVED';
      throw error;
    }
    throw err;
  }

  return { reservation, newStock: updatedDrop.stock };
}
