/**
 * 字首補零
 */
export function leadingZero(number: string | number, nums = 2): string {
  if (typeof number === 'string') {
    number = parseInt(number)
  }

  return number.toString().padStart(nums, '0')
}
