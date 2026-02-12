#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量裁剪透明边缘工具
自动检测图片的透明边界并裁剪，只保留有内容的区域

使用方法:
    python trim_transparent.py <input_folder> [output_folder]

示例:
    python trim_transparent.py ./input ./output
    python trim_transparent.py ./input  (输出到 input/_trimmed)
"""

import os
import sys
import argparse
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow library required")
    print("Run: pip install Pillow")
    sys.exit(1)


def get_bounding_box(img, alpha_threshold=10):
    """
    Get the bounding box of non-transparent content
    Returns (left, top, right, bottom) or None if image is fully transparent
    """
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    width, height = img.size
    pixels = img.load()

    # Initialize bounds to opposite extremes
    left = width
    top = height
    right = 0
    bottom = 0

    found_content = False

    # Scan all pixels to find content bounds
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # If pixel is not transparent (alpha > threshold)
            if a > alpha_threshold:
                found_content = True
                if x < left:
                    left = x
                if x > right:
                    right = x
                if y < top:
                    top = y
                if y > bottom:
                    bottom = y

    if not found_content:
        return None

    # Add 1 to right and bottom because they're exclusive in crop
    return (left, top, right + 1, bottom + 1)


def trim_transparent(input_path, output_path, alpha_threshold=10, padding=0):
    """
    Trim transparent edges from an image

    Parameters:
        input_path: Input image path
        output_path: Output image path
        alpha_threshold: Alpha value threshold (0-255), pixels below this are considered transparent
        padding: Extra padding to add around the content (pixels)
    """
    img = Image.open(input_path)

    # Convert to RGBA if needed
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Get bounding box of content
    bbox = get_bounding_box(img, alpha_threshold)

    if bbox is None:
        print(f"  Warning: Image is fully transparent, skipping")
        return False

    left, top, right, bottom = bbox

    # Add padding if specified
    if padding > 0:
        left = max(0, left - padding)
        top = max(0, top - padding)
        right = min(img.width, right + padding)
        bottom = min(img.height, bottom + padding)

    # Check if trimming is needed
    original_size = (img.width, img.height)
    new_size = (right - left, bottom - top)

    if new_size == original_size:
        print(f"  No transparent edges to trim, size: {img.width}x{img.height}")
    else:
        # Crop the image
        img = img.crop((left, top, right, bottom))
        print(f"  Trimmed: {original_size[0]}x{original_size[1]} -> {img.width}x{img.height}")

    # Save the result
    img.save(output_path, 'PNG')
    return True


def process_folder(input_folder, output_folder, alpha_threshold=10, padding=0):
    """
    Process all images in a folder
    """
    input_path = Path(input_folder)
    output_path = Path(output_folder)

    # Supported image formats
    supported_formats = {'.png'}  # Only PNG supports transparency

    # Get all PNG files
    image_files = []
    for ext in supported_formats:
        image_files.extend(input_path.glob(f'*{ext}'))
        image_files.extend(input_path.glob(f'*{ext.upper()}'))

    if not image_files:
        print(f"No PNG files found in {input_folder}")
        print("Note: Only PNG files support transparency")
        return

    print(f"Found {len(image_files)} PNG files")
    print(f"Alpha threshold: {alpha_threshold}")
    if padding > 0:
        print(f"Padding: {padding} pixels")
    print("-" * 50)

    # Create output folder
    output_path.mkdir(parents=True, exist_ok=True)

    # Process each image
    success_count = 0
    for i, img_file in enumerate(image_files, 1):
        print(f"[{i}/{len(image_files)}] Processing: {img_file.name}")

        output_file = output_path / img_file.name

        try:
            if trim_transparent(str(img_file), str(output_file), alpha_threshold, padding):
                success_count += 1
        except Exception as e:
            print(f"  Error: {e}")

    print("-" * 50)
    print(f"Done! Processed: {success_count}/{len(image_files)}")
    print(f"Output folder: {output_path.absolute()}")


def main():
    parser = argparse.ArgumentParser(
        description='Trim transparent edges from PNG images',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s ./input ./output
  %(prog)s ./input ./output --padding 2
  %(prog)s ./input ./output --threshold 5
        """
    )

    parser.add_argument('input', help='Input folder containing PNG images')
    parser.add_argument('output', nargs='?', help='Output folder (default: input/_trimmed)')
    parser.add_argument('--threshold', '-t', type=int, default=10,
                        help='Alpha threshold (0-255), pixels below this are transparent (default: 10)')
    parser.add_argument('--padding', '-p', type=int, default=0,
                        help='Padding to add around content in pixels (default: 0)')

    args = parser.parse_args()

    # Set default output folder
    output = args.output
    if output is None:
        output = os.path.join(args.input, '_trimmed')

    # Check input folder
    if not os.path.isdir(args.input):
        print(f"Error: Input folder not found '{args.input}'")
        sys.exit(1)

    # Process images
    process_folder(
        args.input,
        output,
        alpha_threshold=args.threshold,
        padding=args.padding
    )


if __name__ == '__main__':
    main()
