/**
 * @file 文件名/功能概述
 * @description 文件详细描述
 * @author WangZe
 * @createTime 2025-09-05 10:44
 * @lastModifyTime 2025-09-05 10:44
 * @version 0.0.0
 * @copyright © 2024 公司/团队名称
 * @license MIT/Apache等开源协议(可选)
 */

import type { Plugin } from 'vite'

import type { Options } from './type'

import { extname, normalize, relative, sep } from 'path'
import { cwd } from 'process'

import { parse as parseSFC } from '@vue/compiler-sfc'
import MagicString from 'magic-string'

import { buttonMap, componentMap } from './default-config'
import { isObject, isString } from './utils'

// 默认配置
const defaultOptions: Required<Options> = {
  srcDir: 'src/views',
  componentMap,
  buttonMap,
  // 格式化权限标识符
  stringCase: 'lower', // 权限标识符全小写
  separator: '.', // 间隔符用
  prefix: '', // 统一前缀
  // 全局模式
  mode: 'global',
  renderMode: 'hide',
  // global模式函数名
  global: 'hasPermission',
  // function模式配置
  // functionConfig: {
  //   fn: (permission: string | string[]) => true,
  //   injectToScriptSetup: true,
  //   injectedFnName: '__autoPermissionFn',
  //   requiredData: {
  //     name: 'buttonCodeList',
  //     from: '@/utils/permission',
  //   },
  // },
  // import模式配置
  importConfig: {
    name: 'hasPermission',
    from: '@/utils/permission',
  },
  // directive模式指令名
  directive: 'permission',
}

