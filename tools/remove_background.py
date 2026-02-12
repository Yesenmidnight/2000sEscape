#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量去除图片纯色背景工具
将图片中的背景色转换为透明，只保留主体内容

使用方法:
    python remove_background.py <输入文件夹> [输出文件夹] [选项]

示例:
    python remove_background.py ./input_images ./output_images
    python remove_background.py ./input_images ./output_images --tolerance 30
    python remove_background.py ./input_images ./output_images --bg-color FFFFFF

参数说明:
    --tolerance: 颜色容差 (0-100)，默认20。值越大，相近颜色也会被透明化
    --bg-color: 手动指定背景色 (十六进制，如 FFFFFF)，不指定则自动检测
    --corner-detect: 从四角采样检测背景色 (默认开启)
    --edge-size: 边缘采样大小，默认10像素
"""

import os
import sys
import argparse
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("错误: 需要安装 Pillow 库")
    print("请运行: pip install Pillow")
    sys.exit(1)


def hex_to_rgb(hex_color):
    """将十六进制颜色转换为RGB元组"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb):
    """将RGB元组转换为十六进制颜色"""
    return '{:02X}{:02X}{:02X}'.format(*rgb)


def get_corner_colors(img, edge_size=10):
    """获取图片四角的颜色样本"""
    width, height = img.size
    colors = []

    # 四个角的坐标
    corners = [
        (0, 0),  # 左上
        (width - edge_size, 0),  # 右上
        (0, height - edge_size),  # 左下
        (width - edge_size, height - edge_size)  # 右下
    ]

    for x, y in corners:
        region = img.crop((x, y, x + edge_size, y + edge_size))
        # 获取该区域的主要颜色
        pixels = list(region.getdata())
        # 计算平均颜色
        r = sum(p[0] for p in pixels) // len(pixels)
        g = sum(p[1] for p in pixels) // len(pixels)
        b = sum(p[2] for p in pixels) // len(pixels)
        colors.append((r, g, b))

    return colors


def detect_background_color(img, edge_size=10):
    """
    自动检测背景颜色
    通过采样图片四角来判断背景色
    """
    corner_colors = get_corner_colors(img, edge_size)

    # 找出四角中最常见的颜色
    from collections import Counter
    color_counts = Counter(corner_colors)
    most_common = color_counts.most_common(1)[0][0]

    return most_common


