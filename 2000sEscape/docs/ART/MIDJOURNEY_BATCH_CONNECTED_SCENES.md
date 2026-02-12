# Midjourney 批量生成清单 - 连接场景 (P0)

**版本**: 1.0
**日期**: 2026-02-08
**用途**: 老居民楼 + 学校 连接场景的 P0 美术元件
**目标**: 实现两点一线的核心游戏循环

---

## 生成顺序

建议按以下顺序生成，确保场景完整性：

1. **外景连接区域** (4项) - 两个场景的连接纽带
2. **老居民楼室内** (11项) - 起点/终点之一
3. **学校室内** (9项) - 起点/终点之二
4. **收集品** (8项) - 可拾取物品

**总计**: 32项

---

## 一、外景连接区域 (4项)

### C01 黄昏小巷背景（主场景）

**用途**: 连接居民楼和学校的外景

```
pixel art, 2D side-scrolling game background, Chinese alley street year 2000, narrow lane between old buildings, dusk golden hour lighting eternal, single street lamp ahead glowing orange, laundry hanging from windows frozen mid-sway, faded advertisement stickers on walls peeling unreadable, cracked pavement with puddles reflecting nothing, liminal space between destinations, familiar but wrong, something is off, childhood memory of walking home distorted into infinite corridor, uncanny atmosphere, eerily empty, traces of life but nobody home, soft eerie lighting shadows too long wrong direction, low saturation desaturated melancholic, vhs static filter, datamosh glitch effect, retro CRT aesthetic, parallax scrolling background, no characters --ar 16:9
```

**尺寸**: 1920×1080+

---

### C02 老式路灯（带光效）

**用途**: 场景光源、可互动掩体

```
pixel art, 2D side-scrolling game prop, old Chinese street lamp year 2000, cast iron pole rust bleeding like tears, spherical sodium light fixture humming wrong frequency, warm orange yellow glow illuminating empty space that should have someone, rusty surface with faded stickers unreadable, dusk atmosphere eternal twilight forever, liminal object watching but seeing nothing, familiar but wrong, childhood memory of walking alone distorted, uncanny atmosphere, light that waits for someone never coming, soft eerie lighting pooling unnaturally on ground, low saturation desaturated, vhs static filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 1:2 --no background
```

**尺寸**: 128-256px高

---

### C03 围墙（可平铺）

**用途**: 场景边界、可翻越障碍

```
pixel art, 2D side-scrolling game prop, Chinese brick wall year 2000, red brick weathered by time forgotten, broken glass shards on top catching light wrong, faded slogan characters half erased unreadable, peeling plaster exposing bricks like wound, ivy climbing slowly consuming, urban barrier dividing memories, liminal boundary, familiar but wrong, something watching from other side, uncanny atmosphere, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, seamless tileable --ar 4:1
```

**尺寸**: 可平铺

---

### C04 熊猫垃圾桶

**用途**: 可翻找容器、标志性元件

```
pixel art, 2D side-scrolling game prop, Chinese panda trash can year 2000, green painted panda shape smiling wrong too wide, cute design with open arms embracing emptiness, hinged head lid slightly ajar, faded scratched paint revealing darker surface beneath, iconic street furniture from childhood now abandoned, liminal object, familiar but deeply wrong, childhood memory distorted panda eyes following you, uncanny atmosphere, traces of presence but empty, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

**尺寸**: 64-128px高

---

## 二、老居民楼室内 (11项)

### 通用组件 (4项)

#### R01 门/门框

```
pixel art, 2D side-scrolling game prop, old Chinese wooden door year 2000, door frame with faded spring couplet traces like ghost writing, round metal doorknob cold to touch, transom window above dark watching, peeling paint revealing layers of history, door to somewhere familiar but wrong, liminal threshold, uncanny atmosphere, childhood memory of home entrance distorted, something waiting on other side, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 1:2 --no background
```

---

#### R02 窗户

```
pixel art, 2D side-scrolling game prop, old Chinese window year 2000, aluminum frame slightly bent, dusty glass showing nothing outside, fabric curtains frozen mid-sway no wind, dusk light streaming in from nowhere source unknown, long shadows stretching wrong direction, semi-open with torn screen, familiar but wrong, liminal view to outside that may not exist, uncanny atmosphere, childhood memory looking out distorted, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

#### R03 墙面/白墙

