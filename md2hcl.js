#!/usr/bin/env node
// -------------------------------------------------
//   Convert Markdown to Drawj2d HCL
// -------------------------------------------------

const fs = require('fs');
const path = require('path');
const marked = require('marked'); // Documentation at: https://marked.js.org
const headingScale = [1.6, 1.5, 1.4, 1.3, 1.2, 1.1];
const showinfo = true;

globalThis.blockLevel = 0;

// Define the 'splitLines' function that splits a string into an array of lines.
const SplitLines = str => str.split(/\r?\n/);

function PrepareText(text) {
    text = text.replace(/["\\\[\$]/g, match => '\\' + match); // Escape some characters that needs it.
    text = text.replace(/\n/g, ' '); // Make a multi line into a single line
    text = text.replace(/[ \t]+/g, ' '); // Replace all repeated spaces, with just one
    text = text.replace(/\s*<BR>\s*/g, '\n'); // Replace <BR> with forced newline
    return text
}

function NotImplementedYet(token) {
    let type = token.type.toUpperCase();
    let str = `\n# ${type} TOKEN\n`;
    console.error(`⚠️  ${type} not implemented yet!`);
    if (token.raw.replace(/\s+/g, '') != '') { // ignore only whitespaces
        str += 'moverel 0 $fontsize\n';
        SplitLines(token.raw.replace(/(\s*\n)*$/g, "")).forEach((line) => {
            str += `text "${line.replace(/["\\\[\$]/g, match => '\\' + match)}" $lines_width\n`;
        });
    }
    return str;
}

// Override function
const renderer = {
    space(token) {
        let str = `\n# ${token.type.toUpperCase()} TOKEN\n`;
        if (showinfo) { // Indicate space length with a triangle in the left margin
            str += 'block\n';
            str += 'line -1 0 -1 [expr $fontsize / 2] -1.5 [expr $fontsize / 4] -1 0\n';
            str += 'endblock\n';
        }
        str += `moverel 0 [expr $fontsize / 2]\n`;
        return str;
    },
    code(token) {
        let str = `\n# ${token.type.toUpperCase()} TOKEN\n`;
        str += 'font LinesMono Bold [expr $fontsize * 0.8]\n';
        str += 'moverel 3 $fontsize\n';
        SplitLines(token.text).forEach((line) => {
            str += `text "${line.replace(/["\\\[\$]/g, match => '\\' + match)}" $lines_width\n`;
        });
        str += 'moverel -3 -$fontsize\n';
        str += 'font $font $style $fontsize\n';
        return str;
    },
    blockquote(token) {
        globalThis.blockLevel += 1;
        let str = `\n# ${token.type.toUpperCase()} TOKEN\n`;
        str += `set xpos${globalThis.blockLevel} [expr [X [here]] + [expr $indent / 2]]\n`;
        str += `set ypos${globalThis.blockLevel} [Y [here]]\n`;
        str += 'moverel $indent 0\n';
        str +=  this.parser.parse(token.tokens);
        str += 'moverel -$indent 0\n';
        str += `line $xpos${globalThis.blockLevel} $ypos${globalThis.blockLevel} $xpos${globalThis.blockLevel} [Y [here]]\n`;
        str += 'moverel -[expr $indent / 2] 0\n';
        globalThis.blockLevel -= 1;
        return str;
    },
    html(token)       {return NotImplementedYet(token);},
    def(token)        {return NotImplementedYet(token);},
    heading(token) {
        let str = `\n# ${token.type.toUpperCase()} TOKEN (depth: ${token.depth})\n`;
        str += `moverel 0 [expr $fontsize * ${headingScale[token.depth-1]}]\n`;
        str += `font $font bold [expr $fontsize * ${headingScale[token.depth-1]}]\n`;
        if (token.depth < 3) {
            str += 'block\n';
            str += 'moverel 0 1\n';
            str += 'linerel $lines_width 0\n';
            str += 'endblock\n';
        }
        let text = PrepareText(this.parser.parseInline(token.tokens));
        SplitLines(text).forEach((line) => {
            str += `text "${line.replace(/["\\\[\$]/g, match => '\\' + match)}" $lines_width\n`;
        });
        str += 'font $font $style $fontsize\n';
        str += `moverel 0 [expr -$fontsize * ${headingScale[token.depth-1]}]\n`;
        return str;
    },
    hr(token) {
        let str = `\n# ${token.type.toUpperCase()} TOKEN (raw: ${token.raw})\n`;
        str += 'block\n';
        str += 'line 0 0 $lines_width 0\n';
        str += 'endblock\n';
        return str;
    },
    list(token) {
        //console.log(JSON.stringify(token, null, 2));
        let str = `\n# ${token.type.toUpperCase()} TOKEN\n`;
        str += 'moverel $indent $fontsize\n';
        prefix = token.ordered ? token.start : '-';
        token.items.forEach((item) => {
            str += `text "${prefix} ${item.text.replace(/["\\\[\$]/g, match => '\\' + match).replace(/\s+/g, " ")}" $lines_width\n`;
            if (token.ordered) prefix++;
        });
        str += 'moverel -$indent -$fontsize\n';
        return str;
    },
    listitem(token)   {return NotImplementedYet(token);},
    checkbox(token)   {return NotImplementedYet(token);},
    paragraph(token) {
        let str = `\n# ${token.type.toUpperCase()} TOKEN\n`;
        str += `moverel 0 $fontsize\n`;
        let text = PrepareText(this.parser.parseInline(token.tokens));
        SplitLines(text).forEach((line) => {
            str += `text "${line.replace(/["\\\[\$]/g, match => '\\' + match)}" $lines_width\n`;
        });
        str += `moverel 0 -$fontsize\n`;
        return str;
    },
    table(token)      {return NotImplementedYet(token);},
    tablerow(token)   {return NotImplementedYet(token);},
    tablecell(token)  {return NotImplementedYet(token);},

    // span level renderer
    strong(token)     {return this.parser.parseInline(token.tokens);},
    em(token)         {return this.parser.parseInline(token.tokens);},
    codespan(token)   {return token.text},
    br(token)         {return NotImplementedYet(token);},
    del(token)        {return this.parser.parseInline(token.tokens);},
    link(token)       {return token.raw;},
    image(token)      {return token.raw;},
    text(token)       {return token.text;},
    html(token) {
        if (token.text.match(/<\/?br>/i)) {
            return '<BR>'; // Keep the BR, to split into text lines later
        } else {
            token.raw = token.raw.replace(/<!--[\s\S]*?-->/g, ""); // Remove HTML comments
            return NotImplementedYet(token);
        }
    }
};

const header = `\
set font Lines
set style plain
set fontsize 3
set left_margin 13
set lines_width 140
set indent 3
font $font $style $fontsize
pen black 0.25 solid
moveto $left_margin 0
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

let hcl = header

if (showinfo) {
    hcl += `\
set UTIL_DIR [lindex $argv 0]
set TYPE     [lindex $argv 1]
set pos [here]
moveto 0 0
#source \${UTIL_DIR}/grid_5mm/grid_5mm.hcl
image \${UTIL_DIR}/menuopen_P.png 226.4
image \${UTIL_DIR}/pageinfo_P.png 226.4
line 0 0 156.8 0 156.8 209.1 0 209.1 0 0; # reMarkable (1 & 2) border
moveto $pos
`
}

hcl += marked.parse(markdown);

// Write result
const outPath = mdPath.replace(/\.md$/i, '.hcl');
fs.writeFileSync(outPath, hcl);
console.log(`✅ HCL written to ${outPath}`);
