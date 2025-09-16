/**
 * @file 文件名/功能概述
 * @description 文件详细描述
 * @author WangZe
 * @createTime 2025-09-16 15:37
 * @lastModifyTime 2025-09-16 15:37
 * @version 0.0.0
 * @copyright © 2024 公司/团队名称
 * @license MIT/Apache等开源协议(可选)
 */

import type { Plugin } from 'vite'

import type { Options } from './type'

import { parse } from '@vue/compiler-sfc'
import MagicString from 'magic-string'

export default function vue3ScriptName(options?: Options): Plugin {
  const {
    include = 'src',
  } = options || {}
  function filterId(id: string): boolean {
    if (id.includes('node_modules'))
      return false

    if (typeof include === 'string' && id.includes(include))
      return id.endsWith('.vue')

    if (Array.isArray(include) && include.some(item => id.includes(item)))
      return id.endsWith('.vue')

    return false
  }

  const hasNameInDefineOptionsReg = /defineOptions\s*\(\s*\{[\s\S]*?\bname\b\s*[:=][\s\S]*?\}\s*\)/

  function hasNameInDefineOptions(code: string): boolean {
    return hasNameInDefineOptionsReg.test(code)
  }

  const noNameInDefineOptionsReg = /defineOptions\s*\(\s*\{[\s\S]*?\}\s*\)/ //
  function noNameInDefineOptions(code: string): boolean {
    return noNameInDefineOptionsReg.test(code)
  }
  return {
    name: 'vite-vue3-script-name',
    enforce: 'pre',
    transform(code, id) {
      if (!filterId(id))
        return null

      try {
        const { descriptor } = parse(code)

        const scriptSetup = descriptor.scriptSetup

        if (!scriptSetup)
          return null

        if (hasNameInDefineOptions(code)) {
          return null
        }

        const s = new MagicString(code)
        let hasModified = false

        const scriptName = scriptSetup.attrs.name

        if (!scriptName)
          return null

        if (noNameInDefineOptions(code)) {
          const index = code.indexOf('defineOptions') + 'defineOptions'.length + 2
          s.prependRight(index, `\nname: '${scriptName}',\n`)
        }
        else {
          const injectCode = `\ndefineOptions({ name: '${scriptName}' });\n`
          s.prependRight(scriptSetup.loc.start.offset, injectCode)
        }

        s.replace(/\s*name="[^"]+"\s*/, '')

        hasModified = true

        if (hasModified) {
          return {
            code: s.toString(),
            map: s.generateMap({ hires: true, source: id }),
          }
        }
      }
      catch (err: any) {
        this.error(`[vite-plugin-vue-script-name] 解析 ${id} 失败：${err.message}`)
      }

      return null
    },
  }
}
