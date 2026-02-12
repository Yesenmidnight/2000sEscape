# RPGMaker MZ 静态类模式

> RPGMaker MZ大量使用"静态类"模式，这是AI模型容易产生幻觉的重要区域。

## 什么是静态类？

在RPGMaker MZ中，"静态类"是指**不需要实例化，直接通过类名调用方法**的类。

### 静态类的定义模式

```javascript
function DataManager() {
    throw new Error("This is a static class");
}

DataManager.someProperty = null;
DataManager.someMethod = function() {
    // ...
};
```

**关键点**:
1. 构造函数直接抛出错误
2. 所有方法都是类方法（挂在构造函数上）
3. 所有属性都是类属性
4. 只有一个全局实例（类本身）

## 核心静态类列表

### 数据管理类

| 类名 | 职责 | 主要方法 |
|------|------|----------|
| `DataManager` | 数据库和存档管理 | `loadDatabase()`, `saveGame()`, `loadGame()` |
| `ConfigManager` | 配置管理 | `applyData()`, `makeData()` |

### 场景管理类

| 类名 | 职责 | 主要方法 |
|------|------|----------|
| `SceneManager` | 场景栈管理 | `run()`, `push()`, `pop()`, `goto()` |

### 战斗管理类

| 类名 | 职责 | 主要方法 |
|------|------|----------|
| `BattleManager` | 战斗流程 | `setup()`, `startBattle()`, `endBattle()` |

### 资源管理类

| 类名 | 职责 | 主要方法 |
|------|------|----------|
| `ImageManager` | 图片资源 | `loadBitmap()`, `loadCharacter()` |
| `AudioManager` | 音频管理 | `playBgm()`, `playSe()` |
| `EffectManager` | 特效管理 | `load()` |
| `FontManager` | 字体管理 | `load()` |

### 输入管理类

| 类名 | 职责 | 主要方法 |
|------|------|----------|
| `Input` | 键盘输入 | `isTriggered()`, `isPressed()` |
| `TouchInput` | 触摸/鼠标输入 | `isClicked()`, `isPressed()` |

### 其他

| 类名 | 职责 |
|------|------|
| `PluginManager` | 插件管理 |
| `Utils` | 工具函数 |
| `Decrypter` | 加密解密 |
| `ColorManager` | 颜色管理 |

## SceneManager 详解

`SceneManager` 是最重要的静态类之一，管理整个游戏场景。

### 场景栈操作

```javascript
// 启动游戏（传入初始场景）
SceneManager.run(Scene_Boot);

// 切换场景（清除栈，进入新场景）
SceneManager.goto(Scene_Map);

// 压入场景（保留当前场景，进入新场景）
SceneManager.push(Scene_Menu);

// 弹出场景（返回上一场景）
SceneManager.pop();

// 获取当前场景
SceneManager._scene;  // 当前场景实例
```

### 场景生命周期

```
1. 构造阶段
   new Scene_XXX() → initialize()

2. 准备阶段
   prepare() [可选]

3. 创建阶段
   create()

4. 启动阶段
   start() → _active = true

5. 更新阶段
   update() [每帧调用]

6. 停止阶段
   stop() → _active = false

7. 销毁阶段
   terminate() → destroy()
```

## DataManager 详解

### 数据库加载

```javascript
// 数据库文件列表（内部使用）
DataManager._databaseFiles = [
    { name: "$dataActors", src: "Actors.json" },
    { name: "$dataClasses", src: "Classes.json" },
    // ...
];

// 检查数据类型
DataManager.isSkill(item);   // 是否是技能
DataManager.isItem(item);    // 是否是道具
DataManager.isWeapon(item);  // 是否是武器
DataManager.isArmor(item);   // 是否是防具
```

### 存档系统

```javascript
// 存档数量上限
DataManager.maxSavefiles();  // 默认20

// 检查存档是否存在
DataManager.savefileExists(id);

// 加载/保存
DataManager.loadGame(id);
DataManager.saveGame(id);

// 自动存档
DataManager.isAutosaveEnabled();
DataManager.autosave();
```

## BattleManager 详解

### 战斗流程

```javascript
// 战斗设置
BattleManager.setup(troopId, canEscape, canLose);

// 战斗开始
BattleManager.initMembers();
BattleManager.onEncounter();
BattleManager.displayStartMessages();
BattleManager.startBattle();

// 战斗进行中
BattleManager.isBattleStart();
BattleManager.isBattleEnd();
BattleManager.isAborting();

// 战斗结束
BattleManager.endBattle(result);
BattleManager.replayBgmAndBgs();

// 结果常量
BattleManager.isWon();     // 胜利
BattleManager.isLost();    // 失败
BattleManager.isEscaped(); // 逃跑
```

## ImageManager 详解

### 图片加载方法

```javascript
// 角色/敌人
ImageManager.loadCharacter(filename);   // 角色行走图
ImageManager.loadFace(filename);        // 脸图
ImageManager.loadSvActor(filename);     // 侧视角色
ImageManager.loadSvEnemy(filename);     // 侧视敌人
ImageManager.loadEnemy(filename);       // 正面敌人

// 地图
ImageManager.loadTileset(filename);     // 图块集
ImageManager.loadParallax(filename);    // 远景

// UI
ImageManager.loadTitle1(filename);      // 标题背景1
ImageManager.loadTitle2(filename);      // 标题背景2
ImageManager.loadSystem(filename);      // 系统图片

// 通用
ImageManager.loadBitmap(path, hue);
ImageManager.loadNormalBitmap(path, hue);
```

### 缓存系统

```javascript
// 清除缓存
ImageManager.clear();

// 检查加载状态
ImageManager.isReady();
ImageManager.isObjectCharacter(filename);
```

## AudioManager 详解

### BGM (背景音乐)

```javascript
// 播放
AudioManager.playBgm({ name: "Theme", volume: 90, pitch: 100 });

// 控制
AudioManager.stopBgm();
AudioManager.fadeoutBgm(duration);
AudioManager.fadeinBgm(duration);

// 状态
AudioManager.saveBgm();
AudioManager.replayBgm(bgm);
```

### BGS (背景音效)

```javascript
AudioManager.playBgs({ name: "Rain", volume: 80 });
AudioManager.stopBgs();
```

### ME (音乐效果)

```javascript
AudioManager.playMe({ name: "Victory", volume: 90 });
```

### SE (音效)

```javascript
AudioManager.playSe({ name: "Cursor", volume: 90 });
AudioManager.stopSe();
```

## 常见错误

### 错误1: 尝试实例化静态类

```javascript
// 错误！
const manager = new DataManager();  // Error: This is a static class

// 正确！直接使用类
DataManager.saveGame(1);
```

### 错误2: 混淆静态类和实例类

```javascript
// 错误！SceneManager没有成员方法
const scene = new SceneManager();
scene.goto(Scene_Map);

// 正确！使用静态方法
SceneManager.goto(Scene_Map);
```

### 错误3: 继承静态类

```javascript
// 错误！静态类不能被继承
function MyManager() {
    DataManager.call(this);  // 会抛出错误
}
```

### 错误4: 假设静态类有状态隔离

```javascript
// 注意！静态类是全局的，状态会保留
BattleManager._phase = "test";
// 这个状态会影响整个游戏，直到被重置
```

## 扩展静态类的正确方式

```javascript
// 保存原方法
const _DataManager_makeSaveContents = DataManager.makeSaveContents;

// 覆盖方法
DataManager.makeSaveContents = function() {
    const contents = _DataManager_makeSaveContents.call(this);
    // 添加自定义数据
    contents.myCustomData = $gameSystem.myCustomData;
    return contents;
};
```
