// src/validators/orders.validator.js

import { z } from "zod";

// ============================================================
// Esquemas de Validación
// ============================================================

/**
 * Esquema para crear una orden
 */
export const createOrderSchema = z.object({
  totalAmount: z.number().min(0).optional().default(0),
  deliveryType: z.enum(['dine-in', 'delivery', 'takeout']).optional().default('dine-in'),
  specialInstructions: z.string().max(500).optional().nullable()
});

/**
 * Esquema para actualizar estado de orden
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled'])
    .describe('Estado válido de la orden')
});

/**
 * Esquema para actualizar instrucciones especiales
 */
export const updateInstructionsSchema = z.object({
  specialInstructions: z.string().max(500).optional().nullable()
});

/**
 * Esquema para agregar item a orden
 */
export const addOrderItemSchema = z.object({
  menuItemId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
  specialRequests: z.string().max(300).optional().nullable()
});

/**
 * Esquema para actualizar cantidad de item
 */
export const updateItemQuantitySchema = z.object({
  quantity: z.number().int().min(1).max(99)
});

/**
 * Esquema para un item del carrito en checkout
 */
const cartItemSchema = z.object({
  menuItemId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
  specialRequests: z.string().max(300).optional().nullable()
});

/**
 * Esquema para checkout completo
 */
export const checkoutCartSchema = z.object({
  cartItems: z.array(cartItemSchema).min(1, 'El carrito debe tener al menos 1 item'),
  deliveryType: z.enum(['dine-in', 'delivery', 'takeout']).optional().default('dine-in'),
  specialInstructions: z.string().max(500).optional().nullable()
});

/**
 * Esquema para query parameters de órdenes
 */
export const ordersQuerySchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

/**
 * Esquema para query parameters de analytics con rango de fechas
 */
export const dateRangeQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato requerido: YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato requerido: YYYY-MM-DD')
});

/**
 * Esquema para query parameters con limit
 */
export const limitQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

// ============================================================
// Funciones de Validación
// ============================================================

/**
 * Valida el body para crear orden
 * @param {Object} data - Datos a validar
 * @throws {ZodError} - Si los datos no son válidos
 * @returns {Object} - Datos validados
 */
export const validateCreateOrder = (data) => {
  return createOrderSchema.parse(data);
};

/**
 * Valida el body para actualizar estado
 * @param {Object} data - Datos a validar
 * @throws {ZodError} - Si los datos no son válidos
 * @returns {Object} - Datos validados
 */
export const validateUpdateOrderStatus = (data) => {
  return updateOrderStatusSchema.parse(data);
};

/**
 * Valida el body para actualizar instrucciones
 * @param {Object} data - Datos a validar
 * @throws {ZodError} - Si los datos no son válidos
 * @returns {Object} - Datos validados
 */
export const validateUpdateInstructions = (data) => {
  return updateInstructionsSchema.parse(data);
};

/**
 * Valida el body para agregar item
 * @param {Object} data - Datos a validar
 * @throws {ZodError} - Si los datos no son válidos
 * @returns {Object} - Datos validados
 */
export const validateAddOrderItem = (data) => {
  return addOrderItemSchema.parse(data);
};

/**
 * Valida el body para actualizar cantidad
 * @param {Object} data - Datos a validar
 * @throws {ZodError} - Si los datos no son válidos
 * @returns {Object} - Datos validados
 */
export const validateUpdateItemQuantity = (data) => {
  return updateItemQuantitySchema.parse(data);
};

/**
 * Valida el body para checkout
 * @param {Object} data - Datos a validar
 * @throws {ZodError} - Si los datos no son válidos
 * @returns {Object} - Datos validados
 */
export const validateCheckoutCart = (data) => {
  return checkoutCartSchema.parse(data);
};

/**
 * Valida los query parameters de órdenes
 * @param {Object} data - Query params a validar
 * @throws {ZodError} - Si los datos no son válidos
 * @returns {Object} - Datos validados
 */
export const validateOrdersQuery = (data) => {
  return ordersQuerySchema.parse(data);
};

/**
 * Valida los query parameters de rango de fechas
 * @param {Object} data - Query params a validar
 * @throws {ZodError} - Si los datos no son válidos
 * @returns {Object} - Datos validados
 */
export const validateDateRangeQuery = (data) => {
  return dateRangeQuerySchema.parse(data);
};

/**
 * Valida los query parameters con limit
 * @param {Object} data - Query params a validar
 * @throws {ZodError} - Si los datos no son válidos
 * @returns {Object} - Datos validados
 */
export const validateLimitQuery = (data) => {
  return limitQuerySchema.parse(data);
};

// ============================================================
// MIDDLEWARES DE VALIDACIÓN - BODY (Pueden modificar req.body)
// ============================================================

/**
 * Middleware para validar body de crear orden
 */
export const validateCreateOrderMiddleware = (req, res, next) => {
  try {
    req.body = validateCreateOrder(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar body de actualizar estado
 */
export const validateUpdateStatusMiddleware = (req, res, next) => {
  try {
    req.body = validateUpdateOrderStatus(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar body de actualizar instrucciones
 */
export const validateUpdateInstructionsMiddleware = (req, res, next) => {
  try {
    req.body = validateUpdateInstructions(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar body de agregar item
 */
export const validateAddItemMiddleware = (req, res, next) => {
  try {
    req.body = validateAddOrderItem(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar body de actualizar cantidad
 */
export const validateUpdateQuantityMiddleware = (req, res, next) => {
  try {
    req.body = validateUpdateItemQuantity(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar body de checkout
 */
export const validateCheckoutMiddleware = (req, res, next) => {
  try {
    req.body = validateCheckoutCart(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

// ============================================================
// MIDDLEWARES DE VALIDACIÓN - QUERY (NO modificar req.query directamente)
// ============================================================

/**
 * Middleware para validar query params de órdenes
 * ⚠️ NO modifica req.query, solo valida
 */
export const validateOrdersQueryMiddleware = (req, res, next) => {
  try {
    // Solo validar, no asignar a req.query
    validateOrdersQuery(req.query);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar query params de rango de fechas
 * ⚠️ NO modifica req.query, solo valida
 */
export const validateDateRangeQueryMiddleware = (req, res, next) => {
  try {
    // Solo validar, no asignar a req.query
    validateDateRangeQuery(req.query);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar query params con limit
 * ⚠️ NO modifica req.query, solo valida
 */
export const validateLimitQueryMiddleware = (req, res, next) => {
  try {
    // Solo validar, no asignar a req.query
    validateLimitQuery(req.query);
    next();
  } catch (error) {
    next(error);
  }
};
