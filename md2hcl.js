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
  out.push('set left_margin 13');
  out.push('set lines_width 140');
  out.push('set indent 3');
  out.push('font $font $style $fontsize');
  out.push(`moveto $left_margin [expr $fontsize * ${headingScale[0]}]`);
  out.push('pen black 0.25 solid')

  tokens.forEach( token => {
    switch (token.type) {
      case 'heading':
        out.push(`font $font bold [expr $fontsize * ${headingScale[token.depth-1]}]`);
        if (token.depth < 3) {
          out.push('block');
          out.push('moverel 0 1');
          out.push('linerel $lines_width 0');
          out.push('endblock');
        }
        out.push(`text "${ token.text.replace(/["\\\[\$]/g, match => '\\' + match).replace(/\s+/g, " ")}" $lines_width`);
        out.push('font $font $style $fontsize');
        break;

      case 'paragraph':
        out.push(`text "${ token.text.replace(/["\\\[\$]/g, match => '\\' + match).replace(/\s+/g, " ")}" $lines_width`);
        break;

      case 'space':
        break;

      case 'list':
        out.push('moverel $indent 0');
        prefix = token.ordered ? token.start : '-';
        token.items.forEach((item) => {
          out.push(`text "${prefix} ${item.text.replace(/["\\\[\$]/g, match => '\\' + match).replace(/\s+/g, " ")}" $lines_width`);
          if (token.ordered) prefix++;
        });
        out.push('moverel -$indent 0');
        break;

      case 'blockquote':
        out.push('set xpos [expr [X [here]] + [expr $indent / 2]]');
        out.push('set ypos [expr [Y [here]] - $fontsize]');
        out.push('moverel $indent 0');
        out.push(`text "${ token.text.replace(/["\\\[\$]/g, match => '\\' + match).replace(/\s+/g, " ")}" [expr $lines_width - 3]`);
        out.push('moverel -$indent 0');
        out.push('line $xpos $ypos $xpos [expr [Y [here]] - $fontsize]');
        out.push('moverel -[expr $indent / 2] $fontsize');
        break;

      case 'code':
        out.push('font LinesMono $style $fontsize');
        out.push('moverel 3 0');
        splitLines(token.text).forEach((line) => {
          out.push(`text "${ line.replace(/["\\\[\$]/g, match => '\\' + match)}" $lines_width`);
        });
        out.push('moverel -3 0');
        out.push('font $font $style $fontsize');
        break;

      case 'hr':
          out.push('block');
          out.push('moverel 0 -$fontsize');
          out.push('linerel $lines_width 0');
          out.push('endblock');
        break;

      default:
        splitLines(token.raw).forEach((line) => {
          out.push(`text "${ line.replace(/["\\\[\$]/g, match => '\\' + match)}" $lines_width`);
        });
        console.warn(`⚠️  Unknown token type: ${ token.type} (inserted as is)`);
        break;
    }
    out.push('moverel 0 [expr $fontsize / 2]');
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
