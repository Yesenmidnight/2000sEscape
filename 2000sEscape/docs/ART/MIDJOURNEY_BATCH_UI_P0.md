# Midjourney 批量生成清单 - Phase 1 UI (P0)

**版本**: 1.0
**日期**: 2026-02-08
**用途**: 第一关卡可玩所需的 UI 元件 (P0优先级)
**数量**: 7项核心 UI

---

## 使用说明

UI 元件与场景元件不同，通常需要：
1. **透明背景** - 使用 `--no background` 或后期去除
2. **可拉伸** - 设计为 9-slice 可拉伸边框
3. **多状态** - 同一元件可能有普通/悬停/选中状态
4. **尺寸灵活** - 根据实际屏幕分辨率调整

---

## 一、核心 HUD (5项)

### 1.1 物品栏/背包栏

**基础版本**
```
pixel art, 2D game UI element, inventory hotbar slots, horizontal item bar, 6 rounded square cells in a row, semi-transparent dark purple background, subtle glow border, scanline texture overlay, retro CRT monitor aesthetic, low saturation, weirdcore dreamcore style, clean minimalist design, transparent background --ar 4:1  
```

**空格子版本**
```
pixel art, 2D game UI element, empty inventory slot, single rounded square cell, semi-transparent dark background, dashed border outline, retro CRT aesthetic, low saturation, weirdcore style, transparent background --ar 1:1  
```

**选中状态**
```
pixel art, 2D game UI element, selected inventory slot, single rounded square cell with bright glow border, highlight effect, retro CRT aesthetic, low saturation with green accent, weirdcore style, transparent background --ar 1:1  
```

**尺寸**: 宽度根据屏幕比例调整，单格约 64×64px
**用途**: 屏幕左下角，快速物品访问

---

### 1.2 生命值/状态条

**基础版本**
```
pixel art, 2D game UI element, horizontal health bar, mental stability meter, long progress bar with dark background, gradient fill from green to yellow to red, glow border effect, retro VHS aesthetic, low saturation, weirdcore dreamcore style, transparent background --ar 4:1  
```

**正常状态 (绿色)**
```
pixel art, 2D game UI element, health bar segment green, stable mental state indicator, solid green fill #00ff88, dark background, glow effect, retro CRT aesthetic, weirdcore style, transparent background --ar 2:1  
```

**警告状态 (黄色)**
```
pixel art, 2D game UI element, health bar segment yellow, warning state indicator, solid yellow fill #ffcc00, slight pulse glow, retro CRT aesthetic, weirdcore style, transparent background --ar 2:1  
```

**危险状态 (红色)**
```
pixel art, 2D game UI element, health bar segment red, danger state indicator, solid red fill #ff6b9d, intense glow with glitch effect, retro CRT aesthetic, weirdcore style, transparent background --ar 2:1  
```

**尺寸**: 约 200×24px
**用途**: 屏幕左上角，精神稳定性显示

---

### 1.3 互动提示

**基础版本**
```
pixel art, 2D game UI element, interaction prompt box, rounded rectangle panel, semi-transparent dark background, keyboard key icon placeholder on left, text area on right, glow border effect, retro CRT aesthetic, low saturation, weirdcore style, transparent background --ar 3:1  
```

**按键图标 - E键**
```
pixel art, 2D game UI element, keyboard key icon, letter E key, rounded square button style, dark background with light border, retro CRT aesthetic, low saturation, weirdcore style, transparent background --ar 1:1  
```

**按键图标 - 空格键**
```
pixel art, 2D game UI element, keyboard key icon, spacebar key, long horizontal button style, dark background with light border, retro CRT aesthetic, low saturation, weirdcore style, transparent background --ar 3:1  
```

**尺寸**: 约 300×60px
**用途**: 屏幕下方中央，互动操作提示

---

### 1.4 迷你地图/方位指示

**圆形版本**
```
pixel art, 2D game UI element, circular minimap, semi-transparent dark background, compass style, player position dot in center, objective markers, noise grain effect, retro CRT aesthetic, low saturation, weirdcore dreamcore hazy style, transparent background --ar 1:1  
```

**方形版本**
```
pixel art, 2D game UI element, square minimap panel, semi-transparent dark background, simple grid pattern, player dot and direction arrow, noise grain overlay, retro CRT aesthetic, low saturation, weirdcore style, transparent background --ar 1:1  
```

**尺寸**: 约 150×150px
**用途**: 屏幕右上角，方位指示

---

### 1.5 收集品计数器

**磁带计数器**
```
pixel art, 2D game UI element, collectible counter, small info panel, cassette tape icon on left, number display area on right, semi-transparent dark background, retro CRT aesthetic, low saturation, weirdcore style, transparent background --ar 2:1  
```

**照片计数器**
```
pixel art, 2D game UI element, collectible counter, small info panel, photograph icon on left, number display area on right, semi-transparent dark background, retro CRT aesthetic, low saturation, weirdcore style, transparent background --ar 2:1  
```

