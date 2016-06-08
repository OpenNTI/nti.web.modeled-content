const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


exports = module.exports = {
	entry: './src/index.js',
	output: {
		path: 'lib/',
		filename: 'index.js',
		library: true,
		libraryTarget: 'commonjs2'
	},

	devtool: 'source-map',

	node: {
		globale: false
	},

	target: 'web',

	resolve: {
		extensions: ['', '.jsx', '.js']
	},


	externals: [
		// Every non-relative module is external
		// abc -> require("abc")
		/^[a-z\-0-9]+/i
	],


	postcss: [
		autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'iOS > 8'] })
	],


	sassLoader: {
		sourceMap: true
	},


	module: {
		preLoaders: [
			{
				test: /src.+jsx?$/,
				loader: 'baggage-loader?[file].scss'
			}
		],
		loaders: [
			{
				test: /\.js(x?)$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					sourceMaps: true
				}
			},

			{ test: /\.json$/, loader: 'json-loader' },

			{
				test: /\.(ico|gif|png|jpg|svg)$/,
				loader: 'url-loader',
				query: {
					limit: 500,
					name: 'assets/[name]-[hash].[ext]',
					mimeType: 'image/[ext]'
				}
			},

			{ test: /\.(s?)css$/, loader: ExtractTextPlugin.extract(
				'style-loader',
				'css-loader?sourceMap&-minimize!postcss-loader!resolve-url-loader!sass-loader'
				)
			}
		]
	},

	plugins: [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new ExtractTextPlugin('index.css', {allChunks: true})
	].filter(x => x)
};
