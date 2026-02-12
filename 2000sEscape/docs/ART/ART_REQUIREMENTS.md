# 美术需求文档 - 逃离千禧年 (2000sEscape)

**版本**: 1.1
**更新日期**: 2026-02-08
**用途**: Midjourney 美术元件生成参考

---

## 概述

### 游戏信息
- **游戏名称**: 逃离千禧年 (2000sEscape)
- **类型**: 2D像素风横版搜打撤游戏
- **风格**: 怪核/梦核 (Weirdcore/Dreamcore)
- **氛围**: 怀旧、孤寂、千禧年幻梦感、熟悉又陌生
- **平台**: RPG Maker MZ

### 美术布局
- 屏幕下方 1/5: UI区域
- 屏幕上方 4/5: 横版地图、角色、NPC、敌人

---

## 通用风格关键词

### 基础风格（所有元件适用）
```
pixel art, 2D side-scrolling game asset, Chinese year 2000 aesthetic,
liminal space, uncanny atmosphere, eerily empty,
familiar but wrong, something is off,
childhood memory distorted, faded memory fragment,
low saturation desaturated colors, slight noise grain,
vhs static filter, datamosh glitch, retro CRT monitor aesthetic,
lo-fi degraded quality, dreamlike hazy,
unsettling nostalgia, wrong nostalgia, hauntingly familiar
```

### 怪核/梦核核心关键词说明

| 关键词 | 效果 | 中文说明 |
|--------|------|----------|
| `liminal space` | 过渡性、空旷的空间感 | 阈限空间 |
| `uncanny atmosphere` | 诡异、不安的氛围 | 恐怖谷氛围 |
| `eerily empty` | 诡异的空旷感 | 诡异的空旷 |
| `familiar but wrong` | 熟悉但有什么不对 | 熟悉但不对 |
| `something is off` | 有什么地方不对劲 | 有什么不对 |
| `childhood memory distorted` | 扭曲的童年记忆 | 扭曲记忆 |
| `unsettling nostalgia` | 令人不安的怀旧 | 不安怀旧 |
| `traces of presence but no people` | 有人存在过的痕迹但没人 | 无人的痕迹 |
| `backrooms aesthetic` | 后房美学/无限空间感 | 后房美学 |
| `dreamlike hazy` | 梦幻朦胧感 | 梦幻朦胧 |
| `soft eerie lighting` | 柔和但诡异的光线 | 诡异光线 |
| `wrong perspective` | 错误的透视感 | 错误透视 |

### 巨型/大型元件关键词（背景建筑）
```
background building, parallax layer, seamless tileable,
game background art, no characters, environment only,
abandoned but lived-in feeling, traces of life but empty,
infinite corridor effect, endless repetition,
windows that watch, doors to nowhere
```

### 中型/小型元件关键词（道具物件）
```
game prop, environment detail, side view perspective,
transparent background preferred, sprite sheet ready,
abandoned object, forgotten item, relic from memory,
slightly unsettling presence, object with history
```

### 小型物品/收集品关键词
```
item icon, collectible object, top-down view or side view,
transparent background, game item sprite, inventory item,
memory fragment, ghost of the past, bittersweet nostalgia
```

---

## 配色方案

| 用途 | 色值 | 说明 |
|------|------|------|
| 主背景 | #1a1a2e, #16213e | 深紫/深蓝 |
| 强调色 | #00ff88, #ff6b9d | 荧光绿/粉 |
| 文字 | #e8e8e8 | 米白 |
| 暗角 | 黑色渐变 | VHS边缘效果 |

---

# 一、巨型元件（建筑）

> 适用于关卡背景、视差滚动层
> 尺寸建议：高度占据屏幕2/3以上

---

## 1.1 老式居民楼

### 元件信息
- **类型**: 巨型建筑
- **关卡**: 童年小巷、学校周边
- **用途**: 主要背景建筑，营造怀旧居住区氛围

### 视觉描述
6-7层红砖或水泥外墙的居民楼，2000年代初中国城镇常见款式。阳台挂满晾晒的衣物，窗户透出昏黄灯光。楼道口有铁栅栏门，墙上可见小广告和涂鸦。整体略显破旧但充满生活气息。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game background, 6-story Chinese residential apartment building year 2000, red brick and gray concrete exterior, clothes drying on balconies frozen mid-sway, windows glowing with unsettling warm yellow light that feels watching, iron gate at entrance rusted open, faded posters on wall peeling like dead skin, liminal space, eerily empty street, familiar but wrong, something is off, childhood memory distorted, traces of life but nobody home, uncanny atmosphere, dreamlike hazy edges, soft eerie lighting, wrong perspective slightly, low saturation desaturated colors, vhs static filter, datamosh glitch effect, retro CRT aesthetic, parallax background layer, no characters --ar 30:10
```

### 游戏用途
- 童年小巷关卡的主要背景
- 可作为可进入建筑的候选（小卖部、邻居家）
- 营造熟悉又陌生的记忆碎片感

---

## 1.2 少年宫

### 元件信息
- **类型**: 巨型建筑
- **关卡**: 少年宫回忆
- **用途**: 特殊关卡的主要场景建筑

### 视觉描述
典型的2000年代少年宫建筑，略带苏式或现代主义风格。外墙为浅黄色或白色瓷砖，正门上方有红色大字"少年宫"。窗户大而明亮，但此刻显得空旷寂静。建筑前有宽阔的广场和旗杆。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game background, Chinese children's palace building year 2000, pale yellow tile exterior faded like old photograph, soviet modernist architecture looming too tall, large red characters on facade partially erased unreadable, big windows dark and reflective like empty eyes, flag pole in front flag frozen mid-wave no wind, wide plaza impossibly empty, liminal space, backrooms aesthetic infinite emptiness, familiar but wrong, unsettling silence, childhood memory distorted, uncanny atmosphere, eerie golden hour light source unknown, soft eerie lighting, wrong perspective, low saturation desaturated, vhs static filter, datamosh glitch, retro CRT aesthetic, parallax layer, no characters --ar 16:9
```

