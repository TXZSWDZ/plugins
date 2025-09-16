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
export type Mode = 'global' | 'import' | 'directive'

export type PermissionRenderMode = 'disabled' | 'hide' // 禁用/隐藏

export type PermissionCase = 'lower' | 'upper' | 'original' // 大小写：小写/大写/保持原始

export type PermissionSeparator = '.' | '-' // 间隔符：仅支持 . 或 -（避免特殊字符冲突）

export interface ImportConfig {
  name: string // 导入的函数名（如 'hasPermission'）
  from: string // 导入路径（如 '@/utils/permission'）
}

export interface permissionFnConfig {
  fn: (permission: string | string[]) => boolean
  injectToScriptSetup?: boolean // 针对 <script setup>，是否注入函数到脚本
  injectedFnName?: string // 用于 'function' 模式的自定义函数：注入的函数名（如 '__autoPermissionFn'）
  requiredData?: string | ImportConfig | ImportConfig[]
}

export interface Options {
  mode?: Mode // 模式
  srcDir?: string // 源目录
  componentMap?: string[] // 添加权限组件集合
  buttonMap?: Record<string, string> // 按钮权限标识符映射集合
  renderMode?: PermissionRenderMode // 禁用/隐藏控制，默认 'disabled'
  stringCase?: PermissionCase // 大小写控制，默认 'lower'
  separator?: PermissionSeparator // 间隔符，默认 '.'
  prefix?: string // 统一默认前缀，默认 ''（无）

  global?: string// 用于 'global' 模式：自定义全局配置

  // functionConfig?: permissionFnConfig // 用于 'function' 模式：自定义函数配置

  importConfig?: ImportConfig // 用于 'import' 模式：自定义导入配置

  directive?: string// 用于 'directive' 模式：自定义指令名（如 'v-permission'）

}
