module.exports = {
	entry : './src/typescript/App.ts',
	output: {
		path: __dirname + '/app/files/js',
		filename: 'script.js',
		libraryTarget: 'commonjs2'
	},
	module: {
		loaders: [
			{ test: /\.tsx?$/, loader: 'ts-loader' }
		]
	},
	externals: [
		'child_process'
	],
	resolve: {
		alias: {
			'vue$' : 'vue/dist/vue.esm.js'
		}
	}
};