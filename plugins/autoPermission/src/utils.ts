/**
 * @file 文件名/功能概述
 * @description 文件详细描述
 * @author WangZe
 * @createTime 2025-09-08 10:31
 * @lastModifyTime 2025-09-08 10:31
 * @version 0.0.0
 * @copyright © 2024 公司/团队名称
 * @license MIT/Apache等开源协议(可选)
 */

export const objectToString = () => Object.prototype.toString

export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && objectToString().call(val).slice(8, -1) === 'Object'
}

export function isArray(val: unknown): val is Array<any> {
  return Array.isArray(val)
}