```
pixel art, 2D side-scrolling game background, Chinese interior wall year 2000, white painted wall cracked like aging skin, light switch and socket placement wrong, nail holes where pictures used to hang now empty staring, faint outline of removed poster like ghost, familiar but wrong, liminal space inside home, uncanny atmosphere, childhood memory of living room distorted, low saturation desaturated, vhs filter, retro CRT aesthetic, tileable --ar 4:3
```

---

#### R04 地面/水泥地

```
pixel art, 2D side-scrolling game floor tile, Chinese interior floor year 2000, cement surface worn smooth by footsteps of family no longer here, stains from spills decades ago, cracks running like veins, familiar but wrong, liminal ground beneath feet, uncanny atmosphere, childhood memory of playing on floor distorted, low saturation desaturated, vhs filter, retro CRT aesthetic, tileable --ar 1:1
```

---

### 楼道 (2项)

#### R05 楼梯

```
pixel art, 2D side-scrolling game background, old Chinese apartment staircase year 2000, concrete steps worn smooth by countless feet, rusty iron railing cold to touch, window at landing showing nothing but gray, dim light source unknown, anti-slip strips peeling, stairs leading somewhere familiar but wrong, liminal space between floors infinite, backrooms aesthetic endless descent possible, uncanny atmosphere, childhood memory of climbing stairs distorted, eerily empty, low saturation desaturated, vhs filter, retro CRT aesthetic --ar 16:9
```

---

#### R06 声控灯

```
pixel art, 2D game prop, old apartment hallway ceiling light year 2000, bare bulb with yellowed plastic cover, dim yellow flickering light responding to sounds not made, motion activated by presence not felt, watching from above, liminal object, familiar but wrong, uncanny atmosphere, childhood memory of dark hallway distorted, eerie flickering, low saturation desaturated, vhs filter, retro CRT aesthetic, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### 客厅 (2项)

#### R07 沙发

```
pixel art, 2D side-scrolling game prop, old Chinese fabric sofa year 2000, dark red or green upholstery faded like old memory, slightly sagging from bodies no longer sitting, armrests worn smooth by hands not present, may have protective cover dusty, living room furniture waiting for someone, liminal object, familiar but wrong, childhood memory of family TV time distorted, uncanny atmosphere, traces of life but empty, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

#### R08 电视柜

```
pixel art, 2D game prop, Chinese TV cabinet stand year 2000, low wooden cabinet dark lacquer finish scratched, storage shelves below holding forgotten items, surface where television used to be now empty mark visible, furniture for memories not made, liminal object, familiar but wrong, childhood memory of watching cartoons distorted, uncanny atmosphere, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

### 卧室 (3项) - 含撤离点

#### R09 床 ⚠️ 撤离点A

**用途**: 从学校开始时的撤离点

```
pixel art, 2D side-scrolling game prop, Chinese bed year 2000, wooden or iron frame holding dreams and nightmares, folded quilt and sheets arranged too perfectly, padded headboard against wall with faded stains, storage boxes underneath hiding childhood secrets, bedroom furniture waiting for return, liminal object of rest and escape, familiar but wrong, childhood memory of sleeping distorted into eternal rest, uncanny atmosphere, traces of sleep but no sleeper, soft eerie lighting from window, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

#### R10 衣柜

```
pixel art, 2D game prop, Chinese wardrobe closet year 2000, tall wooden cabinet dark wood absorbing light, mirrored doors reflecting nothing or something wrong, hanging clothes inside preserved like exhibits, stacked blankets holding warmth of ghosts, warped doors never quite closing, liminal object hiding and revealing, familiar but wrong, childhood memory of hiding inside distorted, uncanny atmosphere, mirror may show what should not be seen, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 1:2 --no background
```

---

#### R11 书桌

