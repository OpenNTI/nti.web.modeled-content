exports = module.exports = Object.assign(require('./webpack.config'), {
	entry: './test/app/index.js',
	externals: [],
	output: {
		path: '/',
		filename: 'index.js',
		publicPath: '/'
	}
});