### 游戏用途
- "少年宫回忆"关卡的核心场景
- 触发童年兴趣班、比赛等记忆
- 内部可设计为多个探索区域

---

## 1.3 老浴室/公共澡堂

### 元件信息
- **类型**: 巨型建筑
- **关卡**: 童年小巷、社区场景
- **用途**: 特色建筑，承载洗浴文化记忆

### 视觉描述
传统公共澡堂外观，砖混结构，门口有褪色的"浴"字招牌。蒸汽从排气窗飘出，墙面有水渍痕迹。门口堆着几个木拖鞋，昏黄的灯光透出门缝。整体散发潮湿温暖的气息。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game background, old Chinese public bathhouse year 2000, brick and concrete structure, faded sign with bath character, steam rising from vents, water stains on walls, wooden slippers at entrance, warm yellow light through door crack, humid atmosphere, weirdcore dreamcore, nostalgic lonely, low saturation, vhs filter, retro CRT aesthetic, parallax background, no characters --ar 16:9  
```

### 游戏用途
- 童年小巷关卡的特色建筑
- 可能收集到澡堂相关回忆物品
- 营造独特的中国社区生活氛围

---

## 1.4 小卖部

### 元件信息
- **类型**: 巨型建筑（较小）
- **关卡**: 童年小巷、学校周边
- **用途**: 重要互动点，物品获取场所

### 视觉描述
街角小店，门口挂着冰棍饮料招牌。玻璃柜台里摆放着各种零食玩具，货架上是方便面、饮料、日用品。门口有小黑板写着促销信息，旁边停着几辆自行车。店内有老式电视播放节目。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game background, small Chinese corner store year 2000, ice cream and drink signs hanging crooked frozen, glass counter with snacks and toys arranged too perfectly, shelves with instant noodles and drinks colors slightly wrong, small chalkboard with prices handwriting not quite human, bicycles parked nearby rusting in place, old CRT TV inside showing static snow, warm cozy lighting that feels unnatural too perfect, liminal space, familiar but wrong, something is off, memory of a place that may not exist, uncanny atmosphere, childhood memory distorted, traces of life but abandoned, soft eerie lighting with wrong shadows, low saturation desaturated, vhs static filter, datamosh glitch, retro CRT aesthetic, parallax layer, no characters --ar 16:9
```

### 游戏用途
- 购买/获取零食、饮料、玩具类回忆物品
- 与店主NPC互动的重要场所
- 童年小巷的核心探索点

---

## 1.5 学校教学楼

### 元件信息
- **类型**: 巨型建筑
- **关卡**: 学校场景
- **用途**: 学校关卡的主要建筑

### 视觉描述
典型的中国小学或初中教学楼，3-4层，走廊开放式设计。外墙为白色或淡黄色，教室窗户整齐排列。黑板上隐约可见字迹，走廊里挂着名人画像。操场上旗杆飘扬，整体氛围既熟悉又莫名空旷。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game background, Chinese school building year 2000, 3-4 floors corridor extending too far, open corridor design shadows too long, white or pale yellow exterior peeling like sunburned skin, classroom windows in rows dark reflective watching, chalkboard with faint writing messages unreadable wrong, celebrity portraits in hallway eyes following you, flag pole in playground flag gone rope swaying no wind, liminal space, backrooms aesthetic endless hallway, familiar but deeply wrong, childhood memory distorted into nightmare, uncanny atmosphere, eerie empty playground echoes of laughter absent, soft eerie lighting source from nowhere, wrong perspective slightly bent, low saturation desaturated, vhs static filter, datamosh glitch, retro CRT aesthetic, parallax layer, no characters --ar 16:9
```

### 游戏用途
- 学校关卡的主场景
- 教室、走廊可作为战斗/探索区域
- 触发上学、考试、课间等记忆

---

## 1.6 工厂/车间

### 元件信息
- **类型**: 巨型建筑
- **关卡**: 工厂回忆
- **用途**: 工业场景关卡的建筑

### 视觉描述
老式国有工厂厂房，红砖外墙，高大的厂房窗户。烟囱耸立，管道纵横。铁门上有工厂名称，门口有传达室。厂房内机器寂静，空旷的工业感与怀旧氛围交织。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game background, old Chinese state-owned factory year 2000, red brick exterior, tall industrial windows, smokestack chimney, maze of pipes, iron gate with factory name, guard room at entrance, silent machinery inside, industrial nostalgic atmosphere, weirdcore dreamcore mood, lonely, low saturation, vhs filter, retro CRT aesthetic, parallax layer, no characters --ar 16:9  
```