export function autoPermission(userOptions: Options = {}): Plugin {
  const options = { ...defaultOptions, ...userOptions }
  const {
    mode,
    srcDir,
    componentMap,
    buttonMap,
    renderMode,
    stringCase,
    separator,
    prefix,
    global,
    // functionConfig,
    importConfig,
    directive,
  } = options

  /**
   * 获取当前工作目录到指定ID路径的相对路径
   * @description 常用于文件路径处理，将绝对路径转换为相对路径格式
   * @param {string} id - 文件路径
   * @returns {string} 相对当前工作目录的文件路径
   * @example
   * // 示例用法：
   * const result = functionName('F:/web-side/web/unplugin/playgrounds/vite-project/src/views/local/test.vue');
   * // 示例结果：
   * 输出值：'src\views\local\test.vue'
   */
  function getPath(id: string): string {
    // 用 normalize 统一分隔符
    return normalize(relative(cwd(), id))
  }

  /**
   * 过滤目标文件
   * @description 过滤目标文件为vue文件并属于srcDir目录下的文件
   * @param {string} id - 文件路径
   * @returns {boolean} 符合条件为 true，否则为 false
   * @example
   * // 示例用法：
   * const result = functionName('src/views/userList/index.vue');
   * // 示例结果：
   * 输出值：true
   */
  function filter(id: string): boolean {
    const isVueFile = /\.vue$/.test(id)
    const srcDirPrefix = normalize(`${srcDir}${sep}`)
    const relativePath = getPath(id)
    const isInSrcDir = relativePath.startsWith(srcDirPrefix)
    return isVueFile && isInSrcDir
  }

  /**
   * 根据文件路径生成页面按钮级权限标识符
   * @description 补充说明（可选）
   * @param {string} id - 文件路径
   * @returns {string} 权限标识符
   * @example
   * // 示例用法：
   * const result = functionName('src/views/userList/index.vue');
   * // 示例结果
   * 输出：userlist.index
   */
  function getPagePermissionPrefix(id: string): string {
    let pathPrefix = getPath(id)
      .replace(extname(id), '')
      .replaceAll(sep, '/')
      .replace(new RegExp(`^${srcDir}\/`), '')
      .replace(/\//g, separator)

    if (prefix) {
      pathPrefix = `${prefix}${separator}${pathPrefix}`
    }

    switch (stringCase) {
      case 'lower':
        pathPrefix = pathPrefix.toLowerCase()
        break
      case 'upper':
        pathPrefix = pathPrefix.toUpperCase()
        break
      default:
        break
    }

    return pathPrefix
  }

  function extractText(node: any): string {
    let buttonText = ''

    node.children.forEach((child: any) => {
      if (child.type === 2) {
        buttonText += child.content.trim()
      }
      else if (child.type === 1) {
        buttonText += extractText(child)
      }
    })

    return buttonText
  }

  return {
    name: 'auto-permission',
    enforce: 'pre',
    async transform(code: string, id: string) {
      if (!filter(id))
        return null

      // 存储是否修改过代码
      let hasModified = false

      try {
        const { descriptor } = parseSFC(code)

        const template = descriptor.template

        const script = descriptor.script

        const scriptSetup = descriptor.scriptSetup

        const s: MagicString = new MagicString(code)

        // 存储最终在模板中调用的“权限函数名”（如 'hasPermission'、'__autoPermissionFn'）
        let templatePermissionFn = ''
        // -------------------------- 第一步：按 mode 准备权限函数（注入/导入） --------------------------
        function processScriptWithMagicString() {
          switch (mode) {
            // mode: 'global' → 用户传入全局函数名
            case 'global':
              if (!isString(global)) {
                throw new Error('[auto-permission] global mode：permissionFn must be a string.')
              }
              templatePermissionFn = global
              break
              // mode: 'function' → 用户传入自定义函数，自动注入到脚本
              // case 'function':
              //   {
              //     const {
              //       fn,
              //       requiredData,
              //       injectToScriptSetup = true,
              //       injectedFnName = '__autoPermissionFn',
              //     } = functionConfig || {}

            //     templatePermissionFn = injectedFnName
            //     if (injectToScriptSetup) {
            //       let importStr = ''
            //       if (isObject(requiredData)) {
            //         importStr = `\nimport { ${(requiredData as unknown as ImportConfig).name} } from '${(requiredData as unknown as ImportConfig).from}';\n`
            //       }
            //       else if (Array.isArray(requiredData)) {
            //         importStr = `\n${(requiredData as ImportConfig[]).map(item => `const ${item} = ref(null);`).join('\n')}`
            //       }
            //       const fnStr = fn.toString()
            //       const injectCode = `${importStr}\nconst ${injectedFnName} = ${fnStr};\n`
            //       if (scriptSetup) {
            //         s.prependRight(scriptSetup.loc.start.offset, injectCode)
            //       }
            //       else if (script) {
            //         s.prependRight(script.loc.start.offset, injectCode)
            //       }
            //       hasModified = true
            //     }
            //   }
            //   break
            // mode: 'import' → 从指定路径导入权限函数（自动添加 import 语句）
            case 'import':
              if (!isObject(importConfig)) {
                throw new Error('[auto-permission] import mode：importConfig must be an object.')
              }
              if (!importConfig.name || !importConfig.from) {
                throw new Error('[auto-permission] import mode：importConfig name or from is required.')
              }
              if (!isString(importConfig.name) || !isString(importConfig.from)) {
                throw new Error('[auto-permission] import mode：importConfig name or from must be a string.')
              }
              {
                templatePermissionFn = importConfig.name
                const importStr = `\nimport { ${importConfig.name} } from '${importConfig.from}';\n`
                if (scriptSetup) {
                  s.prependRight(scriptSetup.loc.start.offset, importStr)
                  hasModified = true
                }
                else if (script) {
                  s.prependRight(script.loc.start.offset, importStr)
                  hasModified = true
                }
              }
              break
            // mode: 'directive' → 不注入函数，给按钮添加自定义指令（由指令处理权限）
            case 'directive':
              break
          }
        }
        // -------------------------- 第二步：按 mode 处理模板调用（按钮权限逻辑） --------------------------
        function processTemplateWithMagicString(pagePrefix: string) {
          function traverseAndModify(nodes: any[]) {
            nodes.forEach((node) => {
              if (node.type !== 1)
                return

              if (componentMap.includes(node.tag)) {
                const buttonText = extractText(node)
                if (!buttonText)
                  return

                const permissionKey = buttonMap[buttonText]
                if (!permissionKey)
                  return

                const fullPermission = `${pagePrefix}${separator}${permissionKey}`

                switch (mode) {
                  // case 'function':
                  case 'global':
                  case 'import':
                    if (renderMode === 'disabled') {
                      const hasDisabled = node.props.some((p: any) => p.name === 'disabled')
                      if (!hasDisabled) {
                        const disabledContent = ` :disabled="!${templatePermissionFn}('${fullPermission}')"`
                        s.appendLeft(node.loc.start.offset + node.tag.length + 1, disabledContent)
                        hasModified = true
                      }
                    }
                    else {
                      const hasVIf = node.props.some((p: any) => p.name === 'if' && p.type === 7)
                      if (!hasVIf) {
                        const vIfContent = ` v-if="${templatePermissionFn}('${fullPermission}')"`
                        s.appendLeft(node.loc.start.offset + node.tag.length + 1, vIfContent)
                        hasModified = true
                      }
                    }
                    break

                  case 'directive':
                    {
                      const directiveContent = ` v-${directive}="['${fullPermission}']"`
                      s.appendLeft(node.loc.start.offset + node.tag.length + 1, directiveContent)
                      hasModified = true
                    }
                    break
                }
              }

              if (node.children) {
                traverseAndModify(node.children)
              }
            })
          }

          if (template && template?.ast?.children && template.ast.children.length) {
            traverseAndModify(template.ast.children)
          }
        }

        processScriptWithMagicString()
        const pagePrefix = getPagePermissionPrefix(id)
        processTemplateWithMagicString(pagePrefix)

        if (hasModified) {
          return {
            code: s.toString(),
            map: s.generateMap({ hires: true, source: id }),
          }
        }
        else {
          return null
        }
      }
      catch (error) {
        this.error(`[auto-permission] 处理 ${id} 失败：${(error as Error).message}`)
      }
    },
  }
}
