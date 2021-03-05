require('dotenv').config();

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('js')
  eleventyConfig.addPassthroughCopy('css')

  let markdownIt = require("markdown-it");
  let options = {
    html: true,
    breaks: true,
    linkify: true
  };
  
  eleventyConfig.setLibrary("md", markdownIt(options));
}