def get_most_common_edge_color(img, edge_size=10):
    """
    获取图片边缘最常见的颜色（更精确的背景检测）
    """
    width, height = img.size
    edge_pixels = []

    # 采样边缘像素
    for x in range(0, width, max(1, width // 50)):
        edge_pixels.append(img.getpixel((x, 0)))
        edge_pixels.append(img.getpixel((x, height - 1)))

    for y in range(0, height, max(1, height // 50)):
        edge_pixels.append(img.getpixel((0, y)))
        edge_pixels.append(img.getpixel((width - 1, y)))

    # 统计最常见的颜色
    from collections import Counter
    color_counts = Counter(edge_pixels)
    return color_counts.most_common(1)[0][0]


def color_distance(c1, c2):
    """计算两个颜色之间的距离"""
    return ((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2) ** 0.5


def remove_background(input_path, output_path, bg_color=None, tolerance=20, edge_size=10, use_corner_detect=True):
    """
    去除图片背景

    参数:
        input_path: 输入图片路径
        output_path: 输出图片路径
        bg_color: 背景色 (R, G, B)，None则自动检测
        tolerance: 颜色容差 (0-255)
        edge_size: 边缘采样大小
        use_corner_detect: 是否使用角落检测背景色
    """
    # 打开图片
    img = Image.open(input_path)

    # 转换为 RGBA 模式
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    width, height = img.size
    pixels = img.load()

    # 如果没有指定背景色，则自动检测
    if bg_color is None:
        if use_corner_detect:
            bg_color = detect_background_color(img, edge_size)
        else:
            bg_color = get_most_common_edge_color(img, edge_size)

    # 如果背景色是RGBA格式，只取RGB
    if len(bg_color) == 4:
        bg_color = bg_color[:3]

    print(f"  背景色: RGB({bg_color[0]}, {bg_color[1]}, {bg_color[2]}) = #{rgb_to_hex(bg_color)}")

    # 计算容差阈值
    threshold = tolerance * 2.55  # 转换为0-255范围

    # 遍历所有像素
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]

            # 计算与背景色的距离
            dist = color_distance((r, g, b), bg_color)

            # 如果颜色接近背景色，设置透明度
            if dist <= threshold:
                # 根据距离设置透明度，实现边缘平滑
                new_alpha = int((dist / threshold) * 255) if threshold > 0 else 0
                pixels[x, y] = (r, g, b, new_alpha)
            # 如果在容差范围的1.5倍内，做渐变处理
            elif dist <= threshold * 1.5:
                factor = (dist - threshold) / (threshold * 0.5)
                new_alpha = int(factor * 255)
                pixels[x, y] = (r, g, b, max(a, new_alpha))

    # 保存图片
    img.save(output_path, 'PNG')
    return True


def process_folder(input_folder, output_folder, bg_color=None, tolerance=20, edge_size=10, use_corner_detect=True):
    """
    批量处理文件夹中的所有图片
    """
    input_path = Path(input_folder)
    output_path = Path(output_folder)

    # 支持的图片格式
    supported_formats = {'.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff', '.webp'}

    # 获取所有图片文件
    image_files = []
    for ext in supported_formats:
        image_files.extend(input_path.glob(f'*{ext}'))
        image_files.extend(input_path.glob(f'*{ext.upper()}'))

    if not image_files:
        print(f"在 {input_folder} 中没有找到支持的图片文件")
        return

    print(f"找到 {len(image_files)} 个图片文件")
    print(f"容差设置: {tolerance}")
    print("-" * 50)

    # 创建输出文件夹
    output_path.mkdir(parents=True, exist_ok=True)

    # 处理每个图片
    success_count = 0
    for i, img_file in enumerate(image_files, 1):
        print(f"[{i}/{len(image_files)}] 处理: {img_file.name}")

        # 输出文件名（始终保存为PNG以保留透明度）
        output_file = output_path / (img_file.stem + '.png')

        try:
            remove_background(
                str(img_file),
                str(output_file),
                bg_color=bg_color,
                tolerance=tolerance,
                edge_size=edge_size,
                use_corner_detect=use_corner_detect
            )
            success_count += 1
            print(f"  -> 保存到: {output_file.name}")
        except Exception as e:
            print(f"  -> 错误: {e}")

    print("-" * 50)
    print(f"处理完成! 成功: {success_count}/{len(image_files)}")
    print(f"输出文件夹: {output_path.absolute()}")


def main():
    parser = argparse.ArgumentParser(
        description='批量去除图片纯色背景工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s ./input ./output
  %(prog)s ./input ./output --tolerance 30
  %(prog)s ./input ./output --bg-color FFFFFF --tolerance 10
        """
    )

    parser.add_argument('input', help='输入图片文件夹')
    parser.add_argument('output', help='输出图片文件夹')
    parser.add_argument('--tolerance', '-t', type=int, default=20,
                        help='颜色容差 (0-100), 默认20。值越大，相近颜色也会被透明化')
    parser.add_argument('--bg-color', '-b', type=str, default=None,
                        help='手动指定背景色 (十六进制，如 FFFFFF 或 #FFFFFF)')
    parser.add_argument('--edge-size', '-e', type=int, default=10,
                        help='边缘采样大小(像素), 默认10')
    parser.add_argument('--no-corner', action='store_true',
                        help='禁用角落检测，使用边缘采样')

    args = parser.parse_args()

    # 解析背景色
    bg_color = None
    if args.bg_color:
        try:
            bg_color = hex_to_rgb(args.bg_color)
            print(f"使用指定背景色: RGB{bg_color}")
        except ValueError:
            print(f"错误: 无效的颜色格式 '{args.bg_color}'")
            sys.exit(1)

    # 检查输入文件夹
    if not os.path.isdir(args.input):
        print(f"错误: 输入文件夹不存在 '{args.input}'")
        sys.exit(1)

    # 处理图片
    process_folder(
        args.input,
        args.output,
        bg_color=bg_color,
        tolerance=args.tolerance,
        edge_size=args.edge_size,
        use_corner_detect=not args.no_corner
    )


if __name__ == '__main__':
    main()