### 游戏用途
- 工厂回忆关卡的主场景
- 可能触发父母工作相关的记忆
- 独特的工业废墟探索体验

---

## 1.7 老电影院

### 元件信息
- **类型**: 巨型建筑
- **关卡**: 城市场景
- **用途**: 文化娱乐记忆的触发场所

### 视觉描述
2000年代初的老式电影院，门口有巨大的电影海报展示框。霓虹灯招牌闪烁，售票窗口贴着票价。建筑带有一点复古装饰风格，入口处有红色地毯。此刻空无一人，但依然能想象曾经的热闹。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game background, old Chinese cinema theater year 2000, large movie poster frames at entrance, neon sign flickering, ticket booth with prices, art deco retro style, red carpet at entrance, empty but nostalgic, weirdcore dreamcore atmosphere, lonely, low saturation colors, vhs filter effect, retro CRT aesthetic, parallax layer, no characters --ar 16:9  
```

### 游戏用途
- 城市场景的特色建筑
- 触发看电影、约会等记忆
- 内部可设计为探索区域

---

## 1.8 医院门诊楼

### 元件信息
- **类型**: 巨型建筑
- **关卡**: 医院回忆
- **用途**: 医院相关记忆的触发场景

### 视觉描述
普通的区级或社区医院门诊楼，白色瓷砖外墙。门口有红十字标志，挂号窗口排着长队（此刻无人）。走廊里弥漫着消毒水气息，墙上贴着科室指引。整体散发一种不安的安静。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game background, Chinese community hospital building year 2000, white tile exterior too white sterile wrong, red cross sign at entrance faded almost pink, registration window empty papers scattered, hospital corridor atmosphere stretching infinitely, department signs on wall letters rearranging unreadable, antiseptic smell implied clinical wrongness, liminal space, backrooms aesthetic medical horror, familiar but wrong, something is deeply off, childhood memory of being sick distorted, uncanny atmosphere, uneasy quiet wrong kind of silence, soft eerie clinical fluorescent lighting flickering, wrong perspective hallways too long, low saturation desaturated sickly, vhs static filter, datamosh glitch, retro CRT aesthetic, parallax layer, no characters --ar 16:9
```

### 游戏用途
- 医院回忆关卡的主场景
- 触发看病、打针、住院等记忆
- 营造略带不安的氛围变化

---

## 1.9 火车站/候车室

### 元件信息
- **类型**: 巨型建筑
- **关卡**: 旅途场景
- **用途**: 旅行、离别记忆的触发场所

### 视觉描述
老式火车站候车大厅，高挑的屋顶，长排的木质座椅。大屏幕显示列车时刻，广播回荡。绿色皮火车停在站台，蒸汽/烟雾缭绕。离别与重逢的氛围交织，此刻空旷寂寥。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game background, old Chinese train station waiting hall year 2000, high ceiling dissolving into shadow, long wooden benches worn smooth by ghosts, train schedule board flickering wrong destinations, PA system speakers silent but mouths open, green train on platform rusted in place windows dark, steam and mist from nowhere, departure reunion atmosphere twisted into eternal waiting, liminal space, backrooms aesthetic transit purgatory, familiar but wrong, childhood memory of leaving distorted, uncanny atmosphere, empty and hauntingly lonely, soft eerie lighting through dirty windows, wrong perspective platforms extending forever, low saturation desaturated melancholic, vhs static filter, datamosh glitch, retro CRT aesthetic, parallax layer, no characters --ar 16:9
```

### 游戏用途
- 旅途/离别回忆关卡的主场景
- 触发远行、送别、归乡等记忆
- 独特的场景转换节点

---

# 二、大型元件（环境/设施）

> 适用于场景装饰、环境氛围营造
> 尺寸建议：高度约为角色的2-4倍

---

## 2.1 老式路灯（钠灯）

### 元件信息
- **类型**: 大型环境设施
- **关卡**: 童年小巷、学校周边、城市场景
- **用途**: 场景照明、氛围营造

### 视觉描述
典型的2000年代中国街道路灯，铸铁灯杆，顶端是圆球形或椭圆形的钠灯灯罩。发出温暖的橙黄色光线，灯杆上有锈迹和小广告贴纸。黄昏时分灯刚亮起，光晕朦胧。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, old Chinese street lamp year 2000, cast iron pole rust bleeding, spherical sodium light fixture humming wrong frequency, warm orange yellow glow illuminating nothing, rusty surface with small stickers faded unreadable, dusk atmosphere eternal twilight, liminal object, familiar but wrong, childhood memory of walking home alone distorted, uncanny atmosphere, light that watches but sees nothing, soft eerie lighting pooling unnaturally, low saturation desaturated, vhs static filter, retro CRT aesthetic, side view, isolated on solid white background, subject only, no background elements --ar 1:2 --no background
```

