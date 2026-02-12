# RPGMaker MZ Scene系统

> Scene是RPGMaker MZ的"画面"单元，每个完整界面都是一个Scene。

## Scene类层次结构

```
Stage (PIXI)
    └── Scene_Base
            ├── Scene_Boot
            ├── Scene_Title
            ├── Scene_Map
            ├── Scene_MenuBase
            │       ├── Scene_Menu
            │       ├── Scene_Item
            │       ├── Scene_Skill
            │       ├── Scene_Equip
            │       ├── Scene_Status
            │       ├── Scene_Options
            │       ├── Scene_File
            │       │       ├── Scene_Save
            │       │       └── Scene_Load
            │       └── Scene_GameEnd
            ├── Scene_Battle
            ├── Scene_Shop
            ├── Scene_Name
            ├── Scene_Debug
            └── Scene_Gameover
```

## Scene生命周期

每个Scene都经历以下阶段：

```
┌─────────────────────────────────────────────────────────────┐
│                     Scene 生命周期                           │
├─────────────────────────────────────────────────────────────┤
│  1. new Scene_XXX()                                         │
│         ↓                                                   │
│  2. initialize() - 初始化属性                               │
│         ↓                                                   │
│  3. prepare(args) - 接收参数 [可选]                          │
│         ↓                                                   │
│  4. create() - 创建子对象 (sprites, windows)                │
│         ↓                                                   │
│  5. isReady() - 等待资源加载                                │
│         ↓                                                   │
│  6. start() - 启动场景，开始动画                            │
│         ↓                                                   │
│  7. update() - 每帧更新 [循环调用]                          │
│         ↓                                                   │
│  8. stop() - 停止场景                                       │
│         ↓                                                   │
│  9. terminate() - 清理资源                                  │
│         ↓                                                   │
│ 10. destroy() - 销毁场景                                    │
└─────────────────────────────────────────────────────────────┘
```

## Scene_Base 核心方法

```javascript
class Scene_Base {
    // 初始化
    initialize()          // 设置初始属性
    create()              // 创建子对象
    prepare(...args)      // 接收参数（某些场景需要）

    // 状态检查
    isActive()            // 场景是否活跃
    isReady()             // 资源是否加载完成
    isStarted()           // 是否已启动
    isBusy()              // 是否忙碌（淡入淡出中）

    // 生命周期
    start()               // 启动
    update()              // 每帧更新
    stop()                // 停止
    terminate()           // 终止清理

    // 淡入淡出
    startFadeIn(duration, white)
    startFadeOut(duration, white)
    updateFade()
    fadeSpeed()

    // 子对象管理
    updateChildren()      // 更新所有子对象

    // 颜色滤镜
    createColorFilter()
    updateColorFilter()
}
```

## 主要场景详解

### Scene_Boot

游戏的启动场景，负责初始化。

```javascript
// 主要职责
- 检查字体加载
- 加载系统图片
- 跳转到标题场景或地图（测试模式）

// 不应该在这个场景添加自定义逻辑
```

### Scene_Title

标题画面。

```javascript
// 创建的内容
createBackground()    // 标题背景
createForeground()    // 标题前景
createWindowLayer()   // 窗口层
createCommandWindow() // 命令窗口（新游戏、继续、选项）

// 命令处理
commandNewGame()      // 开始新游戏
commandContinue()     // 读取存档
commandOptions()      // 打开选项

// 数据初始化
DataManager.setupNewGame()  // 在commandNewGame中调用
```

### Scene_Map

地图场景，是最复杂的场景之一。

```javascript
// 创建的内容
createDisplayObjects() {
    this.createSpriteset();    // 地图精灵
    this.createWindowLayer();  // 窗口层
    this.createAllWindows();   // 消息窗口等
    this.createButtons();      // 触摸按钮
}

// 主要方法
start() {
    SceneManager.clearStack();  // 清除场景栈
    this.fadeInForTransfer();   // 地点转移淡入
    // ...
}

update() {
    this.updateDestination();   // 更新触摸目的地
    this.updateMainMultiply();  // 更新主循环
    // ...
}

// 地点转移
updateTransferPlayer()
needsFadeInForTransfer()
```

### Scene_MenuBase

所有菜单场景的基类。

```javascript
// 创建的内容
createBackground()      // 背景模糊
createButtons()         // 页面按钮
createActorSprites()    // 角色行走图

// 角色管理
actor()                 // 当前选中的角色
actorWindow()           // 角色选择窗口
onActorChange()         // 角色切换回调
```

### Scene_Battle

战斗场景。

