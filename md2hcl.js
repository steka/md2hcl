#!/usr/bin/env node
// -------------------------------------------------
//   Convert Markdown to Drawj2d HCL
// -------------------------------------------------

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const headingScale = [1.6, 1.5, 1.4, 1.3, 1.2, 1.1];
const showinfo = true;

// Override function
const renderer = {
    space(token) {
        var str = '\n# SPACE TOKEN\n';
        if (showinfo) { // Indicate space length with a triangle in the left margin
          str += 'block\n';
          str += 'line -1 0 -1 [expr $fontsize / 2] -1.5 [expr $fontsize / 4] -1 0\n';
          str += 'endblock\n';
        }
        str += `moverel 0 [expr $fontsize / 2]\n`;
        return str;
    },
    code(token)       {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    blockquote(token) {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    html(token)       {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    def(token)        {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    heading(token) {
        var str = `\n# HEADING TOKEN (depth: ${token.depth})\n`;
        str += `moverel 0 [expr $fontsize * ${headingScale[token.depth-1]}]\n`;
        str += `font $font bold [expr $fontsize * ${headingScale[token.depth-1]}]\n`;
        if (token.depth < 3) {
          str += 'block\n';
          str += 'moverel 0 1\n';
          str += 'linerel $lines_width 0\n';
          str += 'endblock\n';
        }
        str += `text "${token.text.replace(/["\\\[\$]/g, match => '\\' + match).replace(/\s+/g, " ")}" $lines_width\n`;
        str += 'font $font $style $fontsize\n';
        str += `moverel 0 [expr -$fontsize * ${headingScale[token.depth-1]}]\n`;
        return str;
    },
    hr(token) {
        var str = `\n# HR TOKEN (raw: ${token.raw})\n`;
        str += 'block\n';
        str += 'line 0 0 $lines_width 0\n';
        str += 'endblock\n';
        return str;
    },
    list(token)       {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    listitem(token)   {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    checkbox(token)   {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    paragraph(token) {
        var str = '\n# PARAGRAPH TOKEN\n';
        str += `moverel 0 $fontsize\n`;
        str += `text "${token.text.replace(/["\\\[\$]/g, match => '\\' + match).replace(/\s+/g, " ")}" $lines_width\n`;
        str += `moverel 0 -$fontsize\n`;
        return str;
    },
    table(token)      {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    tablerow(token)   {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    tablecell(token)  {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},

    // span level renderer
    strong(token)     {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    em(token)         {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    codespan(token)   {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    br(token)         {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    del(token)        {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    link(token)       {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    image(token)      {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    text(token)       {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
    html(token)       {console.error(`⚠️  ${token.type.toUpperCase()} not implemented yet!`); return '';},
/*    html(token) {
        if (token.text.match(/<\/?br>/)) {
            return "\n";
        } else if (token.text.match(/<!--.*-->/)) {
            return "";
        } else {
            return "[" + token.text + "]";
        }
    },*/
};

const header = `\
set font Lines
set style plain
set fontsize 3
set left_margin 13
set lines_width 140
set indent 3
font $font $style $fontsize
moveto $left_margin 0
pen black 0.25 solid
`;

// ------------------------------------------------------------------
// CLI handling
if (process.argv.length < 3) {
  console.error('Usage: node md2hcl.js <markdown-file>');
  process.exit(1);
}
const mdPath = path.resolve(process.argv[2]);
const markdown = fs.readFileSync(mdPath, 'utf8');

marked.use({ renderer });

let hcl = header + marked.parse(markdown);

// Write result
const outPath = mdPath.replace(/\.md$/i, '.hcl');
fs.writeFileSync(outPath, hcl);
console.log(`✅ HCL written to ${outPath}`);