### 游戏用途
- 场景照明光源，营造黄昏/夜晚氛围
- 可作为掩体使用
- 与阴影、光晕效果配合增强怪核感

---

## 2.2 电线杆

### 元件信息
- **类型**: 大型环境设施
- **关卡**: 童年小巷、所有户外场景
- **用途**: 环境装饰、时代特征

### 视觉描述
水泥电线杆，上面缠绕着各种电线，像蜘蛛网一样交叉。杆上贴满小广告（通下水道、办证等），有些已经褪色剥落。电线杆顶端有变压器或路灯支架。是中国城市街头的标志性元素。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, Chinese concrete utility pole year 2000, tangled electrical wires, faded advertisement stickers on pole, transformer on top, urban street element, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view, transparent background --ar 1:3  
```

### 游戏用途
- 增强场景的时代真实感
- 可作为跳跃平台或掩体
- 小广告本身可作为彩蛋/线索

---

## 2.3 树木（梧桐、槐树）

### 元件信息
- **类型**: 大型自然环境
- **关卡**: 童年小巷、学校、公园
- **用途**: 背景装饰、遮蔽物

### 视觉描述
中国北方城市常见的行道树。梧桐树干粗壮灰白，叶片宽大稀疏；槐树枝叶茂密，夏天开花。黄昏光线穿透树叶，投下斑驳阴影。有些树干上有白色防虫涂漆。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, Chinese street trees year 2000, plane tree or locust tree, thick trunk with white pest control paint, sparse leaves, dappled shadows, golden dusk light through foliage, weirdcore dreamcore atmosphere, nostalgic lonely, low saturation, vhs filter, retro CRT aesthetic, side view, game background element --ar 1:2  
```

### 游戏用途
- 场景自然元素，打破建筑密集感
- 提供遮蔽和阴影区域
- 落叶效果可增强氛围

---

## 2.4 儿童乐园设施

### 元件信息
- **类型**: 大型环境设施
- **关卡**: 社区场景、公园
- **用途**: 童年记忆触发点

### 视觉描述
2000年代小区常见的老式儿童游乐设施：水泥滑滑梯（带动物造型）、铁架秋千、转椅/旋转木马。漆面褪色剥落，有些生锈，但依然能看到曾经的鲜艳色彩。此刻空无一人，显得寂寞而诡异。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, old Chinese playground equipment year 2000, concrete slide with animal design face eroded wrong, rusty metal swing set swaying no wind chains creaking silently, spinning merry-go-round turning slowly by itself, faded peeling paint colors wrong sickly, empty and hauntingly lonely, eerie childhood memory distorted into nightmare, liminal space playground at dusk forever, familiar but deeply wrong, uncanny atmosphere, traces of children but none present, soft eerie lighting long shadows wrong direction, low saturation desaturated, vhs static filter, retro CRT aesthetic, side view --ar 3:2
```

### 游戏用途
- 童年游戏记忆的触发物
- 可作为攀爬/跳跃的平台
- 营造"此刻空旷"的怪核氛围

---

## 2.5 自行车棚

### 元件信息
- **类型**: 大型环境设施
- **关卡**: 童年小巷、学校、工厂
- **用途**: 场景装饰、遮蔽区域

### 视觉描述
老旧的铁皮顶自行车棚，生锈的金属框架，里面停放着几辆老式自行车。棚顶有破损，阳光透过缝隙洒下。墙上挂着"请自觉摆放整齐"的褪色标语。中国社区的标志性场景。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, old Chinese bicycle shed year 2000, corrugated metal roof, rusty metal frame, old bicycles inside, damaged roof with light beams, faded slogan sign, community life element, weirdcore dreamcore atmosphere, nostalgic lonely, low saturation, vhs filter, retro CRT aesthetic, side view --ar 2:1  
```

### 游戏用途
- 可进入的遮蔽区域
- 停放的自行车可作为环境细节
- 触发"骑车上学"等记忆

---

## 2.6 公交站牌

### 元件信息
- **类型**: 大型环境设施
- **关卡**: 城市场景、学校周边
- **用途**: 场景标识、等待区域

### 视觉描述
老式公交站牌和候车亭，金属框架，上面有公交线路图和广告牌。站牌上有几路车的信息，有些被小广告覆盖。旁边有简易座椅，地面有积水或落叶。等待的孤独感。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, old Chinese bus stop year 2000, metal bus shelter frame, bus route information board, advertisement poster, simple bench, puddles on ground, waiting alone atmosphere, weirdcore dreamcore, nostalgic lonely, low saturation, vhs filter, retro CRT aesthetic, side view --ar 1:2  
```

### 游戏用途
- 城市场景的标志性元素
- 可作为休息/存档点
- 线路图可隐藏线索/彩蛋

---

## 2.7 宣传栏/布告栏

### 元件信息
- **类型**: 大型环境设施
- **关卡**: 学校、社区、工厂
- **用途**: 信息展示、叙事元素

### 视觉描述
玻璃橱窗式的宣传栏，里面贴着通知、表扬信、海报等。有些纸张已经泛黄卷边，玻璃上有灰尘和手印。可能是学校的"光荣榜"，社区的"文明公约"，或工厂的"安全生产"宣传。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, Chinese community bulletin board year 2000, glass display case, faded notices and posters inside, yellowed curled paper edges, dusty glass, school or neighborhood propaganda board, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view --ar 1:2  
```

