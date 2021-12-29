import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import css from 'rollup-plugin-css-only';
import path from 'path'

const production = !process.env.ROLLUP_WATCH;

const emitCss = false
const cmp = path.basename(__dirname)

export default {
	input: 'src/index.ts',
	output: {
		format: 'es',
		file: 'dist/index.js',
		sourcemap: true
	},
	plugins: [
		json(),
		svelte({
			emitCss,
			preprocess: sveltePreprocess({ sourceMap: !production }),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		emitCss && css({ output: `${cmp}.css`}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production,
			include: [
				'src/**',
				'../../src/interfaces/**/*'
			],
			resolveJsonModule: true,
		}),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
