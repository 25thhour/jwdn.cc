module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy("_redirects");

  return {
    dir: {
      input: "src",
      data: "_data",
      output: "_site",
    },
  };
};