### 游戏用途
- 展示游戏背景故事/线索
- 可互动查看内容
- 营造体制内的怀旧感

---

## 2.8 围墙/院墙

### 元件信息
- **类型**: 大型环境设施
- **关卡**: 所有户外场景
- **用途**: 场景边界、路径引导

### 视觉描述
红砖或水泥砌成的围墙，墙头有碎玻璃或铁丝网防盗刺。墙上可能有大字标语、涂鸦或爬山虎。有些地方墙皮脱落露出砖块。是划分空间、制造狭窄通道的重要元素。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, Chinese brick wall year 2000, red brick or concrete wall, broken glass on top, faded slogan characters, peeling plaster exposing bricks, ivy climbing, urban barrier element, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view, tileable --ar 4:1  
```

### 游戏用途
- 关卡边界和路径引导
- 可翻越的障碍物
- 标语可增强时代氛围

---

# 三、中型元件（家具/设施）

> 适用于室内外场景细节填充
> 尺寸建议：高度约为角色的1-2倍

---

## 3.1 熊猫垃圾桶

### 元件信息
- **类型**: 中型设施
- **关卡**: 童年小巷、学校、公园
- **用途**: 标志性环境元素

### 视觉描述
经典的绿色熊猫造型垃圾桶，熊猫双手张开抱着桶身，头部是可翻开投放垃圾的盖子。漆面有些褪色和划痕，但依然可爱。这是2000年代中国街头公园最常见的垃圾桶款式。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, Chinese panda trash can year 2000, green painted panda shape, cute design with open arms, hinged head lid, faded scratched paint, iconic street furniture, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view, transparent background --ar 1:1  
```

### 游戏用途
- 极具时代特色的环境标志
- 可互动翻找物品
- 触发"丢垃圾/捡东西"相关记忆

---

## 3.2 灌木/绿化带

### 元件信息
- **类型**: 中型自然环境
- **关卡**: 所有户外场景
- **用途**: 场景填充、遮蔽物

### 视觉描述
常见的城市绿化灌木，如黄杨、冬青等，修剪成方形或圆球形的绿篱。有些地方灌木丛长得茂密杂乱，边缘有野草。可用于遮挡视线或划分区域。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, Chinese urban hedge bushes year 2000, trimmed boxwood shrubs, overgrown edges with wild grass, green landscaping element, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view, tileable --ar 2:1  
```

### 游戏用途
- 可隐藏/躲藏的遮蔽物
- 场景边界软隔离
- 可掉落小物品（如藏在里面的弹珠）

---

## 3.3 石桌石凳

### 元件信息
- **类型**: 中型家具
- **关卡**: 社区、公园、学校
- **用途**: 休息区域、互动点

### 视觉描述
老式小区常见的圆形石桌配石凳，表面粗糙，经常被用来下棋、打牌、聊天。石桌上可能刻有棋盘格，凳面有些磨损发亮。周围可能有老人聚会的痕迹。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, Chinese stone table and stools year 2000, round stone table with chess board carved on surface, rough stone texture, worn smooth seats, community gathering spot, weirdcore dreamcore atmosphere, nostalgic lonely, low saturation, vhs filter, retro CRT aesthetic, side view --ar 2:1  
```

### 游戏用途
- 休息/存档点
- 可发现NPC或触发对话
- 桌上的棋盘可作为小游戏入口

---

## 3.4 信报箱

### 元件信息
- **类型**: 中型设施
- **关卡**: 童年小巷、居民区
- **用途**: 环境细节、叙事元素

### 视觉描述
老式居民楼下的绿色铁皮信报箱组，每个小格子对应一户人家。有些格子门开着，里面空空如也或塞满广告传单。箱体有锈迹，编号有些模糊。承载着"等信"的怀旧记忆。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, Chinese apartment mailbox unit year 2000, green metal mailbox array, small compartments for each household, some doors open with flyers inside, rusty surface, faded numbers, waiting for letters nostalgia, weirdcore dreamcore atmosphere, low saturation, vhs filter, retro CRT aesthetic, side view --ar 1:2  
```

### 游戏用途
- 可互动查找信件/物品
- 触发"收到信件"相关记忆
- 传单中可能隐藏线索

---

## 3.5 晾衣架

### 元件信息
- **类型**: 中型设施
- **关卡**: 童年小巷、居民区
- **用途**: 生活气息元素

### 视觉描述
典型的伸缩式金属晾衣架，上面挂着几件衣服床单。或者两棵树之间拉着的晾衣绳。衣物在微风中轻轻飘动，投下摇曳的阴影。极具中国社区生活气息。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, Chinese drying clothes rack year 2000, metal telescopic clothes rail, hanging shirts and bedsheets, clothes swaying in breeze, casting swaying shadows, daily life atmosphere, weirdcore dreamcore, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view --ar 2:1  
```

