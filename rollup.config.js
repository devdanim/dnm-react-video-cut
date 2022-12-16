import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const moduleName = 'DnmVideoCut';
const distName = 'dnm-react-video-cut';

const external = {
    es: [
        'react',
        'react-dom',
        'prop-types',
        'lodash-es/throttle',
        'dnm-react-smartcroppr'
    ],
    umd: ['react', 'react-dom', 'prop-types', 'dnm-react-smartcroppr']
};

const rollupConfig = ['es', 'umd'].map(format => ({
    input: 'src/index.js',
    output: {
        file: `dist/${distName}.${format}`,
        format,
        name: moduleName,
        globals: format === 'umd' ? {
            react: 'React',
            'react-dom': 'ReactDOM',
            'prop-types': 'PropTypes',
            'dnm-react-smartcroppr': 'SmartCroppr'
        } : null
    },
    external: external[format],
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**'
        }),
        commonjs(),
        postcss({
            extensions: ['.css']
        })
    ]
}));

export default rollupConfig;