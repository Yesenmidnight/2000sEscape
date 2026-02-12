# RPGMaker MZ Game对象系统

> Game_XXX 类是RPGMaker的核心游戏逻辑类，包含游戏状态和规则。

## 类继承层次

```
Game_BattlerBase
    └── Game_Battler
            ├── Game_Actor
            └── Game_Enemy

Game_CharacterBase
    └── Game_Character
            ├── Game_Player
            ├── Game_Follower
            ├── Game_Vehicle
            └── Game_Event

Game_Unit
    ├── Game_Party
    └── Game_Troop
```

## Game_BattlerBase / Game_Battler

这是所有战斗单位（角色和敌人）的基类。

### 核心属性 (通过getter访问)

```javascript
// 基础参数 (param 0-7)
battler.mhp  // 最大HP (param 0)
battler.mmp  // 最大MP (param 1)
battler.atk  // 攻击力 (param 2)
battler.def  // 防御力 (param 3)
battler.mat  // 魔法攻击 (param 4)
battler.mdf  // 魔法防御 (param 5)
battler.agi  // 敏捷 (param 6)
battler.luk  // 幸运 (param 7)

// 当前值
battler.hp   // 当前HP
battler.mp   // 当前MP
battler.tp   // 当前TP
```

### 重要方法

```javascript
// 生命状态
battler.isAlive();
battler.isDead();
battler.isDying();  // HP低于25%

// 行动能力
battler.canMove();
battler.isConfused();
battler.isParalyzed();

// 状态
battler.isStateAffected(stateId);
battler.isDeathStateAffected();
battler.addState(stateId);
battler.removeState(stateId);

// Buff/Debuff
battler.isBuffAffected(paramId);
battler.isDebuffAffected(paramId);
battler.addBuff(paramId, turns);
battler.addDebuff(paramId, turns);

// 技能
battler.canUse(item);
battler.canPayCost(item);
battler.paySkillCost(skill);

// 战斗
battler.makeActions();
battler.clearActions();
battler.currentAction();
```

## Game_Actor

继承自 Game_Battler，表示玩家角色。

### 特有属性和方法

```javascript
// 基础信息
actor.actorId();
actor.name();
actor.nickname();
actor.faceIndex();
actor.characterName();
actor.faceName();
actor.battlerName();

// 等级系统
actor.level;
actor.expForLevel(level);
actor.currentLevelExp();
actor.nextLevelExp();
actor.nextRequiredExp();
actor.changeLevel(level, show);

// 经验值
actor.gainExp(exp);
actor.loseExp(exp);
actor.initExp();

// 职业系统
actor.classId();
actor.currentClass();
actor.changeClass(classId, keepExp);

// 技能系统
actor.skills();           // 已学技能列表
actor.learnedSkills();    // 已学技能ID数组
actor.learnSkill(skillId);
actor.forgetSkill(skillId);
actor.isLearnedSkill(skillId);

// 装备系统
actor.equips();           // 装备对象数组
actor.weapons();          // 武器数组
actor.armors();           // 防具数组
actor.changeEquip(slotId, item);
actor.changeEquipById(etypeId, itemId);
actor.clearEquipments();
actor.isEquipChangeOk(slotId);

// 特征(Traits)
actor.traitObjects();     // 所有特征来源
actor.allTraits();
actor.paramBase(paramId);
actor.paramPlus(paramId);
```

### 获取角色的两种方式

```javascript
// 方式1: 通过$gameActors（推荐）
const actor = $gameActors.actor(actorId);

// 方式2: 通过$gameParty（仅限队伍成员）
const actor = $gameParty.members()[index];
const actor = $gameParty.leader();
```

## Game_Enemy

继承自 Game_Battler，表示敌人。

### 特有方法

```javascript
// 基础信息
enemy.enemyId();
enemy.enemy();        // 返回$dataEnemies中的数据
enemy.name();
enemy.battlerName();

// 掉落
enemy.dropItems();    // 掉落物品列表
enemy.isDropItemValid(dropItem);

// 行动
enemy.enemyActions();
enemy.action(actionId);

// 金钱和经验
enemy.exp();
enemy.gold();

// 位置（战斗中）
enemy.index();        // 在敌群中的索引
enemy.screenX();
enemy.screenY();
```

## Game_Party

继承自 Game_Unit，管理玩家队伍。

### 成员管理

```javascript
// 获取成员
$gameParty.members();       // 所有成员
$gameParty.aliveMembers();  // 存活成员
$gameParty.deadMembers();   // 死亡成员
$gameParty.movableMembers();// 可行动成员
$gameParty.leader();        // 领队

// 角色操作
$gameParty.addActor(actorId);
$gameParty.removeActor(actorId);

// 队伍信息
$gameParty.size();
$gameParty.isFull();
$gameParty.maxBattleMembers();
$gameParty.battleMembers();
$gameParty.inBattle();
```

### 物品管理

```javascript
// 物品数量
$gameParty.items();         // 道具列表
$gameParty.weapons();       // 武器列表
$gameParty.armors();        // 防具列表
$gameParty.allItems();      // 所有物品

// 数量查询
$gameParty.numItems(item);
$gameParty.hasItem(item);
$gameParty.hasAnyItems();

// 物品操作
$gameParty.gainItem(item, amount, includeEquip);
$gameParty.loseItem(item, amount);
$gameParty.consumeItem(item);

// 装备
$gameParty.equipItems();
$gameParty.hasDropItems();
```

