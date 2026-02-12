# Midjourney 场景道具元件 - 横版2D可拾取物品

**版本**: 1.0
**日期**: 2026-02-08
**用途**: 放置在横版2D场景中的可拾取道具（侧视图）
**视角**: 侧面/45度角，与场景融合

---

## 设计原则

### 场景道具 vs 物品图标

| 特征 | 场景道具（本文档） | 物品图标（背包用） |
|------|------------------|------------------|
| 视角 | 侧视图/45°斜视 | 俯视图/正视图 |
| 放置 | 地面/桌面/架子 | 背包格子 |
| 大小 | 与角色成比例 | 32×32~64×64px图标 |
| 透视 | 有深度感 | 平面图标 |
| Prompt关键词 | `side view, on ground, environment prop` | `top-down view, icon, inventory sprite` |

### 场景放置示例

```
横版场景视角示意：

     ┌────────────────────────────────────┐
     │  ████████████████████████████████  │ ← 墙面
     │  █                              █  │
     │  █    ┌─────┐                   █  │
     │  █    │电视 │                   █  │ ← 大型家具
     │  █    └─────┘                   █  │
     │  █         ▌ ← 小道具(侧视图)   █  │
     │  █         ▌   放在地面/桌上    █  │
     │  ████████████████████████████████  │
     │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← 地面
     └────────────────────────────────────┘
```

---

# 一、老居民楼场景道具 (25项)

## 1.1 卧室道具 - 侧视图 (8项)

### P-R-01 磁带（场景版）
**放置**: 地面/书桌/架子 | **拾取后获得**: 磁带

```
pixel art, 2D side-scrolling game environment prop, audio cassette tape on floor year 2000, small rectangular plastic object lying flat, slight 3D depth visible, side angle view, casting small shadow on ground, Chinese childhood item, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-R-02 闹钟（场景版）
**放置**: 床头柜/书桌 | **拾取后获得**: 闹钟

```
pixel art, 2D side-scrolling game environment prop, alarm clock on table year 2000, round twin bell clock seen from side angle, standing upright, small shadow beneath, 3D object in side-view scene, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-R-03 铅笔盒（场景版）
**放置**: 书桌 | **拾取后获得**: 铅笔盒

```
pixel art, 2D side-scrolling game environment prop, metal pencil box on desk year 2000, rectangular tin box seen from side with lid visible, faded cartoon print, lying flat on surface, small shadow, side view environment prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-R-04 贴纸册（场景版）
**放置**: 书桌/床 | **拾取后获得**: 贴纸册

```
pixel art, 2D side-scrolling game environment prop, sticker collection book year 2000, small notebook seen from slight angle showing cover and pages, lying on surface, well-used appearance, side view prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-R-05 玻璃弹珠（场景版）
**放置**: 地面/桌面 | **拾取后获得**: 弹珠×3

```
pixel art, 2D side-scrolling game environment prop, glass marbles scattered on ground year 2000, small round spheres with colorful spiral inside, slight reflection visible, casting tiny shadows, side view scene prop, weirdcore dreamcore atmosphere, low saturation with color accents, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-R-06 游戏卡带（场景版）
**放置**: 书桌/电视柜/地面 | **拾取后获得**: 游戏卡带

```
pixel art, 2D side-scrolling game environment prop, Famicom game cartridge year 2000, rectangular plastic object standing or lying, label visible from side angle, 3D depth, small shadow, side view environment prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-R-07 毽子（场景版）
**放置**: 地面 | **拾取后获得**: 毽子

```
pixel art, 2D side-scrolling game environment prop, Chinese shuttlecock jianzi on ground year 2000, rubber base with colorful feathers standing up, side angle showing height, small shadow beneath, environment prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-R-08 红包（场景版）
**放置**: 床头/桌面/抽屉 | **拾取后获得**: 压岁红包

```
pixel art, 2D side-scrolling game environment prop, red envelope hongbao year 2000, small rectangular paper packet lying flat, gold characters slightly visible, side angle view showing thickness, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

## 1.2 客厅道具 - 侧视图 (5项)

### P-R-09 遥控器（场景版）
**放置**: 沙发/茶几 | **拾取后获得**: 遥控器

