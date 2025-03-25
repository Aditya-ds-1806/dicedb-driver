import babel from '@rollup/plugin-babel';

export default {
    input: 'src/dicedb.js',
    output: [
        {
            file: 'build/cjs/index.js',
            format: 'cjs',
        },
        {
            file: 'build/esm/index.js',
            format: 'es',
        },
    ],
    plugins: [
        babel({
            babelHelpers: 'bundled', // Use "bundled" for libraries
            exclude: 'node_modules/**', // Skip transpiling dependencies
        }),
    ],
};
