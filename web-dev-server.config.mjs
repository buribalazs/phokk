import { esbuildPlugin } from '@web/dev-server-esbuild'

export default {
    open: false,
    nodeResolve: true,
    appIndex: 'src/index.html',
    rootDir: 'src/',
    watch: true,

    plugins: [
        esbuildPlugin({
            ts: true,
            target: 'esnext',
            sourcemap: true
        })
    ],
};