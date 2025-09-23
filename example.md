# Basic Syntax
## Heading level 2 (*italic*)
### Heading level 3 (**bold**)
#### Heading level 4 (***bold-italic***)
##### Heading level 5 `code`
###### Heading <br> level 6 [xyz]

### Paragraphs:
A paragraph with      different styles: **bold level 1** ****bold level2****,
  *italic* and ***bold-italic***, some characters needs to be escaped
  (double-quote: ", backspace: \, left bracket: [ and dollar: $).<br>
This paragraph also have two different \
kind of forced line break.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut commodo posuere
felis, at mattis lectus vestibulum in. Vestibulum finibus, leo sed porttitor
rhoncus, augue ex commodo enim, in accumsan diam nisl vel purus.

Sed aliquet, felis at lobortis tempor, mi lectus vestibulum erat, ut interdum
tellus orci vel arcu. Sed elementum et ligula at luctus. Phasellus suscipit
nunc et dolor luctus faucibus.

### Block quote:
> Different styles: **bold**, *italic* and ***bold-italic***, a<br>
> forced line break and some include `code`.
>
> > Suspendisse turpis odio, pulvinar in ornare nec, mollis ut neque. Nulla
> > consectetur lacinia lorem a pharetra. Vivamus eget urna velit. Ut nec
> > augue sapien. Vivamus eu vehicula erat. Integer semper lectus eu orci
> > egestas, sed rutrum risus dapibus.
>
> Quisque sed nulla a justo semper sollicitudin. Nam aliquet placerat felis.
> Quisque purus quam, pharetra eu vehicula sit amet, tincidunt gravida dui.
> Cras vel faucibus dui, non pellentesque dui.

### Ordered list:
1. First item
2. Second item
   1. abc
      1. 123
      2. 456
         - 234
         - 345
         - 456
   2. def
   3. ghi
3. Third item
4. Forth item have a forced line break
5. a5a
6. a6b
8. a7c
8. a8d
9. a9e
10. Tens item

### Unordered list:
- Apple
  - a
    - 1
    - 2
      1. 5
      2. 6
      3. 7
    - 3
  - b
  - c
- Pear
- Orange

### Inline code:
Show some code `func(arg1, arg2)` in the middle of a sentence.

### Horizontal line:
Text before horizontal line

---

Text after horizontal line

### Link:
Lorem [example.com](https://example.com "Hover over link") ipsum

### Image:
Lorem ![Markdown logo](markdown_66x40.png "Hover over image") ipsum!

# Extended syntax

### Table:
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1.1 | Cell [2.1] |
| Cell 1.2 | Cell 2.2 |
| Cell 1.3 | Cell 2.3 |

### Fenced code block:
```c
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[])
{
    printf("Hello World!\n");
    return EXIT_SUCCESS;
}
```

### Strikethrough:
The following word is ~~strikedthrough~~! *(deleted)*

### Task list:
- [x] A thing todo
- [ ] Another thing todo
- [ ] One more thing todo
