import { prisma } from '../config/prisma.js';

export async function createDrop(req, res, next) {
  const { name, description, imageUrl, totalStock, price, startsAt, endsAt } = req.body;

  if (!name || !totalStock || !price || !startsAt) {
    return res.status(400).json({ error: 'name, totalStock, price, startsAt are required', code: 'VALIDATION_ERROR' });
  }
  if (totalStock < 1) {
    return res.status(400).json({ error: 'totalStock must be >= 1', code: 'VALIDATION_ERROR' });
  }
  if (price <= 0) {
    return res.status(400).json({ error: 'price must be > 0', code: 'VALIDATION_ERROR' });
  }

  try {
    const drop = await prisma.drop.create({
      data: {
        name,
        description,
        imageUrl,
        totalStock: Number(totalStock),
        stock: Number(totalStock),
        price: Number(price),
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });

    req.io.emit('drop:created', { drop });

    res.status(201).json({ drop });
  } catch (err) {
    next(err);
  }
}

function shapeDrop(drop) {
  return {
    ...drop,
    purchasers: drop.purchases.map((p) => ({
      username: p.user.username,
      purchasedAt: p.purchasedAt,
    })),
    purchases: undefined,
  };
}

export async function listDrops(req, res, next) {
  try {
    const drops = await prisma.drop.findMany({
      where: { isActive: true },
      orderBy: { startsAt: 'asc' },
      include: {
        purchases: {
          orderBy: { purchasedAt: 'desc' },
          take: 3,
          include: {
            user: { select: { username: true } },
          },
        },
      },
    });

    res.json({ drops: drops.map(shapeDrop) });
  } catch (err) {
    next(err);
  }
}

export async function getDrop(req, res, next) {
  const { id } = req.params;

  try {
    const drop = await prisma.drop.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { purchasedAt: 'desc' },
          take: 3,
          include: {
            user: { select: { username: true } },
          },
        },
      },
    });

    if (!drop) {
      return res.status(404).json({ error: 'Drop not found', code: 'NOT_FOUND' });
    }

    res.json({ drop: shapeDrop(drop) });
  } catch (err) {
    next(err);
  }
}
