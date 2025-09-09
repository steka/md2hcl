#!/usr/bin/env node
// -------------------------------------------------
//   Convert Markdown to Drawj2d HCL
// -------------------------------------------------

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const headingScale = [1.6, 1.5, 1.4, 1.3, 1.2, 1.1];

// Define the 'splitLines' function that splits a string into an array of lines.
const splitLines = str => str.split(/\r?\n/);

// ------------------------------------------------------------------
// Core rendering function – maps Marked tokens to HCL snippets
function renderTokensToHCL(tokens) {
  const out = [];

  out.push('set font Lines')
  out.push('set style plain')
  out.push('set fontsize 3');
  out.push('set left_margin 12');
  out.push('set lines_width 140');
  out.push('font $font $style $fontsize');
  out.push('moveto $left_margin $fontsize');

  tokens.forEach( token => {
    switch (token.type) {

      case 'heading':
        out.push(`font $font bold [expr $fontsize * ${headingScale[token.depth-1]} ]`);
        if (token.depth < 3) {
          out.push('block');
          out.push('moverel 0 1');
          out.push('linerel $lines_width 0');
          out.push('endblock');
        }
        out.push(`text "${ token.text.replace(/["\\\[\$]/g, match => '\\' + match)}" $lines_width`);
        out.push('font $font $style $fontsize');
        out.push('moverel 0 [expr $fontsize / 2]');
        break;

      case 'paragraph':
        out.push(`text "${ token.text.replace(/["\\\[\$]/g, match => '\\' + match)}" $lines_width`);
        break;

      case 'space':
        out.push('moverel 0 [expr $fontsize / 2]');
        break;

      case 'list':
        token.items.forEach((item) => {
          out.push(`text "* ${item.text.replace(/["\\\[\$]/g, match => '\\' + match)}" $lines_width`);
        });
        break;

      default:
        out.push('font $font bold [expr $fontsize * 1.5]');
        out.push('text "**NOT IMPLEMENTED YET!**"');
        out.push('font LinesMono $style $fontsize');

        splitLines(token.raw).forEach((line) => {
          out.push(`text "${ line.replace(/["\\\[\$]/g, match => '\\' + match)}" $lines_width`);
        });
        out.push('font $font $style $fontsize');

        console.warn(`⚠️  Unhandled token type: ${ token.type}`);
        break;
    }
  });

  return out.join('\n');
}

// ------------------------------------------------------------------
// CLI handling
if (process.argv.length < 3) {
  console.error('Usage: node md2hcl.js <markdown-file>');
  process.exit(1);
}
const mdPath = path.resolve(process.argv[2]);
const markdown = fs.readFileSync(mdPath, 'utf8');

// Parse token stream
const tokens = marked.lexer(markdown);

// Convert to Drawj2d HCL
let hcl = renderTokensToHCL(tokens);

// Write result
const outPath = mdPath.replace(/\.md$/i, '.hcl');
fs.writeFileSync(outPath, hcl);
console.log(`✅ HCL written to ${outPath}`);
