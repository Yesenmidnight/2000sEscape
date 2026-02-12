# RPGMaker MZ Window系统

> Window类用于创建UI界面，如菜单、对话框、选择列表等。

## Window类层次结构

```
Window (PIXI)
    └── Window_Base
            ├── Window_Selectable
            │       ├── Window_Command
            │       │       ├── Window_TitleCommand
            │       │       ├── Window_MenuCommand
            │       │       ├── Window_ActorCommand
            │       │       ├── Window_PartyCommand
            │       │       └── ...
            │       ├── Window_MenuStatus
            │       ├── Window_ItemList
            │       ├── Window_SkillList
            │       ├── Window_EquipSlot
            │       ├── Window_EquipItem
            │       ├── Window_SavefileList
            │       ├── Window_ShopBuy
            │       ├── Window_ShopSell
            │       ├── Window_ChoiceList
            │       ├── Window_NumberInput
            │       ├── Window_EventItem
            │       └── ...
            ├── Window_Gold
            ├── Window_Help
            ├── Window_Message
            ├── Window_NameEdit
            ├── Window_NameInput
            ├── Window_BattleLog
            ├── Window_BattleStatus
            ├── Window_ShopStatus
            └── ...
```

## Window_Base 核心方法

### 构造和布局

```javascript
// 构造函数接收Rectangle对象
class Window_Base {
    initialize(rect) {
        // rect = { x, y, width, height }
        this.move(rect.x, rect.y, rect.width, rect.height);
        this.createContents();  // 创建内容位图
    }
}

// 创建窗口
const rect = new Rectangle(0, 0, 400, 300);
const window = new Window_Base(rect);

// 注意：MZ使用Rectangle对象，不是单独的参数
// 错误: new Window_Base(0, 0, 400, 300)  // MV风格
// 正确: new Window_Base(new Rectangle(0, 0, 400, 300))  // MZ风格
```

### 内容绘制

```javascript
// 基础绘制
window.drawText(text, x, y, maxWidth, align);
window.drawTextEx(text, x, y);  // 支持转义字符
window.changeTextColor(color);
window.changePaintColor(enabled);
window.resetTextColor();

// 图标绘制
window.drawIcon(iconIndex, x, y);
window.drawCharacter(name, index, x, y);
window.drawFace(name, index, x, y, width, height);

// 图形绘制
window.drawRect(x, y, width, height);
window.fillRect(x, y, width, height, color);

// 尺寸信息
window.lineHeight();      // 行高 (默认36)
window.itemWidth();       // 项目宽度
window.itemHeight();      // 项目高度
window.innerWidth;        // 内容区宽度
window.innerHeight;       // 内容区高度
window.padding;           // 内边距
```

### 文本颜色

```javascript
// 系统颜色 (从Window.json加载)
window.normalColor();       // 普通文字颜色
window.systemColor();       // 系统文字颜色
window.crisisColor();       // 危机颜色 (低HP)
window.deathColor();        // 死亡颜色
window.powerUpColor();      // 强化颜色
window.powerDownColor();    // 弱化颜色
window.gaugeBackColor();    // 计量条背景色
window.hpGaugeColor1();     // HP条颜色1
window.hpGaugeColor2();     // HP条颜色2
window.mpGaugeColor1();     // MP条颜色1
window.mpGaugeColor2();     // MP条颜色2

// 使用
window.changeTextColor(window.systemColor());
window.drawText("HP", x, y, width);
```

### 计量条绘制

```javascript
window.drawGauge(x, y, width, rate, color1, color2);
window.drawActorHp(actor, x, y, width);
window.drawActorMp(actor, x, y, width);
window.drawActorTp(actor, x, y, width);
```

## Window_Selectable

可选择项目的窗口基类。

### 选择功能

```javascript
// 当前选择
window.index();           // 当前选中索引
window.select(index);     // 选择指定项
window.deselect();        // 取消选择
window.reselect();        // 重新选择

// 选择状态
window.isCurrentItemEnabled();
window.isHandled(symbol);
window.isTouchedInsideFrame();

// 导航
window.cursorDown(wrap);
window.cursorUp(wrap);
window.cursorRight(wrap);
window.cursorLeft(wrap);
window.cursorPagedown();
window.cursorPageup();

// 处理
window.setHandler(symbol, method);
window.callHandler(symbol);
window.processHandling();
```

### 滚动

```javascript
window.maxItems();        // 项目总数
window.maxCols();         // 列数
window.maxPageItems();    // 每页项目数
window.maxTopRow();       // 最大顶行

window.topRow();          // 当前顶行
window.setTopRow(row);
window.bottomRow();

window.smoothSelect(index);
window.ensureCursorVisible();
```

### 绘制项目

```javascript
// 子类必须实现
window.drawItem(index);

// 通常实现
window.drawItem = function(index) {
    const rect = this.itemLineRect(index);
    this.drawText(this.itemName(index), rect.x, rect.y, rect.width);
};
```