```
pixel art, 2D game prop, Chinese student desk year 2000, simple wooden table scarred by homework and dreams, desk lamp with burnt bulb, textbooks and exercise books stacked unread, pen holder with dried pens, drawers with forgotten stationery and secrets, placed by window showing nothing outside, liminal object of study and escape, familiar but wrong, childhood memory of homework distorted into endless task, uncanny atmosphere, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

## 三、学校室内 (9项)

### 走廊 (2项)

#### S01 走廊背景

```
pixel art, 2D side-scrolling game background, Chinese school hallway year 2000, terrazzo floor worn by thousands of footsteps echoing emptiness, white walls with green wainscot peeling at edges, classroom doors along sides closed watching, windows at end showing dusk light from nowhere, empty corridor stretching too far, liminal space between classes eternal, backrooms aesthetic infinite hallway, familiar but deeply wrong, childhood memory of school distorted into nightmare, uncanny atmosphere, eerily empty echoes of laughter absent, soft eerie lighting source unknown, low saturation desaturated, vhs filter, retro CRT aesthetic --ar 16:9
```

---

#### S02 班级牌

```
pixel art, 2D game prop, Chinese classroom door sign year 2000, class number plate with faded numbers, mobile red flag or certificate attached crooked, school signage marking territory, liminal marker of belonging and exclusion, familiar but wrong, childhood memory of finding your classroom distorted, uncanny atmosphere, low saturation desaturated, vhs filter, retro CRT aesthetic, front view, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### 教室 (4项) - 含撤离点

#### S03 黑板

```
pixel art, 2D side-scrolling game prop, Chinese classroom blackboard year 2000, wooden or aluminum frame dark against dark, faint chalk writing remains messages unreadable wrong, chalk dust and eraser in tray frozen, knowledge written and erased like memories fading, liminal surface of learning and forgetting, familiar but wrong, childhood memory of lessons distorted into cryptic messages, uncanny atmosphere, writing may say something unsettling, low saturation desaturated, vhs filter, retro CRT aesthetic, front view, isolated on solid white background, subject only, no background elements --ar 4:1 --no background
```

---

#### S04 讲台

```
pixel art, 2D game prop, Chinese classroom podium year 2000, wooden teacher desk scratched by years of authority, chalk box half empty, lesson plans for lessons never taught, teacup with cold tea rings, front of class position of power now empty, liminal object of instruction and judgment, familiar but wrong, childhood memory of being called on distorted, uncanny atmosphere, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

#### S05 课桌椅组 ⚠️ 撤离点B

**用途**: 从居民楼开始时的撤离点

```
pixel art, 2D game prop, Chinese student desk and chair set year 2000, wooden top metal legs scratched by decades of students, carved graffiti and early character on surface marked by countless hands, books in drawer frozen mid-study, arranged in rows empty waiting, liminal object of learning and sitting still, familiar but wrong, childhood memory of classroom distorted into endless wait, uncanny atmosphere, one desk may be yours, traces of students but none present, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 2:1 --no background
```

---

#### S06 撤离点课桌（特殊版本）

**用途**: 标记为主角课桌的变体

```
pixel art, 2D game prop, Chinese student desk close-up year 2000, wooden top with name carved small in corner your name, single desk with chair attached, surface worn smooth by your arms, drawer half open with your textbooks inside, window view beside showing dusk light, liminal object of personal territory in shared space, familiar and deeply nostalgic, childhood memory of your spot in classroom preserved, uncanny atmosphere bittersweet, soft warm lighting from window, low saturation desaturated with hint of warmth, vhs filter, retro CRT aesthetic, side view close, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### 学校通用 (3项，复用居民楼)

#### S07 门（复用 R01）
#### S08 窗户（复用 R02）
#### S09 墙面/地面（复用 R03/R04）

---

## 四、外景建筑 (2项)

### E01 老式居民楼外景

```
pixel art, 2D side-scrolling game background, 6-story Chinese residential apartment building year 2000, red brick and gray concrete exterior weathered by time and memory, clothes drying on balconies frozen mid-sway no wind, windows glowing with unsettling warm yellow light that feels watching from inside, iron gate at entrance rusted open forever, faded posters on wall peeling like dead skin revealing brick beneath, liminal space, eerily empty street below, familiar but wrong, something is off, childhood memory distorted, traces of life but nobody home, uncanny atmosphere, dreamlike hazy edges, soft eerie lighting, wrong perspective slightly, low saturation desaturated, vhs static filter, datamosh glitch effect, retro CRT aesthetic, parallax background layer, no characters --ar 16:9
```

---

### E02 学校教学楼外景

```
pixel art, 2D side-scrolling game background, Chinese school building year 2000, 3-4 floors corridor extending too far into darkness, open corridor design shadows too long wrong direction, white or pale yellow exterior peeling like sunburned skin, classroom windows in rows dark reflective watching like eyes, blackboard with faint writing messages unreadable, celebrity portraits in hallway eyes following you, flag pole in playground flag gone rope swaying no wind, liminal space, backrooms aesthetic endless hallway feel, familiar but deeply wrong, childhood memory distorted into quiet nightmare, uncanny atmosphere, eerie empty playground echoes of laughter absent, soft eerie lighting source from nowhere, wrong perspective slightly bent, low saturation desaturated, vhs static filter, datamosh glitch, retro CRT aesthetic, parallax layer, no characters --ar 16:9
```