### 游戏用途
- 增强生活气息的环境装饰
- 可作为临时遮蔽物
- 衣物飘动动画增加场景活力

---

## 3.6 自行车

### 元件信息
- **类型**: 中型载具
- **关卡**: 所有户外场景
- **用途**: 交通工具、环境细节

### 视觉描述
老式"二八大杠"自行车或普通城市自行车，黑色或深绿色车架，后座有夹子可载物。车把上有车筐，车轮有些锈迹。可能停放在路边、车棚里，或倒在地上。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, old Chinese bicycle year 2000, classic 28 inch bike or city bike, black or dark green frame, rear cargo rack, front basket, slightly rusty wheels, parked or fallen over, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view, transparent background --ar 2:1  
```

### 游戏用途
- 可骑行的交通工具（如果实现）
- 场景中的重要装饰
- 触发"骑车"相关记忆

---

## 3.7 木柜/家具

### 元件信息
- **类型**: 中型家具
- **关卡**: 室内场景（家、商店）
- **用途**: 室内装饰、储物容器

### 视觉描述
老式实木柜子，深棕色或红木色，玻璃门或木门。柜顶可能放着老式座钟、花瓶等摆件。柜内透过玻璃可见碗碟、书籍或杂物。典型的2000年代中国家庭家具风格。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, Chinese wooden cabinet furniture year 2000, dark brown solid wood, glass doors showing dishes or books inside, old clock and vase on top, traditional home furniture, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view --ar 1:2  
```

### 游戏用途
- 室内场景的主要家具
- 可打开搜索物品
- 柜顶摆件可作为小型收集品

---

## 3.8 老式电视机（CRT）

### 元件信息
- **类型**: 中型电器
- **关卡**: 室内场景（家、商店）
- **用途**: 时代标志、叙事工具

### 视觉描述
厚重的CRT显像管电视机，21-29英寸，深灰色或米白色塑料外壳。屏幕略凸，可能显示雪花噪点或模糊的画面。电视机上方可能有盖布，旁边有遥控器。2000年代家庭的核心电器。

### Midjourney Prompt
```
pixel art, 2D side-scrolling game prop, old CRT television set year 2000, bulky cathode ray tube TV, dark gray or beige plastic casing, slightly convex screen with static noise, dust cover cloth on top, remote control nearby, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view --ar 1:1  
```

### 游戏用途
- 极具时代特色的标志性物品
- 屏幕可显示线索/剧情信息
- 雪花画面可增强怪核氛围

---

# 四、小型元件（物品/摆件）

> 适用于收集品、互动物品、场景细节
> 尺寸建议：可放入背包/物品栏的小物件

---

## 4.1 磁带/录音带

### 元件信息
- **类型**: 小型收集品
- **关卡**: 家、商店、学校
- **用途**: 核心收集品、音乐触发器

### 视觉描述
经典的 cassette 磁带，塑料外壳，两侧有两个卷轴孔。磁带标签上可能手写着歌曲名或"英语听力"。有些磁带盒是透明的，可以看到棕色磁带。2000年代逐渐被CD取代但仍普遍存在。

### Midjourney Prompt
```
pixel art, 2D game item icon, audio cassette tape year 2000, plastic cassette shell, two reel holes visible, handwritten label with song titles, transparent case showing brown magnetic tape, nostalgic music media, weirdcore dreamcore atmosphere, low saturation, vhs filter, retro CRT aesthetic, top-down view, transparent background, inventory item sprite --ar 1:1  
```

### 游戏用途
- 核心收集品，收集后可解锁背景音乐
- 每盘磁带对应一首怀旧歌曲
- 触发"听歌/学英语"相关记忆

---

## 4.2 地球仪

### 元件信息
- **类型**: 小型摆件
- **关卡**: 家、学校、办公室
- **用途**: 场景装饰、互动物品

### 视觉描述
小型桌面地球仪，蓝色海洋和彩色大陆。金属支架有些发黑，球体可以转动。表面可能有轻微划痕或褪色。放在书桌或柜子上，代表对外面世界的向往。

### Midjourney Prompt
```
pixel art, 2D game item icon, small desktop globe year 2000, blue oceans and colored continents, metal stand slightly tarnished, rotatable sphere, minor scratches on surface, world map decor, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view, transparent background --ar 1:1  
```

### 游戏用途
- 室内场景的装饰性摆件
- 互动后可触发"想去远方"的独白
- 可能标记某个地点作为线索

---

## 4.3 橡皮鸭子

### 元件信息
- **类型**: 小型玩具
- **关卡**: 家（浴室）、商店
- **用途**: 童年玩具、收集品

### 视觉描述
经典的黄色橡皮鸭子，橙色嘴巴，造型可爱简单。表面有些褪色或沾着水渍。是洗澡时的童年玩具，承载着最纯粹的记忆。

