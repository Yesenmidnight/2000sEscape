# RPGMaker MZ Sprite系统

> Sprite类负责所有图形渲染，是视图层的核心组件。

## Sprite类层次结构

```
PIXI.Sprite
    └── Sprite (RPG Maker扩展)
            ├── Sprite_Clickable
            │       ├── Sprite_Button
            │       └── Sprite_Gauge
            ├── Sprite_Base
            │       ├── Sprite_Battler
            │       │       ├── Sprite_Actor
            │       │       └── Sprite_Enemy
            │       ├── Sprite_Character
            │       └── Sprite_Picture
            ├── Sprite_Animation
            ├── Sprite_Damage
            ├── Sprite_Timer
            ├── Sprite_Picture
            └── Spriteset_Base
                    ├── Spriteset_Map
                    └── Spriteset_Battle
```

## 核心Sprite类

### Sprite (基类)

RPGMaker扩展的PIXI.Sprite基类。

```javascript
// 创建基本精灵
const sprite = new Sprite();
sprite.bitmap = ImageManager.loadCharacter("Actor1");

// 常用属性
sprite.x, sprite.y;          // 位置
sprite.scale.x, sprite.scale.y;  // 缩放
sprite.rotation;             // 旋转 (弧度)
sprite.anchor.x, sprite.anchor.y;  // 锚点 (0-1)
sprite.opacity;              // 不透明度 (0-255)
sprite.visible;              // 可见性
sprite.z;                    // Z顺序 (用于排序)

// 位图
sprite.bitmap;               // 位图对象
sprite.setFrame(x, y, w, h); // 设置帧区域
```

### Sprite_Clickable

可点击的精灵基类。

```javascript
class Sprite_Clickable extends Sprite {
    // 检测
    isClickEnabled();
    isBeingTouched();

    // 回调 (子类覆盖)
    onMouseEnter();
    onMouseExit();
    onPress();
    onClick();
}

// 使用
class MyButton extends Sprite_Clickable {
    onClick() {
        console.log("Button clicked!");
    }
}
```

### Sprite_Button

按钮精灵。

```javascript
const button = new Sprite_Button("ok");  // 或 "cancel", "pagedown", "pageup"
button.setClickHandler(() => {
    console.log("Clicked!");
});
```

## 地图精灵

### Sprite_Character

显示地图上的角色（玩家、NPC、事件）。

```javascript
// 创建
const sprite = new Sprite_Character(character);

// 自动处理
// - 行走图显示
// - 方向和动画
// - 透明度
// - 跳跃和移动动画
```

### Spriteset_Map

地图场景的精灵集合。

```javascript
// 包含的精灵
spriteset._tilemap;         // 图块地图
spriteset._parallax;        // 远景
spriteset._characterSprites; // 角色精灵数组
spriteset._shadowSprite;    // 阴影
spriteset._weather;         // 天气
spriteset._pictureSprites;  // 图片精灵
spriteset._timerSprites;    // 计时器

// 更新
spriteset.update();
```

## 战斗精灵

### Sprite_Actor

显示战斗中的角色。

```javascript
// 创建
const sprite = new Sprite_Actor(battler);

// 主要属性
sprite._battler;            // 关联的Game_Actor
sprite._mainSprite;         // 主体精灵
sprite._shadowSprite;       // 阴影
sprite._weaponSprite;       // 武器精灵
sprite._stateSprite;        // 状态图标

// 动画
sprite.startMotion(motionType);
// motionType: "walk", "wait", "chant", "guard", "damage",
//             "evade", "thrust", "swing", "missile", "skill",
//             "spell", "item", "escape", "victory", "dying", "abort", "sleep", "dead"

// 位置
sprite.moveToStartPosition();
```

### Sprite_Enemy

显示战斗中的敌人。

```javascript
const sprite = new Sprite_Enemy(battler);

// 主要属性
sprite._battler;            // 关联的Game_Enemy
sprite._effectType;         // 当前效果类型

// 效果
sprite.startAppear();
sprite.startDisappear();
sprite.startBossCollapse();
sprite.startInstantCollapse();
```

### Sprite_Battler (基类)

战斗单位精灵的共同基类。

```javascript
// 效果系统
sprite.setupEffect();
sprite.startEffect(effectType);
sprite.updateEffect();
sprite.isEffecting();

// 效果类型
// "appear", "disappear", "whiten", "collapse",
// "bossCollapse", "instantCollapse", "blink"

// 动画
sprite.startAnimation(animation, mirror);
sprite.isAnimationPlaying();
```

### Spriteset_Battle

战斗场景的精灵集合。

```javascript
// 包含的精灵
spriteset._battleField;     // 战斗区域容器
spriteset._back1Sprite;     // 背景1
spriteset._back2Sprite;     // 背景2
spriteset._enemySprites;    // 敌人精灵数组
spriteset._actorSprites;    // 角色精灵数组
spriteset._pictureSprites;  // 图片精灵
spriteset._weather;         // 天气效果
```

## 特效精灵

### Sprite_Animation

显示战斗动画。