---

## 五、收集品 (8项)

### I01 磁带 ×3变体

```
pixel art, 2D game item icon, audio cassette tape year 2000, plastic cassette shell aged yellow, two reel holes visible behind transparent window, handwritten label with song titles faded unreadable, brown magnetic tape visible slightly unwound, nostalgic music media from childhood now silent, liminal object holding sounds of past, familiar but wrong, memory of listening distorted, weirdcore dreamcore atmosphere, low saturation desaturated, vhs filter, retro CRT aesthetic, top-down view, isolated on solid white background, subject only, no background elements, inventory item sprite --ar 1:1 --no background
```

---

### I02 盗版光碟 ×2变体

```
pixel art, 2D game item icon, pirated VCD DVD disc year 2000, silver reflective surface with center hole like eye, plastic case or paper sleeve with blurry movie cover faces unclear, chinese characters for HD or complete collection faded, bootleg media culture from childhood, liminal object holding movies half-remembered, familiar but wrong, memory of watching distorted, weirdcore dreamcore atmosphere, low saturation desaturated, vhs filter, retro CRT aesthetic, top view, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### I03 小霸王游戏卡带

```
pixel art, 2D game item icon, Famicom NES game cartridge year 2000, gray plastic shell worn smooth by countless insertions, label on back with game title in chinese faded unreadable, retro gaming cartridge from xiaobawang console era, dust cover missing, liminal object holding digital worlds from childhood, familiar but wrong, memory of playing distorted, weirdcore dreamcore atmosphere, low saturation desaturated, vhs filter, retro CRT aesthetic, front view, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### I04 泛黄照片

```
pixel art, 2D game item icon, old faded photograph year 2000, film printed photo with white borders yellowed by time, discolored surface showing blurry image of family faces unclear or landscape forgotten, memory fragment from past, liminal object holding moment frozen, nostalgic melancholy bittersweet, familiar but wrong faces you should know but dont, weirdcore dreamcore atmosphere, low saturation desaturated, vhs filter, retro CRT aesthetic, front view, isolated on solid white background, subject only, no background elements --ar 3:2 --no background
```

---

### I05 玻璃弹珠

```
pixel art, 2D game item icon, glass marble ball year 2000, transparent glass sphere with colorful spiral pattern inside like captured galaxy, smooth reflective surface catching light wrong, childhood game toy from simpler times, liminal object holding memories of play, familiar but wrong, memory of games with friends now gone, weirdcore dreamcore atmosphere, low saturation desaturated with hint of color, vhs filter, retro CRT aesthetic, top view, isolated on solid white background, subject only, no background elements --ar 1:1 --no background
```

---

### I06 热水瓶

```
pixel art, 2D game item icon, chinese thermos flask year 2000, plastic outer shell red or green faded, glass vacuum liner inside holding warmth of home, cork or plastic stopper slightly cracked, household essential from childhood kitchen, liminal object of family care, familiar but wrong, memory of hot water and comfort distorted, weirdcore dreamcore atmosphere, low saturation desaturated, vhs filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 1:2 --no background
```

---

## 生成统计

| 分类 | 数量 | 预计生成次数 |
|------|------|-------------|
| 外景连接区域 | 4项 | 4次 |
| 老居民楼室内 | 11项 | 11次 |
| 学校室内 | 6项 (9-3复用) | 6次 |
| 外景建筑 | 2项 | 2次 |
| 收集品 | 8项 | ~12次 (含变体) |
| **总计** | **31项** | **~35次** |

---

## 后期处理检查清单

- [ ] 去除背景 (透明PNG)
- [ ] 检查怪核/梦核氛围是否到位
- [ ] 统一低饱和度配色
- [ ] 测试平铺效果 (墙/地)
- [ ] 测试两个撤离点的视觉区分
- [ ] 导入 RPG Maker MZ
- [ ] 设置碰撞区域
- [ ] 配置撤离点交互

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-02-08 | 1.0 | 创建连接场景批量生成清单，共31项 |