```
pixel art, 2D side-scrolling game environment prop, TV remote control on table year 2000, long black plastic object seen from side angle, buttons visible on top surface, lying flat, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-R-10 瓜子袋（场景版）
**放置**: 茶几/沙发 | **拾取后获得**: 瓜子

```
pixel art, 2D side-scrolling game environment prop, sunflower seeds bag on table year 2000, crumpled plastic packet seen from side, red or green packaging, half-empty shape, small shadow, side view prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-R-11 大白兔奶糖（场景版）
**放置**: 茶几/桌面 | **拾取后获得**: 大白兔奶糖×3

```
pixel art, 2D side-scrolling game environment prop, White Rabbit candies scattered on surface year 2000, small wrapped candies in blue white wrappers, few pieces lying together, side angle view, tiny shadows, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-R-12 老花镜（场景版）
**放置**: 茶几/桌面 | **拾取后获得**: 老花镜

```
pixel art, 2D side-scrolling game environment prop, reading glasses on table year 2000, wire frame spectacles seen from side angle, folded or open, lenses reflecting slightly, small shadow, environment prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-R-13 扇子（场景版）
**放置**: 沙发/桌面 | **拾取后获得**: 扇子

```
pixel art, 2D side-scrolling game environment prop, Chinese folding fan year 2000, collapsed fan lying on surface, bamboo ribs visible, paper covering, tassel hanging off edge, side view prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

## 1.3 厨房道具 - 侧视图 (6项)

### P-R-14 调料罐（场景版）
**放置**: 灶台/桌面 | **拾取后获得**: 调料

```
pixel art, 2D side-scrolling game environment prop, seasoning jar on counter year 2000, small glass or plastic container with lid, seen from side with label visible, standing upright, small shadow, kitchen prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-R-15 方便面（场景版）
**放置**: 桌面/架子 | **拾取后获得**: 方便面

```
pixel art, 2D side-scrolling game environment prop, instant noodle cup on table year 2000, foam cup with lid seen from side, colorful packaging design visible, standing upright, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-R-16 饭盒（场景版）
**放置**: 桌面/灶台 | **拾取后获得**: 饭盒

```
pixel art, 2D side-scrolling game environment prop, plastic lunch box on table year 2000, rectangular container with lid seen from side angle, white or pastel color, clips on sides visible, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-R-17 冰棍包装（场景版）
**放置**: 地面/垃圾桶旁 | **拾取后获得**: 冰棍棒

```
pixel art, 2D side-scrolling game environment prop, popsicle wrapper on ground year 2000, crumpled plastic wrapper with stick inside, colorful packaging faded, lying on ground with small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-R-18 汽水瓶（场景版）
**放置**: 桌面/地面 | **拾取后获得**: 汽水瓶盖

```
pixel art, 2D side-scrolling game environment prop, glass soda bottle on table year 2000, North Pole orange soda bottle seen from side, glass bottle with label, standing upright, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:2 --no background
```

---

### P-R-19 筷子/餐具（场景版）
**放置**: 桌面/水槽边 | **拾取后获得**: 筷子

```
pixel art, 2D side-scrolling game environment prop, chopsticks and spoon on table year 2000, wooden chopsticks and metal spoon lying on surface, seen from side angle, small shadows, kitchen prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

## 1.4 书房/父母房道具 - 侧视图 (6项)

### P-R-20 日历（场景版）
**放置**: 墙面/桌面 | **拾取后获得**: 老日历

```
pixel art, 2D side-scrolling game environment prop, tear-off calendar on desk year 2000, small paper pad standing with support, date visible on front, slightly curled edges, side angle view, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-R-21 印章（场景版）
**放置**: 书桌/抽屉 | **拾取后获得**: 印章

```
pixel art, 2D side-scrolling game environment prop, Chinese seal stamp on desk year 2000, small square base with wooden handle, seen from side angle, red ink residue visible, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-R-22 眼药水（场景版）
**放置**: 书桌/床头 | **拾取后获得**: 眼药水瓶

```
pixel art, 2D side-scrolling game environment prop, eye drops bottle on table year 2000, small plastic bottle with dropper cap, seen from side with label visible, standing upright, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-R-23 药盒（场景版）
**放置**: 桌面/床头 | **拾取后获得**: 药盒

```
pixel art, 2D side-scrolling game environment prop, medicine box on table year 2000, small rectangular cardboard box seen from side, green or white with text, slightly crushed, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-R-24 电池（场景版）
**放置**: 抽屉/桌面/地面 | **拾取后获得**: 电池×2