### Midjourney Prompt
```
pixel art, 2D game item icon, yellow rubber duck toy year 2000, cute simple design, orange beak, slightly faded surface, bath toy nostalgia, childhood memory object, weirdcore dreamcore atmosphere, low saturation, vhs filter, retro CRT aesthetic, side view, transparent background, inventory sprite --ar 1:1  
```

### 游戏用途
- 童年玩具类收集品
- 触发洗澡/童年快乐记忆
- 可作为浴室场景的关键物品

---

## 4.4 盗版光碟/VCD

### 元件信息
- **类型**: 小型收集品
- **关卡**: 家、商店、路边摊
- **用途**: 核心收集品、剧情触发器

### 视觉描述
圆形VCD/DVD光盘，银色反光表面，中心有圆孔。光碟盒或纸套上印着模糊的电影/游戏封面，可能写着"高清"、"全集"等字样。2000年代盗版光盘文化的标志。

### Midjourney Prompt
```
pixel art, 2D game item icon, pirated VCD DVD disc year 2000, silver reflective surface with center hole, plastic case or paper sleeve with blurry movie cover, chinese characters for HD or complete collection, bootleg media culture, weirdcore dreamcore atmosphere, low saturation, vhs filter, retro CRT aesthetic, top view, transparent background --ar 1:1  
```

### 游戏用途
- 收集后可观看片段/触发回忆
- 代表2000年代独特的盗版文化
- 可能包含隐藏的剧情线索

---

## 4.5 不锈钢锅

### 元件信息
- **类型**: 小型厨具
- **关卡**: 家（厨房）、商店
- **用途**: 生活气息物品

### 视觉描述
典型的家用不锈钢锅，银色金属光泽，单手柄或双耳。锅底可能有些发黑（用久了的痕迹）。中国家庭厨房的必备品，承载着"妈妈做饭"的温暖记忆。

### Midjourney Prompt
```
pixel art, 2D game item icon, stainless steel cooking pot year 2000, silver metallic shine, single handle or dual ears, slightly blackened bottom from use, chinese kitchen essential, home cooking warmth, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view, transparent background --ar 1:1  
```

### 游戏用途
- 厨房场景的标志性物品
- 触发"家/妈妈/吃饭"相关记忆
- 可能作为简单的互动道具

---

## 4.6 热水瓶

### 元件信息
- **类型**: 小型家电
- **关卡**: 家、办公室、学校
- **用途**: 生活物品、怀旧标志

### 视觉描述
老式热水瓶，塑料外壳（通常是红色或绿色），内胆是玻璃真空保温层。瓶塞是软木或塑料。2000年代中国家庭的标配，代表着热水的温暖和家的感觉。

### Midjourney Prompt
```
pixel art, 2D game item icon, chinese thermos flask year 2000, plastic outer shell red or green, glass vacuum liner inside, cork or plastic stopper, household essential, hot water warmth, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view, transparent background --ar 1:2  
```

### 游戏用途
- 极具时代特色的生活物品
- 触发"喝热水/家人关怀"记忆
- 可能用于解谜（如倒水）

---

## 4.7 玻璃弹珠

### 元件信息
- **类型**: 小型玩具/收集品
- **关卡**: 童年场景、商店
- **用途**: 童年游戏、收集品

### 视觉描述
透明玻璃弹珠，内部有彩色螺旋花纹。通常是单颗或装在小袋子里。表面光滑反光，是非常具有童年回忆的玩具，用于弹珠游戏。

### Midjourney Prompt
```
pixel art, 2D game item icon, glass marble ball year 2000, transparent glass sphere with colorful spiral pattern inside, smooth reflective surface, childhood game toy, single or in small bag, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, top view, transparent background --ar 1:1  
```

### 游戏用途
- 童年玩具类收集品
- 可用于小游戏（弹珠游戏）
- 触发"和小伙伴玩耍"记忆

---

## 4.8 小霸王游戏卡带

### 元件信息
- **类型**: 小型收集品
- **关卡**: 家、商店
- **用途**: 核心收集品、游戏触发器

### 视觉描述
FC/NES游戏机卡带，灰色塑料外壳，背面有标签写着游戏名称。经典的"小霸王其乐无穷"时代的标志。卡带上有防尘盖（可能已丢失）。2000年代中国孩子的珍贵财产。

### Midjourney Prompt
```
pixel art, 2D game item icon, Famicom NES game cartridge year 2000, gray plastic shell, label on back with game title in chinese, retro gaming cartridge, dust cover possibly missing, xiaobawang console era, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, front view, transparent background --ar 1:1  
```

### 游戏用途
- 核心收集品，收集后可玩迷你游戏
- 触发"玩游戏/暑假/童年快乐"记忆
- 代表2000年代游戏文化

---

## 4.9 褪色红包

### 元件信息
- **类型**: 小型物品
- **关卡**: 家、春节场景
- **用途**: 特殊收集品、叙事元素

### 视觉描述
红色纸质红包，金色"福"字或"恭喜发财"图案。有些褪色、折痕，可能是被保存了很久的。里面可能空了，也可能还有一张旧钞票。春节记忆的载体。

