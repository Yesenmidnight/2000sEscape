# RPGMaker MZ 全局变量参考

> 本文档列出所有全局变量及其用途，避免AI模型混淆 `$data` 和 `$game` 变量。

## 数据库数据变量 ($dataXXX)

这些变量存储**静态数据库数据**，从JSON文件加载，**不应该被修改**。

| 变量名 | 对应JSON | 描述 |
|--------|----------|------|
| `$dataActors` | Actors.json | 角色数据库 |
| `$dataClasses` | Classes.json | 职业数据库 |
| `$dataSkills` | Skills.json | 技能数据库 |
| `$dataItems` | Items.json | 道具数据库 |
| `$dataWeapons` | Weapons.json | 武器数据库 |
| `$dataArmors` | Armors.json | 防具数据库 |
| `$dataEnemies` | Enemies.json | 敌人数据库 |
| `$dataTroops` | Troops.json | 敌群数据库 |
| `$dataStates` | States.json | 状态数据库 |
| `$dataAnimations` | Animations.json | 动画数据库 |
| `$dataTilesets` | Tilesets.json | 图块集数据库 |
| `$dataCommonEvents` | CommonEvents.json | 公共事件数据库 |
| `$dataSystem` | System.json | 系统设置 |
| `$dataMapInfos` | MapInfos.json | 地图列表信息 |
| `$dataMap` | MapXXX.json | 当前加载的地图数据 |

### 重要说明

1. **$dataXXX数组从索引1开始**
   ```javascript
   // 正确
   $dataItems[1]  // 第一个道具

   // 错误！索引0通常是null
   $dataItems[0]  // null
   ```

2. **$dataMap是动态的**
   - 当玩家进入新地图时，`$dataMap`会被替换为新地图的数据
   - 不要缓存`$dataMap`的引用

3. **$dataSystem包含全局设置**
   ```javascript
   $dataSystem.gameTitle      // 游戏标题
   $dataSystem.startMapId     // 初始地图ID
   $dataSystem.startX         // 初始X坐标
   $dataSystem.startY         // 初始Y坐标
   $dataSystem.partyMembers   // 初始队伍成员
   $dataSystem.optSideView    // 是否侧视战斗
   $dataSystem.advanced       // 高级设置对象
   ```

## 游戏状态变量 ($gameXXX)

这些变量存储**运行时游戏状态**，会被保存到存档中。

| 变量名 | 类型 | 描述 |
|--------|------|------|
| `$gameTemp` | Game_Temp | 临时数据（不存档） |
| `$gameSystem` | Game_System | 系统设置状态 |
| `$gameScreen` | Game_Screen | 屏幕效果状态 |
| `$gameTimer` | Game_Timer | 计时器状态 |
| `$gameMessage` | Game_Message | 消息窗口状态 |
| `$gameSwitches` | Game_Switches | 开关 |
| `$gameVariables` | Game_Variables | 变量 |
| `$gameSelfSwitches` | Game_SelfSwitches | 自开关 |
| `$gameActors` | Game_Actors | 角色管理器 |
| `$gameParty` | Game_Party | 队伍状态 |
| `$gameTroop` | Game_Troop | 敌群状态（战斗中） |
| `$gameMap` | Game_Map | 地图状态 |
| `$gamePlayer` | Game_Player | 玩家角色 |

### 重要说明

1. **$gameTemp不存档**
   - `$gameTemp`存储临时数据，读取存档后会重置
   - 用于存储公共事件队列、动画队列等

2. **$gameActors是角色池**
   ```javascript
   // 获取角色实例
   $gameActors.actor(1)  // 返回ID为1的角色

   // 不要与$dataActors混淆
   $dataActors[1]        // 返回数据库中的角色定义（静态）
   $gameActors.actor(1)  // 返回游戏中的角色实例（动态）
   ```

3. **$gameParty vs $gameActors**
   ```javascript
   // $gameParty - 当前队伍
   $gameParty.members()      // 队伍中的角色
   $gameParty.leader()       // 队伍领队
   $gameParty.items()        // 道具列表

   // $gameActors - 所有角色
   $gameActors.actor(1)      // 特定角色，无论是否在队伍中
   ```

4. **开关和变量**
   ```javascript
   // 开关 (布尔值)
   $gameSwitches.value(1)       // 获取开关1的值
   $gameSwitches.setValue(1, true)  // 设置开关1

   // 变量 (数值)
   $gameVariables.value(1)      // 获取变量1的值
   $gameVariables.setValue(1, 100)  // 设置变量1

   // 自开关 (格式: "地图ID,事件ID,开关字母")
   $gameSelfSwitches.value("1,2,A")  // 地图1,事件2,自开关A
   ```

## 其他全局变量

| 变量名 | 描述 |
|--------|------|
| `$plugins` | 插件配置数组（在plugins.js中定义） |
| `$testEvent` | 测试事件（测试模式使用） |

## 常见错误

### 错误1: 混淆 $data 和 $game
```javascript
// 错误！$dataActors是静态数据
$dataActors[1].hp = 100;  // 这不会影响游戏

// 正确！使用$gameActors获取运行时实例
$gameActors.actor(1).setHp(100);
```

### 错误2: 访问空索引
```javascript
// 危险！索引0通常是null
const item = $dataItems[0];  // null
if (item.name) { ... }       // 崩溃！

// 安全做法
if ($dataItems[id] && $dataItems[id].name) { ... }
```

### 错误3: 在地图外访问地图数据
```javascript
// 危险！$gameMap可能未初始化
$gameMap.eventId(5, 5);  // 如果不在地图上会出错

// 安全做法
if ($gameMap && $gameMap.mapId() > 0) {
    // 地图已加载
}
```

### 错误4: 修改 $data 变量
```javascript
// 错误！这会影响整个游戏
$dataItems[1].name = "新名字";

// 如果需要临时修改，使用$gameVariables或自定义对象
```