### 金钱和步数

```javascript
$gameParty.gold();
$gameParty.gainGold(amount);
$gameParty.loseGold(amount);

$gameParty.steps();
```

## Game_Troop

继承自 Game_Unit，管理敌人群组。

### 主要方法

```javascript
// 敌人列表
$gameTroop.members();
$gameTroop.aliveMembers();
$gameTroop.deadMembers();
$gameTroop.movableMembers();

// 敌群信息
$gameTroop.troopId();
$gameTroop.troop();         // $dataTroops中的数据

// 战斗设置
$gameTroop.setup(troopId);
$gameTroop.makeUniqueNames();

// 掉落和奖励
$gameTroop.goldTotal();
$gameTroop.expTotal();
$gameTroop.makeDropItems();

// 战斗事件
$gameTroop.turnCount();
$gameTroop.canEscape();
$gameTroop.canLose();
```

## Game_Map

管理地图状态和逻辑。

### 地图信息

```javascript
$gameMap.mapId();
$gameMap.tileset();
$gameMap.displayName();
$gameMap.width();
$gameMap.height();
$gameMap.isAnyEventStarting();
```

### 事件管理

```javascript
// 获取事件
$gameMap.event(eventId);
$gameMap.events();
$gameMap.eventsXy(x, y);
$gameMap.eventIdXy(x, y);

// 事件执行
$gameMap.setupStartingEvent();
$gameMap.isEventRunning();
```

### 坐标和图块

```javascript
// 坐标验证
$gameMap.isValid(x, y);
$gameMap.isPassable(x, y, d);

// 图块信息
$gameMap.tileId(x, y, z);
$gameMap.terrainTag(x, y);
$gameMap.autoplayBgm();

// 区域ID
$gameMap.regionId(x, y);
```

### 滚动和显示

```javascript
$gameMap.setDisplayPos(x, y);
$gameMap.parallaxOx();
$gameMap.parallaxOy();
$gameMap.refresh();
$gameMap.requestRefresh();
```

## Game_CharacterBase / Game_Character

所有地图角色的基类（玩家、跟随者、载具、事件）。

### 位置和移动

```javascript
chara.x;
chara.y;
chara.direction;
chara.isMoving();
chara.isDashing();
chara.isJumping();

// 移动
chara.moveStraight(d);
chara.moveDiagonally(horz, vert);
chara.jump(xPlus, yPlus);
chara.moveTowardCharacter(character);
chara.moveAwayFromCharacter(character);
```

### 方向常量

```javascript
// 方向值
// 2: 下, 4: 左, 6: 右, 8: 上
chara.direction;
chara.setDirection(d);
chara.isDirectionFixed();
chara.reverseDir(d);
```

### 透明度

```javascript
chara.opacity;
chara.transparency;
chara.setTransparent(transparent);
```

## Game_Player

继承自 Game_Character，表示玩家控制的角色。

### 特有方法

```javascript
// 移动
$gamePlayer.moveByInput();
$gamePlayer.triggerTouchAction();
$gamePlayer.canMove();

// 地点转移
$gamePlayer.reserveTransfer(mapId, x, y, d, fadeType);
$gamePlayer.isTransferring();
$gamePlayer.performTransfer();

// 遭遇
$gamePlayer.makeEncounterCount();
$gamePlayer.makeEncounterTroopId();
$gamePlayer.executeEncounter();

// 交互
$gamePlayer.checkEventTriggerHere(triggers);
$gamePlayer.checkEventTriggerThere(triggers);
$gamePlayer.startMapEvent(x, y, triggers, normal);
```

## Game_Event

继承自 Game_Character，表示地图事件。

### 主要方法

```javascript
event.eventId();
event.event();          // $dataMap.events中的数据
event.page();           // 当前页
event.list();           // 事件指令列表

// 页面切换
event.setupPage();
event.setupPageSettings();
event.updateSelfMovement();

// 启动条件
event.isTriggerIn(triggers);
event.isStarting();
event.start();
event.lock();
event.unlock();

// 事件命令执行
event.startMessage();
event.startCombat();
event.executeCommand();
```

## Game_Interpreter

事件命令解释器。

### 上下文

```javascript
// 在事件命令中使用
this.character(0)  // 本事件
this.character(-1) // 玩家
this.character(1)  // 事件ID 1

// 角色引用
this.eventId();

// 执行命令
this.executeCommand();
this.currentCommand();
this.nextEventCommand();
```

## 常见错误

### 错误1: 直接访问私有属性

```javascript
// 不推荐
actor._hp = 100;

// 推荐
actor.gainHp(100);
actor.setHp(100);
```

### 错误2: 混淆ID和索引

```javascript
// 敌人在敌群中的索引（从0开始）
enemy.index();

// 敌人数据库ID
enemy.enemyId();

// 这是不同的值！
```

### 错误3: 假设角色在队伍中

```javascript
// 错误！角色可能不在队伍中
$gameParty.members()[0].actorId()  // 如果队伍为空会崩溃

// 正确
if ($gameParty.size() > 0) {
    $gameParty.members()[0].actorId()
}
```
