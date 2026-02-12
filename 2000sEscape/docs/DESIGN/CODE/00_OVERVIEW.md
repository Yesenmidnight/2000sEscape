# RPGMaker MZ 核心代码架构概览

> 本文档旨在帮助AI模型正确理解RPGMaker MZ引擎的核心架构，避免产生幻觉。

## 文件加载顺序

RPGMaker MZ 的JS文件按以下顺序加载（定义在 `main.js` 中）：

```javascript
const scriptUrls = [
    "js/libs/pixi.js",           // 1. PIXI.js 渲染引擎
    "js/libs/pako.min.js",       // 2. 压缩库
    "js/libs/localforage.min.js",// 3. 本地存储
    "js/libs/effekseer.min.js",  // 4. 特效引擎
    "js/libs/vorbisdecoder.js",  // 5. 音频解码
    "js/rmmz_core.js",           // 6. 核心类（Stage, Sprite, Window等基类）
    "js/rmmz_managers.js",       // 7. 管理器（静态类）
    "js/rmmz_objects.js",        // 8. 游戏对象（Game_XXX类）
    "js/rmmz_scenes.js",         // 9. 场景类（Scene_XXX类）
    "js/rmmz_sprites.js",        // 10. 精灵类（Sprite_XXX类）
    "js/rmmz_windows.js",        // 11. 窗口类（Window_XXX类）
    "js/plugins.js"              // 12. 插件配置
];
```

**重要**: 文件加载顺序决定了依赖关系。后面的文件可以使用前面文件定义的类和变量。

## 三层架构

RPGMaker MZ 采用经典的 MVC 模式，分为三层：

```
┌─────────────────────────────────────────────────────────┐
│                    View Layer (视图层)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Scenes    │  │   Sprites   │  │    Windows      │  │
│  │ Scene_Map   │  │ Sprite_Actor│  │  Window_Menu    │  │
│  │ Scene_Battle│  │ Sprite_Enemy│  │  Window_Item    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                  Model Layer (数据层)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Game_Objects│  │  $data_XXX  │  │   $game_XXX     │  │
│  │ Game_Actor  │  │ $dataActors │  │   $gameParty    │  │
│  │ Game_Map    │  │ $dataItems  │  │   $gameMap      │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│               Controller Layer (控制层)                  │
│  ┌─────────────────────────────────────────────────────┐│
│  │              Static Managers (静态管理器)            ││
│  │  DataManager, SceneManager, BattleManager, etc.     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## 核心文件职责

### rmmz_core.js
- **JsExtensions**: JavaScript原生对象的扩展方法
- **PIXI扩展**: Stage, Sprite, Window等PIXI类的子类
- **Utils**: 工具函数
- **Input/TouchInput**: 输入处理
- **资源管理器**: ImageManager, AudioManager等

### rmmz_managers.js
- **DataManager**: 数据库和存档管理
- **SceneManager**: 场景栈管理
- **BattleManager**: 战斗流程控制
- **其他Manager**: 各种静态管理器

### rmmz_objects.js
- **Game_XXX类**: 游戏逻辑对象
- 包含游戏状态、规则、计算逻辑
- 这些类的实例会被保存到存档中

### rmmz_scenes.js
- **Scene_XXX类**: 场景/画面控制器
- 管理一个完整的游戏画面
- 负责创建和销毁Sprite和Window

### rmmz_sprites.js
- **Sprite_XXX类**: 图形显示对象
- 负责渲染，不包含游戏逻辑
- 显示Game_Objects的数据

### rmmz_windows.js
- **Window_XXX类**: UI窗口
- 继承自Window基类
- 用于显示菜单、选择列表等

## 启动流程

```
main.js
    ↓
Main.run()
    ↓
加载所有脚本
    ↓
PluginManager.setup($plugins)
    ↓
effekseer.initRuntime()
    ↓
SceneManager.run(Scene_Boot)
    ↓
Scene_Boot.initialize()
    ↓
检查字体加载完成
    ↓
检查数据库加载完成
    ↓
goto(Scene_Title) 或 goto(Scene_Map) [测试模式]
```

## 重要命名约定

### 全局变量前缀
- `$data` + 大写字母: 静态数据库数据 (如 `$dataActors`, `$dataItems`)
- `$game` + 大写字母: 运行时游戏状态 (如 `$gameParty`, `$gameMap`)

### 类命名前缀
- `Game_`: 游戏逻辑对象
- `Scene_`: 场景类
- `Sprite_`: 精灵类
- `Window_`: 窗口类

### 私有属性约定
- 以下划线开头: `this._hp`, `this._mp`, `this._states`
- 这只是约定，JavaScript本身没有真正的私有属性

## 版本信息

- 当前版本: v1.10.0
- 所有核心文件版本一致