## Window_Command

命令列表窗口。

### 创建命令

```javascript
// 通常使用makeCommandList
class Window_MyCommand extends Window_Command {
    makeCommandList() {
        this.addCommand("Attack", "attack", this.canAttack());
        this.addCommand("Skill", "skill", true);
        this.addCommand("Defend", "defend", true);
        this.addCommand("Item", "item", this.hasItems());
    }
}

// addCommand参数
// name: 显示名称
// symbol: 处理符号
// enabled: 是否可用 (可选，默认true)
// ext: 额外数据 (可选)
```

### 使用

```javascript
// 创建
const window = new Window_MyCommand(rect);

// 设置处理
window.setHandler("attack", this.onAttack.bind(this));
window.setHandler("skill", this.onSkill.bind(this));
window.setHandler("cancel", this.popScene.bind(this));

// 获取选中命令
window.currentSymbol();
window.currentExt();
```

## Window_Help

帮助文本窗口。

```javascript
// 设置文本
window.setText(text);
window.clear();

// 在其他窗口中使用
class Window_SkillList extends Window_Selectable {
    setHelpWindow(helpWindow) {
        this._helpWindow = helpWindow;
    }

    updateHelp() {
        this._helpWindow.setText(this.item().description);
    }
}
```

## Window_Message

对话框窗口。

```javascript
// 开始消息
window.startMessage();

// 更新
window.updateMessage();
window.updateInput();
window.updateShowFast();

// 状态
window.isBusy();
window.isTriggered();

// 选择
window.startChoice();
window.updateChoice();

// 数字输入
window.startNumberInput();
window.updateNumberInput();

// 物品选择
window.startItemSelection();
window.updateItemSelection();
```

## 窗口布局实践

### 创建窗口

```javascript
// 在Scene中创建窗口
Scene_MyScene.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createMyWindow();
};

Scene_MyScene.prototype.createMyWindow = function() {
    const rect = this.myWindowRect();
    this._myWindow = new Window_MyWindow(rect);
    this.addWindow(this._myWindow);
};

Scene_MyScene.prototype.myWindowRect = function() {
    const wx = 0;
    const wy = 0;
    const ww = Graphics.boxWidth;
    const wh = this.calcWindowHeight(4, true);  // 4行高度
    return new Rectangle(wx, wy, ww, wh);
};
```

### 辅助方法

```javascript
// 计算窗口高度
// numLines: 行数
// selectable: 是否可选（有选择时需要额外空间）
scene.calcWindowHeight(numLines, selectable);

// 计算行数
window.maxVisibleItems();

// 获取项目矩形
window.itemRect(index);
window.itemRectForText(index);
window.itemLineRect(index);
```

### 窗口联动

```javascript
// 设置关联窗口
Scene_MyScene.prototype.create = function() {
    this.createHelpWindow();
    this.createListWindow();
    this._listWindow.setHelpWindow(this._helpWindow);
};

// 当选择改变时，更新帮助窗口
Window_MyList.prototype.updateHelp = function() {
    if (this._helpWindow && this.item()) {
        this._helpWindow.setText(this.item().description);
    }
};
```

## 常见错误

### 错误1: 使用MV风格的构造参数

```javascript
// MV风格 (错误！)
const window = new Window_Base(0, 0, 400, 300);

// MZ风格 (正确！)
const rect = new Rectangle(0, 0, 400, 300);
const window = new Window_Base(rect);
```

### 错误2: 忘记添加到场景

```javascript
// 错误！窗口创建了但没显示
Scene_MyScene.prototype.create = function() {
    this._myWindow = new Window_MyWindow(rect);
    // 忘记添加到场景
};

// 正确！
Scene_MyScene.prototype.create = function() {
    this._myWindow = new Window_MyWindow(rect);
    this.addWindow(this._myWindow);
};
```

### 错误3: 坐标系混淆

```javascript
// 窗口有padding
// 绘制时应该从(0, 0)开始，padding会自动处理
window.drawText("Hello", 0, 0, width);  // 正确，会在padding内

// 如果需要绝对坐标
window.canvasToWindowX(x);
window.canvasToWindowY(y);
```

### 错误4: 内存泄漏

```javascript
// 错误！没有销毁窗口
Scene_MyScene.prototype.terminate = function() {
    // 窗口没有被销毁
};

// 正确！
Scene_MyScene.prototype.terminate = function() {
    this._myWindow.destroy();  // 或者让Scene_Base自动处理
};
```

### 错误5: 在drawItem中使用itemRect

```javascript
// 如果需要考虑文本边距
window.drawItem = function(index) {
    // 使用itemLineRect而不是itemRect
    const rect = this.itemLineRect(index);
    this.drawText(text, rect.x, rect.y, rect.width);
};
```