```javascript
// 通常不直接使用，通过$gameTemp.requestAnimation
$gameTemp.requestAnimation([target], animationId, mirror);

// 动画在Sprite_Battler中自动处理
```

### Sprite_Damage

显示伤害数字。

```javascript
// 由Sprite_Battler自动创建
sprite._damageSprite;

// 显示伤害
sprite.setupDamagePopup();
```

### Sprite_Gauge

计量条精灵。

```javascript
const gauge = new Sprite_Gauge();
gauge.setup(battler, "hp");  // "hp", "mp", "tp", "time"
gauge.update();
```

## 图片精灵

### Sprite_Picture

显示事件指令中的图片。

```javascript
// 通常由Game_Screen管理
$gameScreen.showPicture(id, name, origin, x, y, scaleX, scaleY, opacity, blendMode);
$gameScreen.movePicture(id, origin, x, y, scaleX, scaleY, opacity, blendMode, duration);
$gameScreen.rotatePicture(id, speed);
$gameScreen.tintPicture(id, tone, duration);
$gameScreen.erasePicture(id);
```

## Tilemap

### Tilemap

图块地图渲染器。

```javascript
// 在Spriteset_Map中使用
const tilemap = new Tilemap();
tilemap.mapWidth = $dataMap.width;
tilemap.mapHeight = $dataMap.height;
tilemap.tileWidth = $gameMap.tileWidth();
tilemap.tileHeight = $gameMap.tileHeight();

// 图块集
tilemap.bitmaps = tilesetNames.map(name => ImageManager.loadTileset(name));

// 图块数据
tilemap.data = $dataMap.data;

// Flags
tilemap.flags = $gameMap.tilesetFlags();
```

## 天气效果

### Weather

```javascript
const weather = new Weather();
weather.type = "rain";  // "none", "rain", "storm", "snow"
weather.power = 5;      // 强度
weather.origin = new Point(x, y);
```

## 创建自定义精灵

### 基本模板

```javascript
function Sprite_MySprite() {
    this.initialize(...arguments);
}

Sprite_MySprite.prototype = Object.create(Sprite.prototype);
Sprite_MySprite.prototype.constructor = Sprite_MySprite;

Sprite_MySprite.prototype.initialize = function(data) {
    Sprite.prototype.initialize.call(this);
    this._data = data;
    this.bitmap = new Bitmap(100, 100);
    this.updateContent();
};

Sprite_MySprite.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateContent();
};

Sprite_MySprite.prototype.updateContent = function() {
    if (this._data) {
        this.bitmap.clear();
        this.bitmap.drawText(this._data.text, 0, 0, 100, 100);
    }
};
```

### 使用位图

```javascript
// 创建空白位图
const bitmap = new Bitmap(width, height);

// 绘制
bitmap.drawText(text, x, y, width, height, align);
bitmap.fillRect(x, y, width, height, color);
bitmap.clearRect(x, y, width, height);
bitmap.blt(source, sx, sy, sw, sh, dx, dy, dw, dh);

// 加载图片
const bitmap = ImageManager.loadCharacter("Actor1");
bitmap.addLoadListener(() => {
    // 图片加载完成
});
```

## Z顺序和排序

```javascript
// 比较函数用于排序
sprites.sort((a, b) => a.z - b.z);

// 典型Z值
// - 背景: 0-10
// - 地图图块: 0-4 (基于层级)
// - 角色: 根据Y坐标计算
// - 窗口: 100+
// - 消息: 1000+
```

## 常见错误

### 错误1: 图片未加载就使用

```javascript
// 错误！图片可能还没加载
const sprite = new Sprite();
sprite.bitmap = ImageManager.loadCharacter("Actor1");
sprite.bitmap.getPixel(0, 0);  // 可能出错

// 正确！等待加载
sprite.bitmap.addLoadListener(() => {
    sprite.bitmap.getPixel(0, 0);
});

// 或者使用isReady检查
if (ImageManager.isReady()) {
    // 所有图片已加载
}
```

### 错误2: 不调用父类update

```javascript
// 错误！父类的更新被跳过
Sprite_MySprite.prototype.update = function() {
    this.updateContent();
};

// 正确！
Sprite_MySprite.prototype.update = function() {
    Sprite.prototype.update.call(this);
    this.updateContent();
};
```

### 错误3: 内存泄漏

```javascript
// 错误！精灵没有被销毁
scene.terminate = function() {
    // 精灵残留
};

// 正确！
scene.terminate = function() {
    this._mySprite.destroy();
    this._mySprite = null;
};
```

### 错误4: 锚点混淆

```javascript
// 锚点是0-1的比例值，不是像素
sprite.anchor.x = 0.5;  // 水平居中
sprite.anchor.y = 0.5;  // 垂直居中

// 如果要设置像素偏移，直接修改x/y
sprite.x += offsetX;
sprite.y += offsetY;
```

### 错误5: 在错误的地方创建精灵

```javascript
// 错误！在initialize中创建精灵
Sprite_MySprite.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    this.addChild(new Sprite_Another());  // 可能有问题
};

// 通常应该在专门的创建方法中
// 或者在构造完成后添加
```
