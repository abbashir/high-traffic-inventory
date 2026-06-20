import swaggerJsdoc from 'swagger-jsdoc';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Sneaker Drop API',
    version: '1.0.0',
    description:
      'Real-time, high-concurrency sneaker drop platform. Reserve an item for a 60-second ' +
      'checkout window; overselling is prevented with a single atomic SQL UPDATE on `Drop.stock`. ' +
      'WebSocket events (see README) push live stock/purchase/expiry updates to all connected clients.',
  },
  servers: [{ url: '/', description: 'Current server' }],
  tags: [
    { name: 'Drops', description: 'Merch drop catalog' },
    { name: 'Reservations', description: 'Reserve, purchase, and cancel flow' },
    { name: 'Users', description: 'Dev-only user seeding' },
    { name: 'Health', description: 'Service health check' },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Purchaser: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          purchasedAt: { type: 'string', format: 'date-time' },
        },
      },
      Drop: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true },
          totalStock: { type: 'integer', description: 'Original total, never mutated after creation' },
          stock: { type: 'integer', description: 'Current available stock' },
          price: { type: 'string', example: '180.00' },
          startsAt: { type: 'string', format: 'date-time' },
          endsAt: { type: 'string', format: 'date-time', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          purchasers: {
            type: 'array',
            description: 'Top 3 most recent purchasers (only present on list/get endpoints)',
            items: { $ref: '#/components/schemas/Purchaser' },
          },
        },
      },
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          dropId: { type: 'string', format: 'uuid' },
          status: {
            type: 'string',
            enum: ['PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
          },
          expiresAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Purchase: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          dropId: { type: 'string', format: 'uuid' },
          reservationId: { type: 'string', format: 'uuid' },
          amount: { type: 'string', example: '180.00' },
          purchasedAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Item is out of stock' },
          code: {
            type: 'string',
            enum: [
              'VALIDATION_ERROR',
              'FORBIDDEN',
              'NOT_FOUND',
              'OUT_OF_STOCK',
              'ALREADY_RESERVED',
              'ALREADY_EXISTS',
              'RESERVATION_EXPIRED',
              'INTERNAL_ERROR',
            ],
            example: 'OUT_OF_STOCK',
          },
        },
      },
    },
    responses: {
      ValidationError: {
        description: 'Missing or invalid fields',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Resource does not exist',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Forbidden: {
        description: 'userId does not own the reservation',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Conflict: {
        description: 'Concurrency or state conflict (out of stock, already reserved, expired)',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition,
  apis: ['./src/routes/*.js', './src/index.js'],
});
