/// <reference types="./webpack-config" />
// https://github.com/TypeStrong/ts-node#help-my-types-are-missing
import path from "path";
import {Configuration, ProvidePlugin, ProgressPlugin, DefinePlugin} from "webpack";
import {VueLoaderPlugin} from "vue-loader";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import {CleanWebpackPlugin} from "clean-webpack-plugin";
import BundleAnalyzerPlugin from "webpack-bundle-analyzer/lib/BundleAnalyzerPlugin";

const webpackConfig: Configuration = {
    mode: process.env["NODE_ENV"] as any,
    target: "web",
    entry: {
        background: "./src/background/background.ts",
        content: "./src/content/content.ts",
        options: "./src/options/options.ts"
    },
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "[name].js"
    },
    devtool: false,
    module: {
        rules: [
            {
                // Vue single file components
                test: /\.vue$/,
                use: ["vue-loader"]
            },
            {
                // TypeScript
                test: /\.ts$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        appendTsSuffixTo: [/\.vue$/],
                        transpileOnly: true
                    }
                }
            },
            {
                // HTML
                test: /\.html$/,
                exclude: /options\.html$/,
                use: "html-loader"
            },
            {
                // CSS
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader, {
                        loader: "css-loader",
                        options: {
                            // Do not process urls that use a root path
                            // These may be static resources that do not need
                            // to be processed by Webpack (fonts/images etc)
                            url: {
                                filter: (url: string) => !url.startsWith("/")
                            }
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    "postcss-import",
                                    "tailwindcss",
                                ],
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new DefinePlugin({
            __VUE_OPTIONS_API__: false,
            __VUE_PROD_DEVTOOLS__: false
        }),
        new ForkTsCheckerWebpackPlugin({
            async: false,
            typescript: {
                extensions: {
                    vue: {
                        enabled: true,
                        compiler: "vue/compiler-sfc"
                    }
                },
                mode: "readonly"
            },
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css"
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: "images/icon-green-128.png", to: "icon-128.png"},
                "options.html",
                "manifest.json",
                "images/**/*",
                "fonts/**/*"
            ]
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false
        }),
        new ProgressPlugin({
            activeModules: true
        }),
        new ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
        })
    ],
    optimization: {
        minimize: false,
        splitChunks: {
            cacheGroups: {
                /*
                // Manifest v3 doesn't seem to support bundle splitting
                backgroundVendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "background-vendor",
                    enforce: true,
                    chunks: (chunk) => {
                        return chunk.name === "background";
                    }
                },
                */
                contentVendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "content-vendor",
                    enforce: true,
                    chunks: (chunk) => {
                        return chunk.name === "content";
                    }
                },
                optionsVendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "options-vendor",
                    enforce: true,
                    chunks: (chunk) => {
                        return chunk.name === "options";
                    }
                }
            }
        }
    },
    resolve: {
        alias: {
            "vue$": "vue/dist/vue.runtime.esm-bundler.js",
            // Buffer polyfill
            "buffer$": "buffer/index.js"
        },
        extensions: [".ts", ".js", ".vue"],
    }
};

export default webpackConfig;
