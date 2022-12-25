# ImageTemplate

This is a plugin for the Movable Type.
This plugin enables you to generate image form MTML template.

## Screenshot

![Screenshot](https://raw.githubusercontent.com/usualoma/mt-plugin-ImageTemplate/main/artwork/screenshot.jpg)

## Demo

https://youtu.be/baifEAfnACU

## Installation

1. Download an archive file from [releases](https://github.com/usualoma/mt-plugin-ImageTemplate/releases).
1. Unpack an archive file.
1. Upload unpacked files to your MT directory.

Should look like this when installed:

    $MT_HOME/
        plugins/
            ImageTemplate/
        mt-static/
            plugins/
                ImageTemplate/

## Usage

### Steps

1. Create a template module for svg data.
1. Open the asset selection modal.

### Naming rul

If you create a module with the following name for a template, it will be used as a template for images.

#### Entry

* `image_template_entry_${sort_order}_${display_name}`

#### Page

* `image_template_page_${sort_order}_${display_name}`

#### Content Data

* `image_template_content_data_${content_type_id}_${sort_order}_${display_name}`

## Requirements

* Movable Type 7

## Supported browsers

* Google Chrome

## LICENSE

Copyright (c) 2022 Taku AMANO

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