```javascript
// 创建的内容
createDisplayObjects() {
    this.createSpriteset();      // 战斗精灵
    this.createWindowLayer();    // 窗口层
    this.createAllWindows();     // 所有战斗窗口
    this.createButtons();        // 战斗按钮
}

// 战斗窗口
createAllWindows() {
    this.createLogWindow();       // 战斗日志
    this.createStatusWindow();    // 状态窗口
    this.createPartyCommandWindow(); // 队伍指令（战斗/逃跑）
    this.createActorCommandWindow(); // 角色指令（攻击/技能/防御/物品）
    this.createHelpWindow();      // 帮助窗口
    this.createSkillWindow();     // 技能窗口
    this.createItemWindow();      // 道具窗口
    this.createActorWindow();     // 角色选择
    this.createEnemyWindow();     // 敌人选择
    this.createMessageWindow();   // 消息窗口
}

// 战斗流程
start() {
    BattleManager.startBattle();  // 启动战斗
}

update() {
    BattleManager.update();       // 更新战斗逻辑
}
```

### Scene_Shop

商店场景。

```javascript
// 准备参数
prepare(goods, purchaseOnly) {
    this._goods = goods;
    this._purchaseOnly = purchaseOnly;
}

// 窗口
createCommandWindow()    // 购买/出售/离开
createGoldWindow()       // 金钱
createDummyWindow()      // 占位
createNumberWindow()     // 数量输入
createStatusWindow()     // 状态
createBuyWindow()        // 购买列表
createCategoryWindow()   // 分类（出售）
createSellWindow()       // 出售列表
```

## 场景切换

### SceneManager 方法

```javascript
// 完全切换场景（清除栈）
SceneManager.goto(Scene_Map);

// 压入新场景（保留当前场景）
SceneManager.push(Scene_Menu);
SceneManager.push(Scene_Item);

// 弹出场景（返回上一个场景）
SceneManager.pop();

// 获取/检查当前场景
SceneManager._scene;                  // 当前场景实例
SceneManager._scene instanceof Scene_Map;  // 检查场景类型
```

### 典型的场景流程

```
Scene_Title
    │
    ├── 新游戏 ──→ Scene_Map
    │                   │
    │                   ├── 菜单 ──→ Scene_Menu
    │                   │                   │
    │                   │                   ├── 物品 ──→ Scene_Item
    │                   │                   ├── 技能 ──→ Scene_Skill
    │                   │                   ├── 装备 ──→ Scene_Equip
    │                   │                   └── 状态 ──→ Scene_Status
    │                   │
    │                   └── 遭遇 ──→ Scene_Battle
    │
    └── 继续 ──→ Scene_Map (从存档恢复)
```

## 创建自定义场景

### 基本模板

```javascript
function Scene_MyScene() {
    this.initialize(...arguments);
}

Scene_MyScene.prototype = Object.create(Scene_Base.prototype);
Scene_MyScene.prototype.constructor = Scene_MyScene;

Scene_MyScene.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    // 初始化属性
};

Scene_MyScene.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    // 创建窗口和精灵
};

Scene_MyScene.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    // 启动逻辑
};

Scene_MyScene.prototype.update = function() {
    Scene_Base.prototype.update.call(this);
    // 每帧更新
};

Scene_MyScene.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    // 清理资源
};
```

### 带参数的场景

```javascript
function Scene_MyDetail() {
    this.initialize(...arguments);
}

Scene_MyDetail.prototype = Object.create(Scene_Base.prototype);
Scene_MyDetail.prototype.constructor = Scene_MyDetail;

Scene_MyDetail.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this._dataId = 0;  // 默认值
};

// prepare在create之前调用
Scene_MyDetail.prototype.prepare = function(dataId) {
    this._dataId = dataId;
};

// 切换到这个场景
SceneManager.push(Scene_MyDetail);
// 如果需要传参数，需要在push后设置
SceneManager._scene.prepare(123);
```

## 常见错误

### 错误1: 在错误的阶段访问资源

```javascript
// 错误！资源还未创建
Scene_MyScene.prototype.initialize = function() {
    this._window = new Window_MyWindow(...);  // 太早了！
};

// 正确！在create中创建
Scene_MyScene.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this._window = new Window_MyWindow(...);
};
```

### 错误2: 忘记调用父类方法

```javascript
// 错误！缺少父类初始化
Scene_MyScene.prototype.initialize = function() {
    this._myProp = 0;  // Scene_Base的初始化被跳过
};

// 正确！
Scene_MyScene.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);  // 调用父类
    this._myProp = 0;
};
```

### 错误3: 场景栈管理错误

```javascript
// 错误！从菜单使用goto会导致无法返回
Scene_Item.prototype.someMethod = function() {
    SceneManager.goto(Scene_Shop);  // 标题->地图->菜单->物品 [断裂！]
};

// 正确！使用push保留返回路径
SceneManager.push(Scene_Shop);  // 可以pop返回
```

### 错误4: 不检查场景类型

```javascript
// 危险！当前场景可能不是Scene_Map
SceneManager._scene._spriteset;  // 如果在菜单中会崩溃

// 安全
if (SceneManager._scene instanceof Scene_Map) {
    SceneManager._scene._spriteset;
}
```
