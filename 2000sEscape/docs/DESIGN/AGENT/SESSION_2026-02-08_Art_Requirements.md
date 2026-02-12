# 会话总结 - 美术需求文档

**日期**: 2026-02-08
**主题**: 创建搜打撤游戏的完整美术元件需求文档（用于Midjourney）

---

## 任务背景

### 游戏信息
- **游戏名称**: 逃离千禧年 (2000sEscape)
- **类型**: 2D像素风横版搜打撤游戏
- **风格**: 怪核/池核 (Weirdcore/Dreamcore)
- **氛围**: 怀旧、孤寂、千禧年幻梦感
- **平台**: RPG Maker MZ
- **目标**: 12小时完成游戏框架

### 美术布局
- 屏幕下方 1/5: UI区域
- 屏幕上方 4/5: 横版地图、角色、NPC、敌人

### 需要的美术元件分类

1. **巨型元件** - 建筑（少年宫、楼房、老浴室等）
2. **大型元件** - 环境/设施（树木、路灯、儿童乐园、滑滑梯等）
3. **中型元件** - 家具/设施（灌木、家具柜子、熊猫垃圾桶等）
4. **小型元件** - 物品/摆件（磁带、地球仪、橡皮鸭子、盗版光碟、不锈钢锅等）

---

## 设计文档参考

游戏的核心设计已记录在 `docs/DESIGN.md`，包含：

### 核心循环
```
梦境大厅 → 选择回忆节点 → 进入搜打撤关卡 → 搜集回忆物品 → 战斗/躲避 → 找到撤离点 → 结算回忆价值 → 返回梦境大厅
```

### 第一关卡: "童年小巷"
- **主题**: 2000年代初的中国小巷
- **氛围**: 黄昏、模糊的记忆、熟悉又陌生
- **场景元素**: 老式居民楼、小卖部、自行车棚、电线杆、墙上的小广告

### UI设计风格
- 低饱和度配色
- 轻微噪点/抖动效果
- 模糊/发光边缘
- 复古字体
- VHS扫描线效果

### 配色方案
- 主背景: 深紫/深蓝 (#1a1a2e, #16213e)
- 强调色: 荧光绿/粉 (#00ff88, #ff6b9d)
- 文字: 米白 (#e8e8e8)
- 暗角: 黑色渐变

---

## 待完成任务

### 创建美术需求文档

**目标文件**: `docs/ART/ART_REQUIREMENTS.md`

需要为每个美术元件编写：
1. **元件名称**
2. **详细描述** - 视觉特征、细节
3. **Midjourney Prompt** - 可直接使用的prompt
4. **游戏用途** - 为什么游戏需要这个元件

### 巨型元件 (建筑) - 需要设计
- [ ] 老式居民楼 (6-7层红砖/水泥楼)
- [ ] 少年宫
- [ ] 老浴室/公共澡堂
- [ ] 小卖部
- [ ] 学校教学楼
- [ ] 工厂/车间
- [ ] 老电影院
- [ ] 医院门诊楼
- [ ] 火车站/候车室

### 大型元件 (环境/设施) - 需要设计
- [ ] 路灯 (老式钠灯)
- [ ] 电线杆
- [ ] 树木 (梧桐、槐树)
- [ ] 儿童乐园设施 (滑滑梯、秋千、旋转木马)
- [ ] 自行车棚
- [ ] 公交站牌
- [ ] 宣传栏/布告栏
- [ ] 围墙/院墙

### 中型元件 (家具/设施) - 需要设计
- [ ] 熊猫垃圾桶 (经典绿色熊猫造型)
- [ ] 灌木/绿化带
- [ ] 石桌石凳
- [ ] 信报箱
- [ ] 晾衣架
- [ ] 自行车
- [ ] 木柜/家具
- [ ] 电视机 (老式CRT)

### 小型元件 (物品/摆件) - 需要设计
- [ ] 磁带/录音带
- [ ] 地球仪
- [ ] 橡皮鸭子
- [ ] 盗版光碟/VCD
- [ ] 不锈钢锅
- [ ] 热水瓶
- [ ] 玻璃弹珠
- [ ] 小霸王游戏卡带
- [ ] 褪色红包
- [ ] 泛黄照片
- [ ] 旧玩具车
- [ ] 针线盒

---

## Midjourney Prompt 风格指南

### 基础风格关键词
```
pixel art, 2D side-scrolling game asset, Chinese year 2000 aesthetic,
weirdcore dreamcore atmosphere, nostalgic, lonely,
low saturation colors, slight noise grain,
vhs filter effect, retro CRT monitor aesthetic,
lo-fi quality, memory fragment visual style
```

### 巨型元件额外关键词
```
background building, parallax layer, seamless tileable,
game background art, no characters, environment only
```

### 小型物品额外关键词
```
item icon, collectible object, top-down view or side view,
transparent background, game item sprite
```

---

## 文件夹结构

```
docs/
├── DESIGN.md              # 主设计文档
├── DESIGN/
│   ├── CODE/              # 代码文档
│   ├── UI/                # UI设计
│   ├── AUDIO/             # 音乐需求
│   └── AGENT/             # 会话记录
└── ART/                   # 待创建
    └── ART_REQUIREMENTS.md  # 美术需求文档 (待创建)
```

---

## 继续对话的提示

在新对话中，可以使用以下提示继续：

```
请继续完成美术需求文档的创建。

参考文件：
- docs/DESIGN.md - 游戏设计文档
- docs/DESIGN/AGENT/SESSION_2026-02-08_Art_Requirements.md - 本次会话记录

任务：
在 docs/ART/ 文件夹下创建 ART_REQUIREMENTS.md，
包含所有巨型/大型/中型/小型美术元件的详细描述、Midjourney Prompt和游戏用途。

风格要求：
- 2D像素风格
- 怪核/池核氛围
- 2000年代中国怀旧感
- 用于横版搜打撤游戏
```

---

## 已完成工作

- [x] 创建 docs/ART/ 文件夹
- [ ] 创建 ART_REQUIREMENTS.md 文档
