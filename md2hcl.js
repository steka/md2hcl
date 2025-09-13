#!/usr/bin/env node
// -------------------------------------------------
//   Convert Markdown to Drawj2d HCL
// -------------------------------------------------
//
// https://drawj2d.sourceforge.io/drawj2d_en.pdf

const fs = require('fs');
const path = require('path');
const marked = require('marked'); // Documentation at: https://marked.js.org
const headingScale = [1.6, 1.5, 1.4, 1.3, 1.2, 1.1];
const showinfo = false;

const header = `\
set font Lines
set style plain
set fontsize 3
set left_margin 14
set right_margin 150
set indent 3
font $font $style $fontsize
pen black 0.25 solid
moveto $left_margin 0
`;

// From: Drawj2d\doc\util\util.hcl (v1.3.4)
const tablefunc = `\
proc table {tabs vertdist entries} {
    assert "[llen $tabs] > 0"
    block
    set i 0
    foreach entry $entries {
        set pos [here]
        eval $entry
        moveto $pos
        if {< $i [llen $tabs]} {set tab [lindex $tabs $i]}
        moverel [mm $tab] 0
        incr $i
    }
    endblock
    if {= 0 $vertdist} {text} else {moverel 0 [mm $vertdist]}
}
`;

globalThis.blockLevel = 0;
globalThis.listLevel = 0;

// Define the 'splitLines' function that splits a string into an array of lines.
const SplitLines = str => str.split(/\r?\n/);

function PrepareText(text) {
    text = text.replace(/["\\\[\$]/g, match => '\\' + match); // Escape some characters that needs it.
    text = text.replace(/\n/g, ' '); // Replace line breaks with spaces
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
            str += `text "${line.replace(/["\\\[\$]/g, match => '\\' + match)}" [expr $right_margin - [X [here]]]\n`;
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
            str += `text "${line.replace(/["\\\[\$]/g, match => '\\' + match)}" [expr $right_margin - [X [here]]]\n`;
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
            str += 'set xpos [X [here]]\n'
            str += 'line $xpos [Y [here]] [expr $right_margin - $left_margin] [Y [here]]\n';
            if (token.depth == 1) {
                str += 'moverel 0 0.5\n';
                str += 'line $xpos [Y [here]] [expr $right_margin - $left_margin] [Y [here]]\n';
            }
            str += 'endblock\n';
        }
        let text = PrepareText(this.parser.parseInline(token.tokens));
        SplitLines(text).forEach((line) => {
            str += `text "${line}" [expr $right_margin - [X [here]]]\n`;
        });
        str += 'font $font $style $fontsize\n';
        str += `moverel 0 [expr -$fontsize * ${headingScale[token.depth-1]}]\n`;
        if (token.depth == 1) {
            str += 'moverel 0 0.5\n';
        }
        return str;
    },
    hr(token) {
        let str = `\n# ${token.type.toUpperCase()} TOKEN (raw: ${token.raw})\n`;
        str += 'block\n';
        str += 'line 0 0 [expr $right_margin - $left_margin] 0\n';
        str += 'endblock\n';
        return str;
    },
    list(token) {
        globalThis.listLevel += 1;
        let str = `\n# ${token.type.toUpperCase()} TOKEN\n`;
        let prefix = token.ordered ? token.start : '•';
        str += `moverel $indent 0\n`;
        token.items.forEach((item) => {
            str += 'block\n';
            str += `moverel 0 $fontsize\n`;
            str += `text "${token.ordered ? prefix + '.' : prefix}"\n`;
            str += 'endblock\n';
            str += `moverel [expr $fontsize * ${token.ordered ? (prefix + ".").length * 0.6 : 0.6}] 0\n`;
            str += this.parser.parse(item.tokens);
            str += `moverel [expr $fontsize * -${token.ordered ? (prefix + ".").length * 0.6 : 0.6}] 0\n`;
            if (token.ordered) prefix += 1;
        });
        str += `moverel -$indent 0\n`;
        globalThis.listLevel -= 1;
        return str;
    },
    listitem(token)   {return NotImplementedYet(token);},
    checkbox(token)   {return NotImplementedYet(token);},
    paragraph(token) {
        let str = `\n# ${token.type.toUpperCase()} TOKEN\n`;
        str += `moverel 0 $fontsize\n`;
        let text = PrepareText(this.parser.parseInline(token.tokens));
        SplitLines(text).forEach((line) => {
            str += `text "${line}" [expr $right_margin - [X [here]]]\n`;
        });
        str += `moverel 0 -$fontsize\n`;
        return str;
    },
    table(token) {
        let str = `\n# ${token.type.toUpperCase()} TOKEN\n`;
        str += `moverel 0 $fontsize\n`;
        str += "set tab { ";
        token.header.forEach(() => {
            str += "20 ";
        });
        str += "}\n";

        str += 'set total 0\n';
        str += 'foreach n $tab {set total [expr $total + $n]}\n';

        str += "table $tab 0 { ";
        token.header.forEach((header) => {
            let text =  PrepareText(this.parser.parseInline(header.tokens));
            str += `{text "${text}"} `;
        });
        str += "}\n";

        str += 'block\n';
        str += 'moverel 0 [expr -$fontsize*1.2]\n';
        str += `linerel $total 0\n`;
        str += 'endblock\n';

        token.rows.forEach((row) => {
            str += "table $tab 0 { ";
            row.forEach((cell) => {
                let text =  PrepareText(this.parser.parseInline(cell.tokens));
                str += `{text "${text}"} `;
            });
            str += "}\n";
        });
        str += `moverel 0 -$fontsize\n`;
        return str;
    },
    tablerow(token)   {return NotImplementedYet(token);},
    tablecell(token)  {return NotImplementedYet(token);},

    // span level renderer
    strong(token)     {return this.parser.parseInline(token.tokens);},
    em(token)         {return this.parser.parseInline(token.tokens);},
    codespan(token)   {return token.text},
    br(token)         {return '<BR>'}, // To split into text lines later
    del(token)        {return this.parser.parseInline(token.tokens);},
    link(token)       {return token.raw;},
    image(token)      {return token.raw;},
    text(token)       {return token.text;},
    html(token) {
        if (token.text.match(/^<\/?br>$/i)) {
            return '<BR>'; // Keep the BR (in uppercase), to split into text lines later
        } else {
            token.raw = token.raw.replace(/<!--[\s\S]*?-->/g, ""); // Remove HTML comments
            return NotImplementedYet(token);
        }
    }
};

// ------------------------------------------------------------------
// CLI handling
if (process.argv.length < 4) {
  console.error('Usage: md2hcl.js {inputfile} {outputfile}');
  process.exit(1);
}
const mdPath = path.resolve(process.argv[2]);
const hclPath = path.resolve(process.argv[3]);

const markdown = fs.readFileSync(mdPath, 'utf8');
marked.use({ renderer });

// Write result
fs.writeFileSync(hclPath, header + tablefunc + marked.parse(markdown));
console.log(`✅ HCL written to ${hclPath}`);
