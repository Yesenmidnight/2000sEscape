# UI 美术需求文档 - 逃离千禧年 (2000sEscape)

**版本**: 1.0
**更新日期**: 2026-02-08
**用途**: 游戏 UI 元件 Midjourney 生成参考

---

## 概述

### UI 设计原则
1. **怀旧复古** - 模拟老式 CRT 显示器、VHS 录像带效果
2. **怪核氛围** - 熟悉又陌生，温馨中透着诡异
3. **低饱和度** - 配色柔和，避免鲜艳刺眼
4. **噪点/故障感** - 轻微的视觉干扰增强氛围

### 屏幕布局
```
+----------------------------------+
|                                  |  ↑
|                                  |  |
|         游戏画面区域              |  | 4/5
|        (横版地图/角色)           |  |
|                                  |  ↓
+----------------------------------+
|  物品栏 | 状态 | 互动提示 | 菜单  |  ← 1/5 UI区域
+----------------------------------+
```

### 配色方案

| 用途 | 色值 | 说明 |
|------|------|------|
| UI背景 | #1a1a2e, #16213e | 深紫/深蓝 |
| 强调色 | #00ff88, #ff6b9d | 荧光绿/粉 |
| 文字 | #e8e8e8 | 米白 |
| 边框 | #4a4a6a | 暗紫灰 |
| 暗角 | 黑色渐变 | VHS边缘效果 |

---

## 一、核心 HUD 元件

> 游戏进行时屏幕下方/边缘显示的常驻 UI

---

### 1.1 物品栏/背包栏

#### 元件信息
- **类型**: HUD核心元件
- **位置**: 屏幕左下角
- **用途**: 快速访问物品、显示持有道具

#### 视觉描述
横向排列的物品格子，每个格子是圆角方形。背景半透明深色，边框有轻微发光效果。格子内显示物品图标，选中时有高亮边框。整体有轻微的扫描线纹理。

#### 变体
| 变体 | 描述 |
|------|------|
| 空格子 | 半透明背景，虚线边框 |
| 有物品 | 显示物品图标 |
| 选中状态 | 发光边框，放大效果 |

#### Midjourney Prompt
```
pixel art, 2D game UI element, inventory hotbar slots, horizontal item bar, rounded square cells, semi-transparent dark background with glow border, scanline texture overlay, retro CRT monitor aesthetic, low saturation dark purple blue, weirdcore dreamcore style, clean minimalist design --ar 4:1  
```

#### 游戏用途
- 显示玩家当前持有的快速物品
- 数字键 1-6 快速切换
- 拖拽整理物品

---

### 1.2 生命值/状态条

#### 元件信息
- **类型**: HUD核心元件
- **位置**: 屏幕左上角
- **用途**: 显示玩家当前生命/精神状态

#### 视觉描述
横向进度条，分为"精神值"而非传统HP。背景深色，填充色从绿渐变到黄到红（低精神时）。条形有轻微的波动/故障效果。旁边有小图标指示当前状态。

