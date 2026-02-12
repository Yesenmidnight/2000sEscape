# RPGMaker MZ 快速参考卡片

> 一页纸的快速参考，适合在编码时随时查阅。

## 全局变量速查

| 变量 | 类型 | 描述 | 存档 |
|------|------|------|------|
| `$dataActors` | Array | 角色数据库 | ❌ |
| `$dataItems` | Array | 道具数据库 | ❌ |
| `$dataSkills` | Array | 技能数据库 | ❌ |
| `$dataMap` | Object | 当前地图数据 | ❌ |
| `$dataSystem` | Object | 系统设置 | ❌ |
| `$gameActors` | Game_Actors | 角色管理 | ✅ |
| `$gameParty` | Game_Party | 队伍状态 | ✅ |
| `$gameMap` | Game_Map | 地图状态 | ✅ |
| `$gamePlayer` | Game_Player | 玩家 | ✅ |
| `$gameSwitches` | Game_Switches | 开关 | ✅ |
| `$gameVariables` | Game_Variables | 变量 | ✅ |
| `$gameSelfSwitches` | Game_SelfSwitches | 自开关 | ✅ |
| `$gameTemp` | Game_Temp | 临时数据 | ❌ |

## 常用操作

### 获取角色
```javascript
$gameActors.actor(actorId);        // 任意角色
$gameParty.members()[index];       // 队伍成员
$gameParty.leader();               // 队伍领队
```

### 开关/变量
```javascript
$gameSwitches.value(id);
$gameSwitches.setValue(id, true/false);
$gameVariables.value(id);
$gameVariables.setValue(id, value);
$gameSelfSwitches.value("mapId,eventId,A/B/C/D");
```

### 物品
```javascript
$gameParty.numItems(item);
$gameParty.gainItem(item, amount);
$gameParty.loseItem(item, amount);
$gameParty.hasItem(item);
```

### 位置/移动
```javascript
$gamePlayer.x, $gamePlayer.y;      // 地图坐标
$gamePlayer.reserveTransfer(mapId, x, y, direction, fadeType);
$gameMap.event(eventId);           // 获取事件
```

### 场景
```javascript
SceneManager.goto(Scene_Map);
SceneManager.push(Scene_Menu);
SceneManager.pop();
SceneManager._scene;               // 当前场景
```

## 方向常量

```
    8 (上)
4 (左)   6 (右)
    2 (下)
```

## 参数ID

| ID | 参数 |
|----|------|
| 0 | MHP 最大HP |
| 1 | MMP 最大MP |
| 2 | ATK 攻击力 |
| 3 | DEF 防御力 |
| 4 | MAT 魔法攻击 |
| 5 | MDF 魔法防御 |
| 6 | AGI 敏捷 |
| 7 | LUK 幸运 |

## 事件指令代码 (部分)

| 代码 | 指令 |
|------|------|
| 101 | 显示文字 |
| 102 | 显示选择项 |
| 111 | 条件分支 |
| 112 | 循环 |
| 121 | 控制开关 |
| 122 | 控制变量 |
| 201 | 场所移动 |
| 205 | 设置移动路线 |
| 231 | 显示图片 |
| 241 | 播放BGM |
| 301 | 战斗处理 |
| 331 | 增减HP |
| 337 | 更改装备 |

## Window创建 (MZ)

```javascript
const rect = new Rectangle(x, y, width, height);
const window = new Window_XXX(rect);
this.addWindow(window);
```

## Sprite基本操作

```javascript
sprite.bitmap = ImageManager.loadCharacter(name);
sprite.x = x;
sprite.y = y;
sprite.opacity = 255;
sprite.scale.x = 1;
sprite.anchor.x = 0.5;
```

## 战斗相关

```javascript
BattleManager.setup(troopId, canEscape, canLose);
$gameTroop.members();              // 敌人列表
$gameParty.inBattle();             // 是否战斗中
```

## 常用检查

```javascript
// 角色
actor.isAlive();
actor.isDead();
actor.isStateAffected(stateId);
actor.canUse(item);

// 队伍
$gameParty.size();
$gameParty.isFull();
$gameParty.hasItem(item);

// 地图
$gameMap.isValid(x, y);
$gameMap.isPassable(x, y, d);
$gameMap.eventIdXy(x, y);
```

## 类型检查

```javascript
DataManager.isSkill(item);
DataManager.isItem(item);
DataManager.isWeapon(item);
DataManager.isArmor(item);
```

## 文件位置

| 文件 | 内容 |
|------|------|
| `js/rmmz_core.js` | 核心类和扩展 |
| `js/rmmz_managers.js` | 静态管理器 |
| `js/rmmz_objects.js` | 游戏对象 |
| `js/rmmz_scenes.js` | 场景类 |
| `js/rmmz_sprites.js` | 精灵类 |
| `js/rmmz_windows.js` | 窗口类 |
| `js/plugins.js` | 插件配置 |
| `data/*.json` | 数据库文件 |

## 注意事项

1. **数组索引从1开始** - `$dataItems[0]` 是 `null`
2. **静态类不能new** - 如 `DataManager`, `SceneManager`
3. **Window需要Rectangle** - 不是四个数字
4. **图片加载是异步的** - 使用 `addLoadListener`
5. **消息是异步的** - 不会阻塞代码执行
6. **$data是静态的** - 不应该被修改
7. **$game是动态的** - 会被保存到存档
