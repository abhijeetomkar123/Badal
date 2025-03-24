module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "stream": require.resolve("stream-browserify"),
          "crypto": require.resolve("crypto-browserify"),
          "url": require.resolve("url/"),
          "util": require.resolve("util/"),
          "assert": require.resolve("assert/"),
          "zlib": require.resolve("browserify-zlib"),
          "path": require.resolve("path-browserify"),
          "fs": false,
          "net": false,
          "tls": false,
          "buffer": require.resolve("buffer/"),
          "process": require.resolve("process/browser")
        }
      }
    }
  }
}; 