import { formatCurrency, formatDate, cn } from '../utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(1000)).toBe('₱1,000.00')
      expect(formatCurrency(1234.56)).toBe('₱1,234.56')
      expect(formatCurrency(1000000)).toBe('₱1,000,000.00')
    })

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('₱0.00')
    })

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-1000)).toBe('-₱1,000.00')
      expect(formatCurrency(-1234.56)).toBe('-₱1,234.56')
    })

    it('handles decimal precision', () => {
      expect(formatCurrency(1234.567)).toBe('₱1,234.57') // Rounds to 2 decimal places
      expect(formatCurrency(1234.1)).toBe('₱1,234.10')
      expect(formatCurrency(1234)).toBe('₱1,234.00')
    })

    it('handles very large numbers', () => {
      expect(formatCurrency(1000000000)).toBe('₱1,000,000,000.00')
    })

    it('handles very small numbers', () => {
      expect(formatCurrency(0.01)).toBe('₱0.01')
      expect(formatCurrency(0.001)).toBe('₱0.00') // Rounds to 2 decimal places
    })

    it('handles string input by converting to number', () => {
      expect(formatCurrency('1000')).toBe('₱1,000.00')
      expect(formatCurrency('1234.56')).toBe('₱1,234.56')
    })

    it('handles invalid input gracefully', () => {
      expect(formatCurrency(NaN)).toBe('₱0.00')
      expect(formatCurrency(Infinity)).toBe('₱0.00')
      expect(formatCurrency(-Infinity)).toBe('₱0.00')
      expect(formatCurrency('invalid')).toBe('₱0.00')
    })
  })

  describe('formatDate', () => {
    const mockDate = new Date('2023-12-25T10:30:00Z')

    it('formats date correctly with default locale', () => {
      const result = formatDate(mockDate)
      // The exact format may vary by environment, but should include date components
      expect(result).toMatch(/2023/)
      expect(result).toMatch(/Dec|December|12/)
      expect(result).toMatch(/25/)
    })

    it('handles Date object input', () => {
      const date = new Date('2023-01-15T00:00:00Z')
      const result = formatDate(date)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('handles string date input', () => {
      const result = formatDate('2023-12-25')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('handles different date formats', () => {
      const dates = [
        '2023-12-25',
        '2023/12/25',
        'December 25, 2023',
        '2023-12-25T10:30:00Z',
      ]

      dates.forEach(dateStr => {
        const result = formatDate(dateStr)
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      })
    })

    it('handles invalid date input gracefully', () => {
      const invalidDates = [
        'invalid-date',
        '',
        null,
        undefined,
        NaN,
      ]

      invalidDates.forEach(invalidDate => {
        expect(() => formatDate(invalidDate as any)).not.toThrow()
      })
    })

    it('handles edge cases', () => {
      const edgeCases = [
        new Date('1970-01-01T00:00:00Z'), // Unix epoch
        new Date('2000-01-01T00:00:00Z'), // Y2K
        new Date('2023-02-29T00:00:00Z'), // Invalid date (non-leap year)
      ]

      edgeCases.forEach(date => {
        expect(() => formatDate(date)).not.toThrow()
      })
    })
  })

  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('handles conditional classes', () => {
      const condition = true
      const result = cn('base-class', condition && 'conditional-class')
      expect(result).toContain('base-class')
      expect(result).toContain('conditional-class')
    })

    it('filters out falsy values', () => {
      const result = cn('class1', false, null, undefined, '', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).not.toContain('false')
      expect(result).not.toContain('null')
    })

    it('handles arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('handles objects with boolean values', () => {
      const result = cn({
        'active': true,
        'disabled': false,
        'highlighted': true,
      })
      expect(result).toContain('active')
      expect(result).toContain('highlighted')
      expect(result).not.toContain('disabled')
    })

    it('merges Tailwind classes correctly', () => {
      // This depends on the implementation of cn using clsx and tailwind-merge
      const result = cn('bg-red-500', 'bg-blue-500') // Should merge, keeping only blue
      // The exact behavior depends on tailwind-merge configuration
      expect(typeof result).toBe('string')
    })

    it('handles empty input', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
      expect(cn(null, undefined, false)).toBe('')
    })

    it('handles complex combinations', () => {
      const isActive = true
      const size = 'large'
      const variant = 'primary'
      
      const result = cn(
        'base-class',
        isActive && 'active',
        `size-${size}`,
        {
          'variant-primary': variant === 'primary',
          'variant-secondary': variant === 'secondary',
        },
        ['additional', 'classes']
      )
      
      expect(result).toContain('base-class')
      expect(result).toContain('active')
      expect(result).toContain('size-large')
      expect(result).toContain('variant-primary')
      expect(result).not.toContain('variant-secondary')
      expect(result).toContain('additional')
      expect(result).toContain('classes')
    })
  })

  describe('Error Handling', () => {
    it('handles formatCurrency with non-numeric strings', () => {
      expect(() => formatCurrency('abc')).not.toThrow()
      expect(() => formatCurrency({})).not.toThrow()
      expect(() => formatCurrency([])).not.toThrow()
    })

    it('handles formatDate with various input types', () => {
      expect(() => formatDate(123456789)).not.toThrow()
      expect(() => formatDate({})).not.toThrow()
      expect(() => formatDate([])).not.toThrow()
    })

    it('handles cn with various input types', () => {
      expect(() => cn(123 as any)).not.toThrow()
      expect(() => cn({ toString: () => 'test' } as any)).not.toThrow()
      expect(() => cn(Symbol('test') as any)).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('formatCurrency performs well with many calls', () => {
      const start = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        formatCurrency(Math.random() * 1000000)
      }
      
      const end = performance.now()
      const duration = end - start
      
      // Should complete 1000 operations in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100)
    })

    it('formatDate performs well with many calls', () => {
      const start = performance.now()
      const baseDate = new Date()
      
      for (let i = 0; i < 1000; i++) {
        const testDate = new Date(baseDate.getTime() + i * 86400000) // Add days
        formatDate(testDate)
      }
      
      const end = performance.now()
      const duration = end - start
      
      // Should complete 1000 operations in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100)
    })

    it('cn performs well with many calls', () => {
      const start = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        cn(
          'base-class',
          i % 2 === 0 && 'even',
          `iteration-${i}`,
          { active: i % 3 === 0 }
        )
      }
      
      const end = performance.now()
      const duration = end - start
      
      // Should complete 1000 operations in reasonable time (less than 50ms)
      expect(duration).toBeLessThan(50)
    })
  })
})