### Midjourney Prompt
```
pixel art, 2D game item icon, faded red envelope hongbao year 2000, red paper packet with gold chinese characters, slightly worn with creases, saved for long time, chinese new year memory, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, front view, transparent background --ar 1:1  
```

### 游戏用途
- 春节主题的特殊收集品
- 触发"过年/压岁钱/家人"记忆
- 可能发现里面的旧钞票作为彩蛋

---

## 4.10 泛黄照片

### 元件信息
- **类型**: 小型剧情物品
- **关卡**: 家、各种场景
- **用途**: 叙事核心、记忆碎片

### 视觉描述
老式胶卷冲印的照片，边缘有白色边框，照片本身已经泛黄褪色。照片内容模糊，可能是家庭合影、风景、或某个已忘记的人。代表着碎片化、模糊的记忆。

### Midjourney Prompt
```
pixel art, 2D game item icon, old faded photograph year 2000, film printed photo with white borders, yellowed and discolored, blurry image of family or landscape, memory fragment, nostalgic melancholy, weirdcore dreamcore atmosphere, low saturation, vhs filter, retro CRT aesthetic, front view, transparent background --ar 3:2  
```

### 游戏用途
- 核心叙事物品，推进剧情
- 每张照片揭示一段记忆
- "看不清"的特性增强怪核氛围

---

## 4.11 旧玩具车

### 元件信息
- **类型**: 小型玩具
- **关卡**: 家、童年场景
- **用途**: 童年玩具、收集品

### 视觉描述
简单的塑料或铁皮玩具小车，可能是回力车或惯性车。漆面有些掉漆，轮子依然能转。颜色可能是红色、蓝色等鲜艳但略显褪色的色调。童年玩耍的见证。

### Midjourney Prompt
```
pixel art, 2D game item icon, old toy car year 2000, plastic or tin toy vehicle, pull-back or friction powered, paint slightly chipped, wheels still working, faded bright colors red or blue, childhood plaything, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, side view, transparent background --ar 2:1  
```

### 游戏用途
- 童年玩具类收集品
- 可能有简单的互动（推着走）
- 触发"玩耍/童年无忧"记忆

---

## 4.12 针线盒

### 元件信息
- **类型**: 小型生活用品
- **关卡**: 家、裁缝店
- **用途**: 生活物品、解谜道具

### 视觉描述
圆形或方形的针线盒，里面装有各色线团、针、纽扣等。盒子可能是塑料或竹制的，盖子上可能有刺绣图案。代表着"妈妈/奶奶缝补衣服"的温暖记忆。

### Midjourney Prompt
```
pixel art, 2D game item icon, sewing kit box year 2000, round or rectangular container with thread spools needles buttons inside, plastic or bamboo box, embroidered pattern on lid, mending clothes memory, warm family feeling, weirdcore dreamcore atmosphere, nostalgic, low saturation, vhs filter, retro CRT aesthetic, top view with open lid, transparent background --ar 1:1  
```

### 游戏用途
- 生活用品类收集品
- 可用于简单解谜（缝补/获取线）
- 触发"家人关怀"相关记忆

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-02-08 | 1.0 | 创建文档框架，完成巨型元件（建筑）9项 |
| 2026-02-08 | 1.1 | 完成大型元件（环境/设施）8项 |
| 2026-02-08 | 1.2 | 完成中型元件（家具/设施）8项 |
| 2026-02-08 | 1.3 | 完成小型元件（物品/摆件）12项，文档完整 |
| 2026-02-08 | 1.4 | **增强怪核/梦核氛围**：添加liminal space、uncanny、familiar but wrong等核心关键词，更新主要建筑prompt增强诡异空旷感 |

---

## 附录：快速参考

### 元件总览

| 分类 | 数量 | 主要用途 |
|------|------|----------|
| 巨型元件（建筑） | 9 | 关卡背景、视差层 |
| 大型元件（环境/设施） | 8 | 场景装饰、氛围营造 |
| 中型元件（家具/设施） | 8 | 室内外细节、互动点 |
| 小型元件（物品/摆件） | 12 | 收集品、剧情物品 |
| **总计** | **37** | - |

### Midjourney 参数速查

| 元件类型 | 推荐 --ar | 说明 |
|----------|-----------|------|
| 巨型建筑 | 16:9 | 横版背景 |
| 大型设施 | 1:2 ~ 4:1 | 根据实际比例 |
| 中型家具 | 1:1 ~ 1:2 | 近方形或竖长 |
| 小型物品 | 1:1 ~ 3:2 | 图标尺寸 |

### 通用后缀

所有 Midjourney Prompt 建议添加怪核/梦核关键词：
```
liminal space, uncanny atmosphere, eerily empty, familiar but wrong, childhood memory distorted, low saturation desaturated, vhs static filter, retro CRT aesthetic
```

如需更强的诡异感可添加：
```
something is off, wrong perspective, soft eerie lighting, backrooms aesthetic, dreamlike hazy, unsettling nostalgia
```

如需透明背景可添加：
```
isolated on solid white background, subject only, no background elements --no background
```
（注意：Midjourney 不支持真正透明背景，需后期处理）