```
pixel art, 2D side-scrolling game environment prop, batteries on surface year 2000, two AA batteries lying side by side, cylindrical shape seen from side, gold and black color, small shadows, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-R-25 照片（场景版）
**放置**: 桌面/地面/抽屉 | **拾取后获得**: 泛黄照片

```
pixel art, 2D side-scrolling game environment prop, old photograph on desk year 2000, rectangular photo print lying flat on surface, slightly curled at edges, white borders visible, side angle showing it's flat, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

# 二、学校场景道具 (20项)

## 2.1 教室道具 - 侧视图 (8项)

### P-S-01 作业本（场景版）
**放置**: 课桌/地面 | **拾取后获得**: 作业本

```
pixel art, 2D side-scrolling game environment prop, exercise book on desk year 2000, thin rectangular notebook lying flat, grid paper pages slightly visible at edge, worn cover, side angle view, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-S-02 铅笔（场景版）
**放置**: 课桌/地面 | **拾取后获得**: 铅笔

```
pixel art, 2D side-scrolling game environment prop, wooden pencil on desk year 2000, yellow hexagonal pencil lying flat, pink eraser at end visible, sharpened tip, side view of long object, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-S-03 橡皮擦（场景版）
**放置**: 课桌 | **拾取后获得**: 橡皮擦

```
pixel art, 2D side-scrolling game environment prop, rubber eraser on desk year 2000, small rectangular block seen from side angle, white or pink color, slightly dirty from use, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-S-04 红领巾（场景版）
**放置**: 课桌/地面/椅子 | **拾取后获得**: 红领巾

```
pixel art, 2D side-scrolling game environment prop, red scarf on chair year 2000, triangular red fabric draped over surface, slightly faded color, folded loosely, side angle view, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-S-05 考试卷（场景版）
**放置**: 课桌/地面 | **拾取后获得**: 考试卷

```
pixel art, 2D side-scrolling game environment prop, test paper on desk year 2000, rectangular exam sheet lying flat, printed text barely visible, red score marking, slightly wrinkled, side angle, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-S-06 粉笔（场景版）
**放置**: 讲台/黑板槽/地面 | **拾取后获得**: 粉笔×3

```
pixel art, 2D side-scrolling game environment prop, chalk pieces on surface year 2000, few white chalk stubs scattered, dusty appearance, small cylindrical shapes, side view, tiny shadows, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-S-07 流动红旗（场景版）
**放置**: 教室墙上/地面 | **拾取后获得**: 流动红旗

```
pixel art, 2D side-scrolling game environment prop, mobile red flag year 2000, triangular red pennant with yellow tassel, lying flat or slightly raised, faded color, side angle view, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-S-08 小红花贴纸（场景版）
**放置**: 课桌/墙面 | **拾取后获得**: 小红花×5

```
pixel art, 2D side-scrolling game environment prop, reward stickers on desk year 2000, several small red flower stickers scattered, star or round shapes, bright red with yellow centers, side angle flat view, weirdcore dreamcore atmosphere, low saturation with red accent, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

## 2.2 走廊/公共区道具 - 侧视图 (6项)

### P-S-09 水杯（场景版）
**放置**: 窗台/地面 | **拾取后获得**: 饮水杯

```
pixel art, 2D side-scrolling game environment prop, plastic water cup on windowsill year 2000, small cylindrical cup with handle, bright pink or blue, cartoon print faded, standing upright, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-S-10 硬币（场景版）
**放置**: 地面 | **拾取后获得**: 零花钱硬币

```
pixel art, 2D side-scrolling game environment prop, coin on ground year 2000, small round metal coin seen from side edge showing thickness, silver or gold color, lying flat with tiny shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-S-11 辣条（场景版）
**放置**: 地面/垃圾桶旁 | **拾取后获得**: 辣条

```
pixel art, 2D side-scrolling game environment prop, spicy snack bag on ground year 2000, crumpled foil packet red and oily, lying on ground, Chinese brand visible, small shadow, side view prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-S-12 AD钙奶（场景版）
**放置**: 窗台/地面 | **拾取后获得**: AD钙奶

```
pixel art, 2D side-scrolling game environment prop, AD calcium milk bottle year 2000, small green plastic bottle with white cap, seen from side with label visible, standing upright, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:2 --no background
```

---

### P-S-13 校徽（场景版）
**放置**: 地面 | **拾取后获得**: 校徽

```
pixel art, 2D side-scrolling game environment prop, school badge pin on ground year 2000, small metal pin seen from side angle showing dome shape, enamel paint slightly chipped, tiny shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-S-14 乒乓球（场景版）
**放置**: 地面/窗台 | **拾取后获得**: 乒乓球