#### 变体
| 状态 | 颜色 | 效果 |
|------|------|------|
| 正常 | 绿色(#00ff88) | 稳定 |
| 警告 | 黄色(#ffcc00) | 轻微闪烁 |
| 危险 | 红色(#ff6b9d) | 剧烈闪烁+故障 |

#### Midjourney Prompt
```
pixel art, 2D game UI element, horizontal health bar, mental stability meter, gradient from green to yellow to red, dark background with glow effect, slight glitch distortion, retro VHS aesthetic, low saturation, weirdcore dreamcore style, horizontal progress bar --ar 3:1  
```

#### 游戏用途
- 显示玩家"精神稳定性"
- 低精神时出现幻觉/视野模糊
- 归零触发剧情事件

---

### 1.3 互动提示

#### 元件信息
- **类型**: HUD提示元件
- **位置**: 屏幕下方中央
- **用途**: 显示可互动物体的操作提示

#### 视觉描述
圆角矩形框，背景半透明深色。内含按键图标（如 E、空格）和简短文字说明。出现时有淡入动画，消失时淡出。边框有轻微发光。

#### Midjourney Prompt
```
pixel art, 2D game UI element, interaction prompt box, rounded rectangle, semi-transparent dark background, keyboard key icon with text instruction, glow border effect, retro CRT aesthetic, low saturation, weirdcore dreamcore style, clean readable design --ar 2:1  
```

#### 游戏用途
- 靠近可互动物体时显示
- 显示"按E查看"、"按空格翻找"等提示
- 不同互动类型有不同图标

---

### 1.4 迷你地图/方位指示

#### 元件信息
- **类型**: HUD辅助元件
- **位置**: 屏幕右上角
- **用途**: 显示当前关卡大致方位和目标

#### 视觉描述
圆形或方形的迷你地图，背景半透明。显示玩家位置（小点）、重要地点（图标）、撤离点方向。有轻微的噪点/干扰效果。不是精确地图，而是记忆碎片式的模糊指示。

#### Midjourney Prompt
```
pixel art, 2D game UI element, circular minimap, semi-transparent dark background, player dot and objective markers, noise grain effect, retro CRT aesthetic, low saturation, weirdcore dreamcore style, hazy memory fragment look --ar 1:1  
```

#### 游戏用途
- 显示玩家在关卡中的大致位置
- 标记收集品/撤离点方向
- 营造"记忆模糊"的氛围

---

### 1.5 收集品计数器

#### 元件信息
- **类型**: HUD信息元件
- **位置**: 屏幕右上角（迷你地图下方）
- **用途**: 显示已收集的记忆物品数量

#### 视觉描述
小型信息框，显示各类收集品的图标和数量。如磁带图标 + 3/10。背景半透明，图标有轻微发光。收集新物品时有数字跳动动画。

#### Midjourney Prompt
```
pixel art, 2D game UI element, collectible counter display, small info box with item icons and numbers, semi-transparent background, cassette tape and photo icons, retro CRT aesthetic, low saturation, weirdcore dreamcore style, minimalist design --ar 2:1  
```

#### 游戏用途
- 显示关卡收集进度
- 分类显示：磁带、光碟、照片等
- 激励探索

---

## 二、菜单系统

> 游戏暂停、设置等全屏/弹窗菜单

---

### 2.1 主菜单背景

#### 元件信息
- **类型**: 全屏背景
- **用途**: 游戏启动/主菜单的视觉基底

#### 视觉描述
模糊的童年场景背景（如黄昏的小巷、空荡的教室），叠加 VHS 扫描线、噪点、暗角效果。中央有游戏标题，下方是菜单选项。整体散发怀旧、孤寂的氛围。

#### Midjourney Prompt
```
pixel art, 2D game main menu background, blurry Chinese childhood scene year 2000, dusk alley or empty classroom, VHS scanlines overlay, noise grain, vignette dark edges, nostalgic lonely atmosphere, weirdcore dreamcore, low saturation, retro CRT aesthetic --ar 16:9  
```

#### 游戏用途
- 主菜单的视觉背景
- 营造游戏整体氛围
- 可随章节变化

---

### 2.2 主菜单按钮

#### 元件信息
- **类型**: 菜单交互元件
- **用途**: 开始游戏、设置、退出等选项

#### 视觉描述
简洁的文字按钮，悬停时有发光效果和轻微抖动。背景可以是半透明矩形或无背景纯文字。选中时有 VHS 故障效果闪烁。字体是像素风格的中文。

#### 变体
| 状态 | 效果 |
|------|------|
| 普通 | 正常显示 |
| 悬停 | 发光 + 轻微放大 |
| 选中 | 故障闪烁 + 声音 |

#### Midjourney Prompt
```
pixel art, 2D game menu button set, text buttons with glow hover effect, semi-transparent background option, VHS glitch effect on select, retro CRT aesthetic, low saturation, weirdcore dreamcore style, Chinese pixel font style --ar 1:3  
```

#### 游戏用途
- 开始新游戏
- 继续游戏
- 设置
- 退出

---

### 2.3 暂停菜单

#### 元件信息
- **类型**: 弹窗菜单
- **用途**: 游戏中按ESC暂停

#### 视觉描述
游戏画面变暗/模糊，中央弹出半透明面板。面板有圆角矩形边框，内含继续、设置、返回主菜单等选项。边框有轻微的扫描线效果。

#### Midjourney Prompt
```
pixel art, 2D game pause menu panel, semi-transparent dark overlay, centered rounded rectangle panel, menu options inside, scanline texture border, retro CRT aesthetic, low saturation, weirdcore dreamcore style, clean readable layout --ar 4:3  
```

#### 游戏用途
- 暂停游戏
- 调整设置
- 返回主菜单

---

### 2.4 设置面板

#### 元件信息
- **类型**: 设置界面
- **用途**: 调整音量、画质、控制等

#### 视觉描述
分标签页的设置面板（音量、画面、控制）。每个设置项有标签和滑块/选项。滑块是横向进度条样式，选项是下拉或切换按钮。整体风格与暂停菜单一致。

#### Midjourney Prompt
```
pixel art, 2D game settings panel, tabbed interface, volume sliders and toggle options, semi-transparent dark background, rounded rectangle design, scanline texture, retro CRT aesthetic, low saturation, weirdcore dreamcore style --ar 4:3  
```

#### 游戏用途
- 音量调节（BGM、音效、语音）
- 画面设置（全屏、滤镜强度）
- 控制设置（键位）

---

## 三、物品/背包界面

> 全屏物品管理界面

---

### 3.1 背包主界面

#### 元件信息
- **类型**: 全屏界面
- **用途**: 查看和管理所有物品

#### 视觉描述
全屏界面，左侧是物品网格（格子可滚动），右侧是物品详情面板。背景半透明深色，叠加噪点。物品格子与 HUD 物品栏风格一致。详情面板显示物品图标、名称、描述。

#### Midjourney Prompt
```
pixel art, 2D game inventory screen, full screen interface, left side item grid with scroll, right side item detail panel, semi-transparent dark background with noise, rounded cell design, retro CRT aesthetic, low saturation, weirdcore dreamcore style --ar 16:9  
```

#### 游戏用途
- 查看所有收集品
- 阅读物品描述/回忆文本
- 整理物品

---

### 3.2 物品详情面板

#### 元件信息
- **类型**: 信息面板
- **用途**: 显示选中物品的详细信息

#### 视觉描述
竖向面板，上部是物品大图标，中部是名称（像素字体），下部是多行描述文字。描述文字可以有打字机效果。背景有轻微的渐变或纹理。

#### Midjourney Prompt
```
pixel art, 2D game item detail panel, vertical layout, large item icon at top, item name in pixel font, description text below, subtle gradient background, retro CRT aesthetic, low saturation, weirdcore dreamcore style --ar 1:2  
```

#### 游戏用途
- 显示物品名称和描述
- 触发回忆文本
- 某些物品可"使用"

---

### 3.3 收集品图鉴

#### 元件信息
- **类型**: 全屏界面
- **用途**: 查看已收集的所有记忆物品

#### 视觉描述
类似相册或磁带架的界面，物品按类型分类（磁带、光碟、照片等）。未收集的物品显示为灰色轮廓。选中物品可查看详情和触发回忆。背景有老照片/泛黄纸张的纹理感。

#### Midjourney Prompt
```
pixel art, 2D game collection album screen, categorized item display, cassette tapes and photos arranged on shelf, gray silhouettes for uncollected items, yellowed paper texture background, retro CRT aesthetic, low saturation, weirdcore dreamcore nostalgic style --ar 16:9  
```

#### 游戏用途
- 追踪收集进度
- 重温收集的回忆
- 解锁成就

---

## 四、对话/叙事界面

> 剧情、回忆、NPC对话的 UI

---

### 4.1 对话框

#### 元件信息
- **类型**: 叙事元件
- **位置**: 屏幕下方
- **用途**: 显示角色对话、旁白

#### 视觉描述
屏幕下方的对话框，占据约 1/4 屏幕高度。背景半透明深色，有圆角边框。左侧可选显示角色立绘/头像，右侧是对话文字。文字有打字机效果。下方有"按空格继续"提示。

#### Midjourney Prompt
```
pixel art, 2D game dialogue box, bottom screen text box, semi-transparent dark background with rounded border, character portrait area on left, text area on right, retro CRT aesthetic, low saturation, weirdcore dreamcore style, visual novel style layout --ar 4:1  
```

#### 游戏用途
- NPC 对话
- 剧情旁白
- 物品描述/回忆文本

---

### 4.2 选择分支框

#### 元件信息
- **类型**: 交互元件
- **用途**: 玩家做出选择

#### 视觉描述
对话框内或独立弹出的选项列表。每个选项是一行文字，悬停时高亮。选项可以有 2-4 个。选中时有确认音效。

#### Midjourney Prompt
```
pixel art, 2D game choice selection box, vertical option list, highlighted selection state, semi-transparent background, glow border on hover, retro CRT aesthetic, low saturation, weirdcore dreamcore style, clean readable text --ar 2:1  
```

#### 游戏用途
- 剧情选择
- NPC 互动选择
- 影响结局的决策

---

### 4.3 回忆闪回界面

#### 元件信息
- **类型**: 特殊叙事界面
- **用途**: 触发记忆碎片时显示

#### 视觉描述
全屏闪回效果，画面变为老照片/模糊影像风格。中央显示记忆碎片图像（泛黄照片、模糊场景），配合文字叙述。有强烈的 VHS 故障、噪点、色彩偏移效果。边框是撕纸或照片边缘效果。

#### Midjourney Prompt
```
pixel art, 2D game memory flashback screen, full screen nostalgic image, yellowed photograph effect, heavy VHS glitch distortion, noise grain, color shift, torn paper photo edge border, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic --ar 16:9  
```

#### 游戏用途
- 收集品触发的回忆
- 剧情关键节点的闪回
- 增强叙事深度

---

## 五、战斗/搜打撤 UI

> 搜打撤玩法相关的特殊 UI

---

### 5.1 撤离进度条

#### 元件信息
- **类型**: 战斗HUD
- **用途**: 显示撤离进度/倒计时

#### 视觉描述
屏幕上方的横向进度条，显示撤离点激活或到达的进度。颜色从红到绿渐变。有"正在撤离..."等文字提示。进度条有脉冲动画效果。

#### Midjourney Prompt
```
pixel art, 2D game UI element, extraction progress bar, top screen horizontal bar, red to green gradient, pulsing animation effect, "extracting" text label, retro CRT aesthetic, low saturation, weirdcore dreamcore style --ar 4:1  
```

#### 游戏用途
- 显示撤离准备进度
- 紧张感营造
- 倒计时提示

---

### 5.2 敌人警告指示

#### 元件信息
- **类型**: 战斗HUD
- **用途**: 提示敌人出现/警觉

#### 视觉描述
屏幕边缘的红色警告效果（类似受伤时的红边）。配合"!"图标和闪烁动画。警告强度随敌人距离/警觉程度变化。

#### Midjourney Prompt
```
pixel art, 2D game UI element, enemy alert warning, screen edge red glow effect, exclamation mark icon, flashing animation style, danger indicator, retro CRT aesthetic, low saturation, weirdcore dreamcore tense atmosphere --ar 4:3  
```

#### 游戏用途
- 敌人出现警告
- 被发现警告
- 危险区域提示

---

### 5.3 物品搜刮界面

#### 元件信息
- **类型**: 交互界面
- **用途**: 翻找容器时的物品选择

#### 视觉描述
小型弹窗，显示容器内的物品列表。每个物品是图标+名称的行，可选择拿取或查看。背景半透明，有翻找的视觉/音效反馈。

#### Midjourney Prompt
```
pixel art, 2D game loot container popup, small window with item list, item icons with names, take or examine buttons, semi-transparent background, rummaging visual style, retro CRT aesthetic, low saturation, weirdcore dreamcore style --ar 1:1  
```

#### 游戏用途
- 翻找垃圾桶/柜子
- 选择性拾取物品
- 重量/格子限制显示

---

## 六、过场/转场效果

> 场景切换、章节过渡的 UI

---

### 6.1 场景淡入淡出

#### 元件信息
- **类型**: 转场效果
- **用途**: 场景切换过渡

#### 视觉描述
黑色/深色遮罩的淡入淡出，可配合噪点/扫描线效果。可以加入轻微的 VHS 闪烁。进入新场景时从模糊逐渐清晰。

#### Midjourney Prompt
```
pixel art, 2D game transition overlay, fade to black effect, noise grain overlay, VHS static flicker, scene change transition, retro CRT aesthetic, weirdcore dreamcore atmosphere --ar 16:9  
```

---

### 6.2 章节标题卡

#### 元件信息
- **类型**: 过场元件
- **用途**: 新章节/关卡开始时的标题显示

#### 视觉描述
全屏的章节标题卡，显示章节名称（如"第一章：童年小巷"）和简短副标题。背景是模糊的场景图像，文字叠加在上。有淡入-停留-淡出的动画。

#### Midjourney Prompt
```
pixel art, 2D game chapter title card, full screen display, chapter name in large pixel font, subtitle below, blurry scene background, fade in out animation style, retro CRT aesthetic, low saturation, weirdcore dreamcore nostalgic style --ar 16:9  
```

#### 游戏用途
- 新章节开始
- 关卡切换
- 时间线提示

---

### 6.3 加载界面

#### 元件信息
- **类型**: 系统界面
- **用途**: 场景加载时的等待界面

#### 视觉描述
简单的加载界面，中央有加载图标/进度指示。背景可以是静态的怀旧图像或动态的噪点。可显示随机的小贴士或回忆片段。

#### Midjourney Prompt
```
pixel art, 2D game loading screen, centered loading indicator, static nostalgic background image or animated noise, tip text area, retro CRT aesthetic, low saturation, weirdcore dreamcore style --ar 16:9  
```

#### 游戏用途
- 场景加载
- 显示小贴士
- 保持氛围连贯

---

## 七、结算/成就界面

> 关卡结束、成就解锁的 UI

---

### 7.1 关卡结算界面

#### 元件信息
- **类型**: 结算界面
- **用途**: 显示关卡完成情况

#### 视觉描述
关卡结束后的结算面板，显示收集品数量、探索度、用时等统计。有评分或星级显示。背景是模糊的关卡场景。有"继续"、"重玩"等按钮。

#### Midjourney Prompt
```
pixel art, 2D game level complete screen, stats panel with collectibles count and time, star rating display, semi-transparent overlay on blurry scene, continue and replay buttons, retro CRT aesthetic, low saturation, weirdcore dreamcore style --ar 4:3  
```

#### 游戏用途
- 显示关卡完成度
- 激励重玩收集
- 解锁下一关卡

---

### 7.2 成就解锁弹窗

#### 元件信息
- **类型**: 通知弹窗
- **用途**: 成就解锁时的小型通知

#### 视觉描述
屏幕角落弹出的小型通知框，显示成就图标和名称。出现时有动画效果，几秒后自动消失。背景半透明，边框发光。

#### Midjourney Prompt
```
pixel art, 2D game achievement notification popup, corner of screen small popup, achievement icon with title, glow border animation, semi-transparent background, retro CRT aesthetic, low saturation, weirdcore dreamcore style --ar 2:1  
```

#### 游戏用途
- 成就解锁通知
- 收集品里程碑
- 剧情节点提醒

---

## UI 元件总汇

| 分类 | 元件数 | 主要内容 |
|------|--------|----------|
| 核心 HUD | 5 | 物品栏、状态条、互动提示、迷你地图、收集计数 |
| 菜单系统 | 4 | 主菜单、按钮、暂停、设置 |
| 物品界面 | 3 | 背包、详情、图鉴 |
| 对话叙事 | 3 | 对话框、选择分支、回忆闪回 |
| 战斗 UI | 3 | 撤离进度、警告、搜刮 |
| 转场效果 | 3 | 淡入淡出、章节卡、加载 |
| 结算成就 | 2 | 结算界面、成就弹窗 |
| **总计** | **23** | - |

---

## 优先级分类

### P0 - 第一关卡可玩
- 物品栏 (1.1)
- 状态条 (1.2)
- 互动提示 (1.3)
- 对话框 (4.1)
- 场景淡入淡出 (6.1)

### P1 - 核心体验
- 主菜单背景+按钮 (2.1, 2.2)
- 暂停菜单 (2.3)
- 背包界面 (3.1, 3.2)
- 选择分支 (4.2)
- 撤离进度条 (5.1)
- 敌人警告 (5.2)
- 章节标题卡 (6.2)
- 关卡结算 (7.1)

### P2 - 内容丰富
- 迷你地图 (1.4)
- 收集计数器 (1.5)
- 设置面板 (2.4)
- 收集品图鉴 (3.3)
- 回忆闪回 (4.3)
- 搜刮界面 (5.3)
- 加载界面 (6.3)
- 成就弹窗 (7.2)

---

## 技术规格

### 尺寸建议

| 元件类型 | 推荐尺寸 | 说明 |
|----------|----------|------|
| 全屏界面 | 1920×1080 | 16:9 |
| HUD条状 | 宽度根据屏幕 | 可缩放 |
| 弹窗面板 | 400-800px宽 | 居中显示 |
| 图标 | 32×32 或 64×64 | 像素精确 |
| 按钮 | 120-200px宽 | 触摸友好 |

### 导出格式
- **PNG** - 带透明通道
- **9-Slice** - 可拉伸的边框/面板
- **精灵表** - 动画帧序列

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-02-08 | 1.0 | 创建 UI 美术需求文档，共23项元件 |
