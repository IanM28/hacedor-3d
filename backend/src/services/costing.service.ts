const COSTING_CONFIG = {
  filamentKgPrice: 20000,
  kwhPrice: 140,
  printerConsumptionW: 120,
  usefulLifeHours: 4320,
  replacementPartsPrice: 15000,
  errorMarginPercent: 0.3,
  tithePercent: 0.1,
  defaultProfitMultiplier: 8,
} as const

export interface ProductCostInput {
  printHours?: number | null
  filamentGrams?: number | null
  profitMultiplier?: number | null
  supplierCost?: number | null
  salePrice: number
}

export interface ProductCostResult {
  materialCost: number
  electricityCost: number
  wearCost: number
  errorMargin: number
  realManufacturingCost: number
  suggestedSalePrice: number
  netProfit: number
  titheAmount: number
  isEstimated: boolean
}

export interface OrderItemProfitInput {
  unitPrice: number
  quantity: number
  product: {
    printHours?: number | null
    filamentGrams?: number | null
    profitMultiplier?: number | null
    supplierCost?: number | null
  }
}

export interface OrderItemProfitResult {
  netProfit: number
  titheAmount: number
  isEstimated: boolean
}

export interface OrderProfitInput {
  items: OrderItemProfitInput[]
}

export interface OrderProfitResult {
  netProfit: number
  titheAmount: number
  isEstimated: boolean
}

export function calculateProductCost(input: ProductCostInput): ProductCostResult {
  const { printHours, filamentGrams, profitMultiplier, supplierCost, salePrice } = input
  const multiplier = profitMultiplier ?? COSTING_CONFIG.defaultProfitMultiplier
  const hasPrintData = printHours != null && filamentGrams != null

  if (!hasPrintData) {
    const realManufacturingCost = supplierCost ?? 0
    const netProfit = salePrice - realManufacturingCost
    const titheAmount = netProfit * COSTING_CONFIG.tithePercent
    return {
      materialCost: 0,
      electricityCost: 0,
      wearCost: 0,
      errorMargin: 0,
      realManufacturingCost,
      suggestedSalePrice: realManufacturingCost * multiplier,
      netProfit,
      titheAmount,
      isEstimated: true,
    }
  }

  const materialCost = filamentGrams * (COSTING_CONFIG.filamentKgPrice / 1000)
  const electricityCost = printHours * (COSTING_CONFIG.printerConsumptionW / 1000) * COSTING_CONFIG.kwhPrice
  const wearCost = printHours * (COSTING_CONFIG.replacementPartsPrice / COSTING_CONFIG.usefulLifeHours)
  const errorMargin = (materialCost + electricityCost + wearCost) * COSTING_CONFIG.errorMarginPercent
  const realManufacturingCost = materialCost + electricityCost + wearCost + errorMargin
  const suggestedSalePrice = realManufacturingCost * multiplier
  const netProfit = salePrice - realManufacturingCost
  const titheAmount = netProfit * COSTING_CONFIG.tithePercent

  return {
    materialCost,
    electricityCost,
    wearCost,
    errorMargin,
    realManufacturingCost,
    suggestedSalePrice,
    netProfit,
    titheAmount,
    isEstimated: false,
  }
}

export function calculateOrderItemProfit(input: OrderItemProfitInput): OrderItemProfitResult {
  const result = calculateProductCost({
    printHours: input.product.printHours,
    filamentGrams: input.product.filamentGrams,
    profitMultiplier: input.product.profitMultiplier,
    supplierCost: input.product.supplierCost,
    salePrice: input.unitPrice,
  })

  return {
    netProfit: result.netProfit * input.quantity,
    titheAmount: result.titheAmount * input.quantity,
    isEstimated: result.isEstimated,
  }
}

export function calculateOrderProfit(order: OrderProfitInput): OrderProfitResult {
  let netProfit = 0
  let titheAmount = 0
  let isEstimated = false

  for (const item of order.items) {
    const result = calculateOrderItemProfit(item)
    netProfit += result.netProfit
    titheAmount += result.titheAmount
    if (result.isEstimated) isEstimated = true
  }

  return { netProfit, titheAmount, isEstimated }
}
