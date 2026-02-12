# RPGMaker MZ 常见陷阱与幻觉预防

> 本文档列出AI模型在处理RPGMaker MZ代码时容易产生的错误和幻觉。

## 1. 版本混淆：MV vs MZ

RPGMaker MV和MZ有重要差异，AI模型经常混淆。

### Window构造函数

```javascript
// MV (错误！在MZ中不工作)
const window = new Window_Base(0, 0, 400, 300);

// MZ (正确！)
const rect = new Rectangle(0, 0, 400, 300);
const window = new Window_Base(rect);
```

### 图片路径

```javascript
// MV
ImageManager.loadBitmap("img/pictures/", filename);

// MZ (推荐使用便捷方法)
ImageManager.loadPicture(filename);
```

### 其他差异

| 特性 | MV | MZ |
|------|----|----|
| Window构造 | 多个参数 | Rectangle对象 |
| 触摸输入 | TouchInput | TouchInput (基本相同) |
| 音频格式 | 支持OGG | 优先WebM/MP3 |
| 特效 | 内置动画 | Effekseer特效 |

## 2. 全局变量混淆

### $data vs $game

```javascript
// 错误！修改$data不影响游戏状态
$dataActors[1].name = "新名字";  // 只修改数据库定义

// 正确！修改$game对象
$gameActors.actor(1).setName("新名字");

// 关键区别：
// $dataXXX - 静态数据库，从JSON加载，不应修改
// $gameXXX - 动态状态，会保存到存档
```

### 数组索引

```javascript
// 危险！索引0通常是null
$dataItems[0];  // null
$dataSkills[0]; // null

// 安全访问
const item = $dataItems[id];
if (item && item.name) {
    // 使用item
}
```

## 3. 静态类误用

### 尝试实例化

```javascript
// 错误！静态类不能实例化
const battle = new BattleManager();  // Error!

// 正确！直接使用静态方法
BattleManager.setup(troopId, canEscape, canLose);
```

### 错误的继承

```javascript
// 错误！不能继承静态类
function MyManager() {
    DataManager.call(this);  // 会抛出错误
}

// 正确！通过覆盖方法扩展
const _original = DataManager.saveGame;
DataManager.saveGame = function(id) {
    // 自定义逻辑
    return _original.call(this, id);
};
```

## 4. 坐标系统

### 屏幕坐标 vs 地图坐标

```javascript
// 地图坐标 (图块)
$gamePlayer.x;  // 例如: 5 (第5个图块)
$gamePlayer.y;  // 例如: 8

// 屏幕坐标 (像素)
$gamePlayer.screenX();  // 例如: 320
$gamePlayer.screenY();  // 例如: 512

// 坐标转换
const screenX = $gameMap.adjustX(mapX) * $gameMap.tileWidth();
const screenY = $gameMap.adjustY(mapY) * $gameMap.tileHeight();
```

### 事件位置

```javascript
// 事件的地图坐标
const event = $gameMap.event(eventId);
event.x;  // 地图坐标
event.y;

// 事件的屏幕坐标 (用于精灵定位)
event.screenX();
event.screenY();
```

## 5. 方向值

```javascript
// 方向常量
// 2 = 下 (Down)
// 4 = 左 (Left)
// 6 = 右 (Right)
// 8 = 上 (Up)

// 注意：不是1,2,3,4或0,1,2,3！

// 反转方向
const reverseDir = d => {
    return [0, 0, 8, 0, 6, 0, 4, 0, 2][d];
};
// 或使用内置方法
$gameMap.reverseDir(direction);
```

## 6. 回调和this绑定

```javascript
// 错误！this会丢失
Scene_MyScene.prototype.create = function() {
    this._window.setHandler("ok", this.onOk);  // this丢失
};

// 正确！绑定this
Scene_MyScene.prototype.create = function() {
    this._window.setHandler("ok", this.onOk.bind(this));
};

// 或者使用箭头函数
Scene_MyScene.prototype.create = function() {
    this._window.setHandler("ok", () => this.onOk());
};
```

## 7. 异步操作

### 图片加载

```javascript
// 错误！图片可能未加载完成
const sprite = new Sprite();
sprite.bitmap = ImageManager.loadCharacter("Actor1");
console.log(sprite.bitmap.width);  // 可能是0

// 正确！等待加载
sprite.bitmap = ImageManager.loadCharacter("Actor1");
sprite.bitmap.addLoadListener(() => {
    console.log(sprite.bitmap.width);
});
```

### 存档操作

```javascript
// 存档是异步的
DataManager.saveGame(1).then(() => {
    console.log("Saved!");
}).catch((error) => {
    console.error("Save failed:", error);
});
```

## 8. 场景生命周期

### 在错误时机访问对象

```javascript
// 错误！在initialize中访问场景属性
Scene_MyScene.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
    this._spriteset.update();  // 还没创建！
};

// 正确！在create之后访问
Scene_MyScene.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createSpriteset();
    this._spriteset.update();  // 现在可以了
};
```

