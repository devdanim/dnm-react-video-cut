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
        'dnm-react-smartcroppr',
        '@emotion/react',
        '@wavesurfer/react'
    ],
    umd: ['react', 'react-dom', 'prop-types', 'dnm-react-smartcroppr', '@emotion/react', '@wavesurfer/react']
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
            'dnm-react-smartcroppr': 'SmartCroppr',
            '@emotion/react': 'css',
            '@emotion/react': 'jsx',
            '@wavesurfer/react': 'WavesurferPlayer'
        } : null
    },
    external: external[format],
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**'
        }),
        commonjs({
            include: 'node_modules/**',
            namedExports: {
                'node_modules/react-is/index.js': ['isMemo'],
                'node_modules/rc-util/node_modules/react-is/index.js': ['isMemo', 'isFragment'],
            },
            requireReturnsDefault: 'auto'
        }),
        postcss({
            extensions: ['.css']
        })
    ]
}));

export default rollupConfig;