import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount as any);
  const safeAmount = isNaN(numericAmount) || !isFinite(numericAmount) ? 0 : numericAmount;

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(safeAmount)
}

export function formatDate(date: string | Date): string {
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Invalid Date'

    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d)
  } catch {
    return 'Invalid Date'
  }
}

export function formatShortDate(date: string | Date): string {
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Invalid Date'

    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)
  } catch {
    return 'Invalid Date'
  }
}

export function calculateInterest(principal: number, rate: number): number {
  return principal * (rate / 100)
}

export function calculateMaturityDate(releaseDate: Date, termDays: number): Date {
  const maturityDate = new Date(releaseDate)
  let daysAdded = 0

  while (daysAdded < termDays) {
    maturityDate.setDate(maturityDate.getDate() + 1)
    // Skip Sundays (0 = Sunday)
    if (maturityDate.getDay() !== 0) {
      daysAdded++
    }
  }

  return maturityDate
}

export function calculateDaysLate(maturityDate: Date, paymentDate: Date): number {
  if (paymentDate <= maturityDate) return 0

  let daysLate = 0
  const currentDate = new Date(maturityDate)

  while (currentDate < paymentDate) {
    currentDate.setDate(currentDate.getDate() + 1)
    // Count business days only (skip Sundays)
    if (currentDate.getDay() !== 0) {
      daysLate++
    }
  }

  return daysLate
}

export function generateCustomerCode(): string {
  const timestamp = Date.now().toString().slice(-6)
  return `CUS${timestamp}`
}

export function generateLoanCode(): string {
  const timestamp = Date.now().toString().slice(-6)
  return `LN${timestamp}`
}

export function generatePaymentId(): string {
  const timestamp = Date.now().toString().slice(-6)
  return `PAY${timestamp}`
}

export function formatTime(dateTime: string | Date): string {
  try {
    const d = new Date(dateTime)
    if (isNaN(d.getTime())) return 'Invalid Time'

    return new Intl.DateTimeFormat('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(d)
  } catch {
    return 'Invalid Time'
  }
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}