**综合计数器**
```
pixel art, 2D game UI element, multiple collectible counters, vertical stack of 3 small info panels, cassette photo and disc icons, semi-transparent dark background, retro CRT aesthetic, low saturation, weirdcore style, transparent background --ar 1:2  
```

**尺寸**: 约 120×40px (单项)
**用途**: 屏幕右上角，收集进度显示

---

## 二、对话/叙事 (1项)

### 2.1 对话框

**基础版本**
```
pixel art, 2D game dialogue box, bottom screen text box, full width panel, semi-transparent dark background with rounded top border, character portrait area on left, text area on right, retro CRT aesthetic, low saturation, weirdcore dreamcore style, transparent background --ar 8:1  
```

**带头像区域**
```
pixel art, 2D game dialogue box, bottom screen panel, semi-transparent dark background, circular portrait placeholder on left, wide text area on right, subtle glow border, retro CRT aesthetic, low saturation, weirdcore style, transparent background --ar 4:1  
```

**纯文字版本**
```
pixel art, 2D game dialogue box, simple text panel, semi-transparent dark rectangle, no portrait, full width text area, retro CRT aesthetic, low saturation, weirdcore style, transparent background --ar 8:1  
```

**尺寸**: 约 1920×200px (根据屏幕)
**用途**: 屏幕下方，对话/旁白显示

---

## 三、转场效果 (1项)

### 3.1 场景淡入淡出

**黑色遮罩**
```
pixel art, 2D game transition overlay, solid black screen, fade effect, noise grain overlay, VHS static texture, scene transition, retro CRT aesthetic, weirdcore atmosphere, 1920x1080 --ar 16:9  
```

**渐变边缘遮罩**
```
pixel art, 2D game transition overlay, vignette dark edges, center transparent area, noise grain, dark gradient from edges, retro CRT aesthetic, weirdcore atmosphere, 1920x1080 --ar 16:9  
```

**VHS故障遮罩**
```
pixel art, 2D game transition overlay, VHS glitch effect, horizontal distortion lines, color shift, noise static, retro CRT aesthetic, weirdcore atmosphere, 1920x1080 --ar 16:9  
```

**尺寸**: 1920×1080
**用途**: 场景切换过渡

---

## 四、额外 UI 元素 (推荐)

### 4.1 按钮基础样式

**普通按钮**
```
pixel art, 2D game UI button, rounded rectangle, semi-transparent dark background, pixel font placeholder text, subtle border, retro CRT aesthetic, low saturation, weirdcore style, transparent background --ar 3:1  
```

**悬停按钮**
```
pixel art, 2D game UI button hover state, rounded rectangle, brighter background with glow border, pixel font text, retro CRT aesthetic, low saturation with accent color, weirdcore style, transparent background --ar 3:1  
```

**尺寸**: 约 200×50px
**用途**: 菜单、确认等

---

### 4.2 面板背景

**通用面板**
```
pixel art, 2D game UI panel background, rounded rectangle, semi-transparent dark purple background, subtle glow border, scanline texture, 9-slice tileable design, retro CRT aesthetic, low saturation, weirdcore style --ar 4:3  
```

**尺寸**: 可拉伸
**用途**: 弹窗、菜单背景

---

## 生成统计

| 分类 | 数量 | 预计生成次数 |
|------|------|-------------|
| 核心HUD | 5项 | ~12次 (含状态变体) |
| 对话框 | 1项 | ~3次 (含变体) |
| 转场效果 | 1项 | ~3次 (含变体) |
| 额外元素 | 2项 | ~4次 |
| **总计** | **9项** | **~22次** |

---

## 后期处理检查清单

- [ ] 去除背景 (透明PNG)
- [ ] 设计 9-slice 切片区域 (边框)
- [ ] 制作多状态变体 (普通/悬停/选中/禁用)
- [ ] 统一配色风格
- [ ] 测试不同分辨率下的显示效果
- [ ] 导入 RPG Maker MZ / 图片文件夹
- [ ] 配置 UI 插件参数

---

## UI 实现建议

### RPG Maker MZ 插件推荐
- **VisuStella Core Engine** - 基础 UI 自定义
- **VisuStella Message Core** - 对话框美化
- **SRD HUD Maker** - 自定义 HUD 位置
- **Moghunter** - 各类 HUD 效果

### 文件夹结构
```
img/
├── system/
│   ├── hud/
│   │   ├── inventory_bar.png
│   │   ├── inventory_slot.png
│   │   ├── health_bar_bg.png
│   │   ├── health_bar_fill.png
│   │   └── interaction_prompt.png
│   ├── dialogue/
│   │   ├── dialogue_box.png
│   │   └── portrait_frame.png
│   ├── transitions/
│   │   ├── fade_black.png
│   │   └── vhs_glitch.png
│   └── buttons/
│       ├── button_normal.png
│       └── button_hover.png
```

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-02-08 | 1.0 | 创建 Phase 1 UI 批量生成清单，共9项核心 UI |
