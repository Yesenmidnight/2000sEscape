# 逃离千禧年 - 快速入门指南

## 插件已安装

所有插件已安装在 `js/plugins/` 目录下，并在 `plugins.js` 中注册。在 RPG Maker MZ 中打开项目即可看到这些插件。

## 地图规划

建议创建以下地图：

| 地图ID | 名称 | 用途 |
|--------|------|------|
| 1 | 标题/测试 | 开发测试用 |
| 2 | 梦境大厅 | 撤离后返回的枢纽 |
| 3 | 童年小巷 | 第一个可玩关卡 |
| 4+ | 其他关卡 | 后续扩展 |

## 事件设置

### 1. 创建回忆物品（可搜集物品）

在地图上创建事件，设置以下备注(Note)：

```
<MemoryItem>
<itemId:1>
```

物品ID对应数据库中的物品，物品备注中可以设置：

```
<memoryValue:15>
<rare>
```

### 2. 创建敌人

在地图上创建事件，设置以下备注：

```
<ESCEnemy>
<enemyHP:30>
<enemyDamage:5>
<enemySpeed:0.03>
<enemySight:4>
<enemyDrop:1>
```

- `enemyHP`: 敌人生命值
- `enemyDamage`: 敌人攻击伤害
- `enemySpeed`: 移动速度
- `enemySight`: 视野范围（格子数）
- `enemyDrop`: 死亡掉落物品ID

### 3. 创建撤离点

在地图上创建事件，设置以下备注：

```
<ExtractionPoint>
<extractionType:basic>
<extractionTime:3>
<requiredValue:0>
<extractionRange:1>
```

- `extractionType`: basic / conditional / rare
- `extractionTime`: 撤离需要的时间（秒）
- `requiredValue`: 最低回忆价值要求
- `extractionRange`: 撤离点触发范围

## 数据库设置

### 物品（Items）

创建回忆物品，设置备注：

| ID | 名称 | 备注 | 说明 |
|----|------|------|------|
| 1 | 旧玩具车 | `<memoryValue:15>` | 普通物品 |
| 2 | 泛黄照片 | `<memoryValue:30><rare>` | 稀有物品 |
| 3 | 童年日记本 | `<memoryValue:100><legendary>` | 传说物品 |

### 武器（Weapons）

创建可购买的武器：

| ID | 名称 | 攻击力 | 用途 |
|----|------|--------|------|
| 1 | 记忆碎片 | 5 | 初始武器 |
| 2 | 怀旧玩具 | 10 | 商店购买 |

### 变量使用

游戏变量被以下用途占用：

| 变量ID | 用途 |
|--------|------|
| 1 | 回忆货币 |
| 2 | 记忆等级 |
| 3 | 总撤离次数 |
| 4 | 当前关卡回忆价值 |
| 5 | 撤离点检测 |

## 战斗操作

- **攻击**: 按确定键（空格/回车）
- **移动**: 方向键
- **撤离**: 站在撤离点上按住确定键

## 插件命令

在事件中可以使用以下插件命令：

### 物品系统
- `spawnLoot x y itemId` - 在指定位置生成掉落物
- `getTotalValue variableId` - 获取当前回忆价值到变量

### 撤离系统
- `forceExtraction` - 强制触发撤离结算
- `checkExtractionAccess variableId` - 检查是否在撤离点

### 梦境大厅
- `showNodeSelect` - 显示节点选择界面
- `showShop` - 显示商店
- `showLevelUp` - 显示升级界面
- `getCoins variableId` - 获取货币数量
- `addCoins amount` - 增加货币
- `getLevel variableId` - 获取等级

### 视觉效果
- `setEffect effect value` - 设置效果强度
- `toggleEffect effect enabled` - 开关效果
- `applySceneEffect scene` - 应用场景效果

## 12小时直播开发建议

### 第1-2小时：基础搭建
- [ ] 创建梦境大厅地图（地图2）
- [ ] 创建第一个关卡地图（地图3）
- [ ] 设置基本的图块和装饰

### 第3-4小时：物品系统
- [ ] 创建5-10个回忆物品
- [ ] 在关卡中放置物品事件
- [ ] 测试收集功能

### 第5-6小时：敌人系统
- [ ] 创建1-2种敌人
- [ ] 设置敌人事件
- [ ] 调整战斗平衡

### 第7-8小时：撤离系统
- [ ] 创建撤离点
- [ ] 测试撤离流程
- [ ] 调整结算界面

### 第9-10小时：梦境大厅
- [ ] 设置大厅NPC（商店、升级）
- [ ] 创建关卡入口
- [ ] 测试完整循环

### 第11-12小时：打磨
- [ ] 调整视觉效果
- [ ] 添加背景音乐
- [ ] 最终测试

## 调试命令

在测试模式下，打开控制台(F12)可以使用：

```javascript
// 添加货币
ESCDebug.addCoins(100)

// 查看游戏状态
ESCDebug.getState()

// 重置关卡状态
ESCDebug.resetState()
```

## 文件结构

```
2000sEscape/
├── js/
│   └── plugins/
│       ├── ESC_Core.js          # 核心系统
│       ├── ESC_CollisionBattle.js  # 战斗系统
│       ├── ESC_MemoryItem.js    # 物品系统
│       ├── ESC_Extraction.js    # 撤离系统
│       ├── ESC_DreamLobby.js    # 梦境大厅
│       └── ESC_VisualEffects.js # 视觉效果
├── data/
│   └── ... (数据库文件)
├── docs/
│   ├── DESIGN.md    # 设计文档
│   └── QUICKSTART.md # 本文件
└── ...
```

## 注意事项

1. **插件顺序**: 插件已按依赖顺序排列，请勿随意调整
2. **地图ID**: 梦境大厅默认为地图2，可在插件参数中修改
3. **物品ID**: 预设物品与数据库物品需对应
4. **性能**: 视觉效果可能影响性能，可在插件中关闭部分效果

---

祝直播顺利！🎮