### 场景切换时序

```javascript
// 错误！切换后还访问旧场景
SceneManager.goto(Scene_Map);
console.log(SceneManager._scene._spriteset);  // 可能还是旧场景

// 正确！在场景启动后访问
Scene_Map.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    console.log(this._spriteset);  // 安全
};
```

## 9. 存档兼容性

### 添加新属性

```javascript
// 危险！旧存档可能没有新属性
const value = $gameSystem._myNewProperty;  // 可能是undefined

// 安全！使用默认值
const value = $gameSystem._myNewProperty || defaultValue;

// 或者在加载时初始化
const _Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    _Game_System_initialize.call(this);
    this._myNewProperty = defaultValue;
};
```

## 10. 常见拼写错误

### 类名

```javascript
// 错误
Game_Actor        // 正确
Game_Actors       // 错误，应该是 $gameActors

Scene_Battle      // 正确
Scene_Battler     // 错误，没有这个类

Sprite_Character  // 正确
Sprite_CharacterBase  // 错误，是 Game_CharacterBase
```

### 方法名

```javascript
// 常见错误
actor.addState(stateId);     // 正确
actor.applyState(stateId);   // 错误

$gameParty.members();        // 正确
$gameParty.getMembers();     // 错误

window.drawText(text, x, y); // 正确
window.drawtext(text, x, y); // 错误 (大小写)
```

## 11. 性能陷阱

### 每帧创建对象

```javascript
// 错误！每帧创建新对象
Sprite_MySprite.prototype.update = function() {
    this.bitmap = new Bitmap(100, 100);  // 内存泄漏！
};

// 正确！复用对象
Sprite_MySprite.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this.bitmap = new Bitmap(100, 100);
};
```

### 频繁的资源加载

```javascript
// 错误！每帧重新加载
Sprite_MySprite.prototype.update = function() {
    this.bitmap = ImageManager.loadCharacter("Actor1");  // 错误！
};

// 正确！在初始化时加载
Sprite_MySprite.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this.bitmap = ImageManager.loadCharacter("Actor1");
};
```

## 12. 战斗系统

### 技能和道具混淆

```javascript
// 检查类型
DataManager.isSkill(item);    // 是否是技能
DataManager.isItem(item);     // 是否是道具
DataManager.isWeapon(item);   // 是否是武器
DataManager.isArmor(item);    // 是否是防具

// Game_Item可以包装任何类型
const gameItem = new Game_Item();
gameItem.setObject($dataSkills[1]);
gameItem.isSkill();  // true
```

### 战斗流程

```javascript
// 战斗由BattleManager控制，不要直接修改
// 正确的流程：
// 1. BattleManager.setup(troopId, canEscape, canLose)
// 2. SceneManager.push(Scene_Battle)
// 3. 战斗自动进行
// 4. Scene_Battle.endBattle() 被调用
// 5. SceneManager.pop() 返回
```

## 13. 事件系统

### 公共事件

```javascript
// 预约公共事件
$gameTemp.reserveCommonEvent(commonEventId);

// 公共事件在下一个可用的时机执行
// 不要假设立即执行！
```

### 自开关

```javascript
// 格式：地图ID,事件ID,开关字母
const key = "1,2,A";  // 地图1, 事件2, 自开关A
$gameSelfSwitches.value(key);
$gameSelfSwitches.setValue(key, true);
```

## 14. 消息系统

### 异步消息

```javascript
// 错误！消息是异步的
$gameMessage.add("Hello");
console.log("After message");  // 不会等消息显示完

// 如果需要在消息后执行，使用事件命令
// 或设置回调（高级用法）
```

## 15. 插件开发注意事项

### 覆盖方法

```javascript
// 保存原始方法
const _Game_Actor_initExp = Game_Actor.prototype.initExp;

// 覆盖
Game_Actor.prototype.initExp = function() {
    _Game_Actor_initExp.call(this);
    // 自定义逻辑
};
```

### 避免全局污染

```javascript
// 错误！污染全局命名空间
myVariable = 123;
myFunction = function() {};

// 正确！使用IIFE或命名空间
(function() {
    const myVariable = 123;
    function myFunction() {}
})();
```

### 插件参数

```javascript
// 正确获取插件参数
const pluginName = "MyPlugin";
const parameters = PluginManager.parameters(pluginName);
const myValue = parameters["My Parameter"] || "default";
```

## 总结

当处理RPGMaker MZ代码时，AI模型应该：

1. **确认版本** - MZ不是MV，API有差异
2. **区分静态/动态** - $data是静态，$game是动态
3. **注意索引** - 数据数组从1开始，索引0是null
4. **理解静态类** - 不能实例化，不能继承
5. **正确处理异步** - 图片加载、存档都是异步的
6. **绑定this** - 回调中注意this绑定
7. **遵守生命周期** - 在正确的时机访问对象
8. **复用对象** - 避免每帧创建新对象
