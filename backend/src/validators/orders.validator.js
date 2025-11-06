// src/validators/orders.validator.js

import { z } from "zod";

// ============================================================
// ESQUEMAS DE VALIDACIÓN
// ============================================================

export const createOrderSchema = z.object({
  user_id: z.number().int().positive("user_id debe ser un número positivo"),
  total_amount: z.number().min(0).optional().default(0),
  delivery_type: z.enum(['dine-in', 'delivery', 'takeout']).optional().default('dine-in'),
  special_instructions: z.string().max(500).optional().nullable()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled'])
    .describe('Estado válido de la orden')
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']).optional(),
  delivery_type: z.enum(['dine-in', 'delivery', 'takeout']).optional(),
  special_instructions: z.string().max(500).optional().nullable(),
  total_amount: z.number().min(0).optional()
});

export const addOrderItemSchema = z.object({
  order_id: z.number().int().positive("order_id debe ser positivo"),
  menu_item_id: z.number().int().positive("menu_item_id debe ser positivo"),
  quantity: z.number().int().min(1).max(99),
  price: z.number().min(0),
  subtotal: z.number().min(0).optional(),
  special_requests: z.string().max(300).optional().nullable()
});

export const updateOrderItemSchema = z.object({
  quantity: z.number().int().min(1).max(99).optional(),
  special_requests: z.string().max(300).optional().nullable()
});

const cartItemSchema = z.object({
  menu_item_id: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99).default(1),
  special_requests: z.string().max(300).optional().nullable()
});

export const createFullOrderSchema = z.object({
  user_id: z.number().int().positive("user_id debe ser positivo"),
  cart_items: z.array(cartItemSchema).min(1, 'El carrito debe tener al menos 1 item'),
  delivery_type: z.enum(['dine-in', 'delivery', 'takeout']).optional().default('dine-in'),
  special_instructions: z.string().max(500).optional().nullable()
});

export const validateCartSchema = z.object({
  cart_items: z.array(cartItemSchema).min(1, 'El carrito debe tener al menos 1 item')
});

export const createDineInOrderSchema = z.object({
  user_id: z.number().int().positive("user_id debe ser positivo"),
  table_id: z.number().int().positive("table_id debe ser positivo"),
  cart_items: z.array(cartItemSchema).min(1, 'El carrito debe tener al menos 1 item'),
  special_instructions: z.string().max(500).optional().nullable()
});

export const moveOrderSchema = z.object({
  new_table_id: z.number().int().positive("new_table_id debe ser positivo")
});

export const ordersQuerySchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

export const dateRangeQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato requerido: YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato requerido: YYYY-MM-DD')
});

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

// ============================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================

export const validateCreateOrder = (data) => createOrderSchema.parse(data);
export const validateUpdateOrderStatus = (data) => updateOrderStatusSchema.parse(data);
export const validateUpdateOrder = (data) => updateOrderSchema.parse(data);
export const validateAddOrderItem = (data) => addOrderItemSchema.parse(data);
export const validateUpdateOrderItem = (data) => updateOrderItemSchema.parse(data);
export const validateCreateFullOrder = (data) => createFullOrderSchema.parse(data);
export const validateValidateCart = (data) => validateCartSchema.parse(data);
export const validateCreateDineInOrder = (data) => createDineInOrderSchema.parse(data);
export const validateMoveOrder = (data) => moveOrderSchema.parse(data);
export const validateOrdersQuery = (data) => ordersQuerySchema.parse(data);
export const validateDateRangeQuery = (data) => dateRangeQuerySchema.parse(data);
export const validatePaginationQuery = (data) => paginationQuerySchema.parse(data);

// ============================================================
// MIDDLEWARES DE VALIDACIÓN - BODY
// ============================================================

export const validateCreateOrderMiddleware = (req, res, next) => {
  try {
    req.body = validateCreateOrder(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdateStatusMiddleware = (req, res, next) => {
  try {
    req.body = validateUpdateOrderStatus(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdateOrderMiddleware = (req, res, next) => {
  try {
    req.body = validateUpdateOrder(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateAddItemMiddleware = (req, res, next) => {
  try {
    req.body = validateAddOrderItem(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUpdateItemMiddleware = (req, res, next) => {
  try {
    req.body = validateUpdateOrderItem(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateCreateFullOrderMiddleware = (req, res, next) => {
  try {
    req.body = validateCreateFullOrder(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateValidateCartMiddleware = (req, res, next) => {
  try {
    req.body = validateValidateCart(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateCreateDineInOrderMiddleware = (req, res, next) => {
  try {
    req.body = validateCreateDineInOrder(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateMoveOrderMiddleware = (req, res, next) => {
  try {
    req.body = validateMoveOrder(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

// ============================================================
// MIDDLEWARES DE VALIDACIÓN - QUERY
// ============================================================

export const validateOrdersQueryMiddleware = (req, res, next) => {
  try {
    validateOrdersQuery(req.query);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateDateRangeQueryMiddleware = (req, res, next) => {
  try {
    validateDateRangeQuery(req.query);
    next();
  } catch (error) {
    next(error);
  }
};

export const validatePaginationQueryMiddleware = (req, res, next) => {
  try {
    validatePaginationQuery(req.query);
    next();
  } catch (error) {
    next(error);
  }
};
