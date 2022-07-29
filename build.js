import esbuild from 'esbuild'
import fs from 'fs-extra'

fs.emptyDirSync('dist')


let importPathPlugin = {
    name: 'import-path',
    setup(build) {
        build.onResolve({ filter: /^box2d\-wasm$/ }, args => {
            return { path: `./Box2D.js`, external: true }
        })
    },
}

esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: 'dist/main.js',
    plugins:[importPathPlugin],
    legalComments: 'none',
    format: 'esm',
    // external: ['box2d-wasm']
})
    .catch(() => process.exit(1))
    .then(() => {

        let indexhtml = fs.readFileSync('src/index.html', { encoding: 'utf-8' })
        indexhtml = indexhtml.replace('main.ts', 'main.js')
        fs.writeFileSync('dist/index.html', indexhtml, { encoding: 'utf-8' })
        fs.copyFileSync('./node_modules/box2d-wasm/dist/es/Box2D.js', './dist/Box2D.js')
        fs.copyFileSync('./node_modules/box2d-wasm/dist/es/Box2D.wasm', './dist/Box2D.wasm')
        // fs.copyFileSync('src/style.css', 'dist/style.css')
        // fs.emptyDirSync('dist/static')
        // fs.copySync('src/static', 'dist/static')
    })
