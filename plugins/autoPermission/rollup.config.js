import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import typescript from 'rollup-plugin-typescript2'

import packageJson from './package.json' with { type: 'json' }

// -------------------------- 基础配置 --------------------------
const externalDependencies = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })

// -------------------------- Rollup 构建配置 --------------------------
export default [
  {
    input: './index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'esm',
        exports: 'named',
        plugins: [
          terser(),
        ],
      },
    ],
    external: (id) => {
      return externalDependencies.some(dep =>
        id === dep || id.startsWith(`${dep}/`) || id === 'process' || id === 'path',
      )
    },
    plugins: [
      typescript(),
    ],
  },
  {
    input: './index.ts',
    output: [
      {
        file: packageJson.types,
        format: 'esm',
      },
    ],
    plugins: [dts()],
  },
]
