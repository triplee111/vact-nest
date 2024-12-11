/**
 * CN 數字格式
 */
export function cnFormat(numbers: number | string): string {
  if (typeof numbers === 'string') {
    return parseFloat(numbers).toLocaleString()
  }

  return numbers ? numbers.toLocaleString() : '0'
}

/**
 * VN 數字格式
 */
export function vnFormat(numbers: number | string): string {
  if (typeof numbers === 'string') {
    return parseFloat(numbers).toLocaleString('de-DE')
  }

  return numbers ? numbers.toLocaleString('de-DE') : '0'
}