```
pixel art, 2D side-scrolling game environment prop, ping pong ball on ground year 2000, small white spherical ball, slightly yellowed, seam line visible, casting small round shadow, side view prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

## 2.3 办公室道具 - 侧视图 (3项)

### P-S-15 红笔（场景版）
**放置**: 办公桌 | **拾取后获得**: 红笔

```
pixel art, 2D side-scrolling game environment prop, red ballpoint pen on desk year 2000, standard pen seen from side lying flat, red ink visible through body, plastic casing, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-S-16 教案本（场景版）
**放置**: 办公桌 | **拾取后获得**: 教案本

```
pixel art, 2D side-scrolling game environment prop, teacher lesson book on desk year 2000, thin rectangular notebook lying flat, handwritten notes on cover, worn edges, side angle view, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-S-17 奖状（场景版）
**放置**: 办公桌/地面 | **拾取后获得**: 奖状

```
pixel art, 2D side-scrolling game environment prop, certificate award on desk year 2000, rectangular paper lying flat, red and gold border visible, Chinese characters, slightly curled edges, side angle, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

## 2.4 厕所道具 - 侧视图 (3项)

### P-S-18 纸巾（场景版）
**放置**: 洗手台/地面 | **拾取后获得**: 纸巾

```
pixel art, 2D side-scrolling game environment prop, tissue packet on sink year 2000, small rectangular paper packet, pastel color with flower print, slightly crumpled, side angle view, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### P-S-19 肥皂（场景版）
**放置**: 洗手台 | **拾取后获得**: 肥皂

```
pixel art, 2D side-scrolling game environment prop, bar soap on sink edge year 2000, small rectangular soap bar seen from side, yellow or white, slightly worn from use, small shadow, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### P-S-20 橡皮筋（场景版）
**放置**: 地面/洗手台 | **拾取后获得**: 橡皮筋

```
pixel art, 2D side-scrolling game environment prop, rubber band on ground year 2000, small elastic loop brown or black, lying loose on surface, simple shape, side view prop, weirdcore dreamcore atmosphere, low saturation, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

# 三、场景道具与物品图标对照表

| 场景道具 | 放置位置 | 拾取后变成 | 图标尺寸 |
|----------|----------|-----------|----------|
| 磁带（侧视） | 书桌/地面 | 磁带图标 | 1×1 |
| 闹钟（侧视） | 床头/书桌 | 闹钟图标 | 1×1 |
| 铅笔盒（侧视） | 书桌 | 铅笔盒图标 | 2×1 |
| 弹珠散落（侧视） | 地面/桌面 | 弹珠图标 | 1×1 |
| 游戏卡带（侧视） | 电视柜/地面 | 卡带图标 | 1×2 |
| 红包（侧视） | 床头/抽屉 | 红包图标 | 1×1 |
| 大白兔散落（侧视） | 茶几 | 奶糖图标 | 1×1 |
| 作业本（侧视） | 课桌 | 作业本图标 | 1×2 |
| 红领巾（侧视） | 椅子/地面 | 红领巾图标 | 1×2 |
| AD钙奶（侧视） | 窗台 | AD钙奶图标 | 1×2 |

---

## 生成统计

| 分类 | 场景道具数 | 备注 |
|------|-----------|------|
| 居民楼-卧室 | 8 | 侧视图，可放置 |
| 居民楼-客厅 | 5 | 侧视图，可放置 |
| 居民楼-厨房 | 6 | 侧视图，可放置 |
| 居民楼-书房 | 6 | 侧视图，可放置 |
| 学校-教室 | 8 | 侧视图，可放置 |
| 学校-走廊 | 6 | 侧视图，可放置 |
| 学校-办公室 | 3 | 侧视图，可放置 |
| 学校-厕所 | 3 | 侧视图，可放置 |
| **总计** | **45** | - |

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-02-08 | 1.0 | 创建场景道具文档（侧视图），区分于物品图标 |
