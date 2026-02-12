//=============================================================================
// ESC_UI_HUD.js - 逃离千禧年 探索界面HUD
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 探索界面HUD - 显示玩家状态、技能栏、快捷道具栏
@author 2000sEscape Team
@version 1.1.0
@base ESC_Core

@help
探索界面的HUD系统，包含：
- 左下角：HP血量条、ST精力条
- 中间：3个主动技能格
- 右侧：4个快捷道具格 + 背包按钮

支持动态分辨率适配 (816x624 到 1920x1080)

@param hpColor1
@text HP条颜色1
@type number
@default 22

@param hpColor2
@text HP条颜色2
@type number
@default 23

@param stColor1
@text ST条颜色1
@type number
@default 24

@param stColor2
@text ST条颜色2
@type number
@default 25

@param maxStamina
@text 最大精力值
@type number
@default 100

@param staminaRegen
@text 精力恢复速率(每帧)
@type number
@default 0.5

@param runStaminaCost
@text 奔跑精力消耗(每帧)
@type number
@default 1

@param jumpStaminaCost
@text 跳跃精力消耗
@type number
@default 20

@param hudOpacity
@text HUD透明度
@type number
@default 200
*/

(function() {
    'use strict';

    var pluginName = 'ESC_UI_HUD';
    var params = PluginManager.parameters(pluginName);

    // 确保ESC命名空间存在
    window.ESC = window.ESC || {};

    //=============================================================================
    // 分辨率适配 - 基于默认816x624进行缩放
    //=============================================================================
    ESC.Scale = {
        baseWidth: 816,
        baseHeight: 624,

        // 获取缩放比例
        getScale: function() {
            var currentWidth = Graphics.boxWidth || 816;
            return currentWidth / this.baseWidth;
        },

        // 缩放数值
        scale: function(value) {
            return Math.round(value * this.getScale());
        },

        // 缩放字体（使用较小的缩放比例，避免字体过大）
        scaleFont: function(baseFontSize) {
            var scale = this.getScale();
            // 字体缩放使用开方来减缓缩放速度
            var fontScale = Math.sqrt(scale);
            return Math.round(baseFontSize * fontScale);
        }
    };

    //=============================================================================
    // 配置
    //=============================================================================
    ESC.HUDConfig = {
        hpColor1: parseInt(params.hpColor1) || 22,
        hpColor2: parseInt(params.hpColor2) || 23,
        stColor1: parseInt(params.stColor1) || 24,
        stColor2: parseInt(params.stColor2) || 25,
        maxStamina: parseInt(params.maxStamina) || 100,
        staminaRegen: parseFloat(params.staminaRegen) || 0.5,
        runStaminaCost: parseFloat(params.runStaminaCost) || 1,
        jumpStaminaCost: parseInt(params.jumpStaminaCost) || 20,
        hudOpacity: parseInt(params.hudOpacity) || 200
    };

    //=============================================================================
    // 精力系统 - 扩展Game_Player
    //=============================================================================
    var _Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _Game_Player_initMembers.call(this);
        this._stamina = ESC.HUDConfig.maxStamina;
        this._isRunning = false;
    };

    Game_Player.prototype.stamina = function() {
        return this._stamina || 0;
    };

    Game_Player.prototype.maxStamina = function() {
        return ESC.HUDConfig.maxStamina;
    };

    Game_Player.prototype.setStamina = function(value) {
        this._stamina = Math.max(0, Math.min(this.maxStamina(), value));
    };

    Game_Player.prototype.hasStamina = function(cost) {
        return this._stamina >= cost;
    };

    Game_Player.prototype.consumeStamina = function(cost) {
        this._stamina = Math.max(0, this._stamina - cost);
    };

    Game_Player.prototype.recoverStamina = function(amount) {
        this._stamina = Math.min(this.maxStamina(), this._stamina + amount);
    };

    Game_Player.prototype.isRunning = function() {
        return this._isRunning;
    };

    Game_Player.prototype.setRunning = function(running) {
        if (running && this.hasStamina(ESC.HUDConfig.runStaminaCost)) {
            this._isRunning = true;
        } else {
            this._isRunning = false;
        }
    };

    var _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _Game_Player_update.call(this, sceneActive);

        if (sceneActive && this.canMove()) {
            if (this._isRunning && this.isMoving()) {
                this.consumeStamina(ESC.HUDConfig.runStaminaCost);
                if (this._stamina <= 0) {
                    this._isRunning = false;
                }
            } else {
                if (!this.isMoving()) {
                    this.recoverStamina(ESC.HUDConfig.staminaRegen);
                }
            }
        }
    };

    var _Game_Player_jump = Game_Player.prototype.jump;
    Game_Player.prototype.jump = function(xPlus, yPlus) {
        if (this.hasStamina(ESC.HUDConfig.jumpStaminaCost)) {
            this.consumeStamina(ESC.HUDConfig.jumpStaminaCost);
            _Game_Player_jump.call(this, xPlus, yPlus);
        }
    };

    //=============================================================================
    // 快捷栏系统
    //=============================================================================
    ESC.QuickSlots = {
        _slots: [null, null, null, null],
        _backpack: null,

        getSlot: function(index) {
            return this._slots[index];
        },

        setSlot: function(index, item) {
            if (index >= 0 && index < 4) {
                this._slots[index] = item;
            }
        },

        clearSlot: function(index) {
            this._slots[index] = null;
        },

        useSlot: function(index) {
            var item = this._slots[index];
            if (item && $gameParty.hasItem(item)) {
                if (item.consumable) {
                    $gameParty.consumeItem(item);
                    if (!$gameParty.hasItem(item)) {
                        this._slots[index] = null;
                    }
                }
                this.applyItem(item);
                return true;
            }
            return false;
        },

        applyItem: function(item) {
            var actor = $gameParty.leader();
            if (actor) {
                actor.useItem(item);
            }
        },

        saveData: function() {
            return this._slots.map(function(item) {
                return item ? item.id : null;
            });
        },

        loadData: function(data) {
            if (data && Array.isArray(data)) {
                var self = this;
                this._slots = data.map(function(id) {
                    return id ? $dataItems[id] : null;
                });
            }
        }
    };

    //=============================================================================
    // HUD精灵 - 状态条（使用原型继承）- 支持动态缩放
    //=============================================================================
    function Sprite_StatusBars() {
        this.initialize.apply(this, arguments);
    }

    Sprite_StatusBars.prototype = Object.create(Sprite.prototype);
    Sprite_StatusBars.prototype.constructor = Sprite_StatusBars;

    Sprite_StatusBars.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this._hpValue = 0;
        this._hpMax = 1;
        this._stValue = 0;
        this._stMax = 1;

        // 动态缩放尺寸
        var bitmapWidth = ESC.Scale.scale(280);
        var bitmapHeight = ESC.Scale.scale(100);
        this.bitmap = new Bitmap(bitmapWidth, bitmapHeight);
        this.anchor.x = 0;
        this.anchor.y = 1;
    };

    Sprite_StatusBars.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.updateValues();
        this.redraw();
    };

    Sprite_StatusBars.prototype.updateValues = function() {
        var actor = $gameParty ? $gameParty.leader() : null;
        if (actor && $gamePlayer) {
            this._hpValue = actor.hp;
            this._hpMax = actor.mhp;
            this._stValue = $gamePlayer.stamina();
            this._stMax = $gamePlayer.maxStamina();
        }
    };

    Sprite_StatusBars.prototype.redraw = function() {
        var bitmap = this.bitmap;
        bitmap.clear();

        // 动态缩放参数
        var padding = ESC.Scale.scale(15);
        var barWidth = ESC.Scale.scale(250);
        var barHeight = ESC.Scale.scale(22);
        var fontSize = ESC.Scale.scaleFont(16);
        var labelWidth = ESC.Scale.scale(50);

        var x = padding;
        var y = padding;

        bitmap.fontSize = fontSize;

        // HP条
        this.drawGauge(x, y, barWidth, barHeight, this._hpValue / this._hpMax,
            ColorManager.textColor(ESC.HUDConfig.hpColor1),
            ColorManager.textColor(ESC.HUDConfig.hpColor2));
        bitmap.drawText('HP', x, y, labelWidth, barHeight, 'left');
        bitmap.drawText(this._hpValue + '/' + this._hpMax, x + barWidth - ESC.Scale.scale(100), y, ESC.Scale.scale(95), barHeight, 'right');

        y += barHeight + ESC.Scale.scale(10);

        // ST条
        this.drawGauge(x, y, barWidth, barHeight, this._stValue / this._stMax,
            ColorManager.textColor(ESC.HUDConfig.stColor1),
            ColorManager.textColor(ESC.HUDConfig.stColor2));
        bitmap.drawText('ST', x, y, labelWidth, barHeight, 'left');
        bitmap.drawText(Math.floor(this._stValue) + '/' + this._stMax, x + barWidth - ESC.Scale.scale(100), y, ESC.Scale.scale(95), barHeight, 'right');
    };

    Sprite_StatusBars.prototype.drawGauge = function(x, y, width, height, rate, color1, color2) {
        var bitmap = this.bitmap;
        var ctx = bitmap._context;
        var fillW = Math.floor(width * rate);

        // 背景
        bitmap.fillRect(x, y, width, height, '#333344');

        // 填充渐变
        if (fillW > 0 && ctx) {
            for (var i = 0; i < fillW; i++) {
                var r = i / fillW;
                var color = r < 0.5 ? color1 : color2;
                bitmap.fillRect(x + i, y, 1, height, color);
            }
        }

        // 边框
        if (ctx) {
            ctx.strokeStyle = '#7777aa';
            ctx.lineWidth = ESC.Scale.scale(2);
            ctx.strokeRect(x, y, width, height);
        }
    };

    //=============================================================================
    // HUD精灵 - 技能栏 - 支持动态缩放
    //=============================================================================
    function Sprite_SkillBar() {
        this.initialize.apply(this, arguments);
    }

    Sprite_SkillBar.prototype = Object.create(Sprite.prototype);
    Sprite_SkillBar.prototype.constructor = Sprite_SkillBar;

    Sprite_SkillBar.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this._skills = [null, null, null];

        // 动态缩放尺寸
        var slotSize = ESC.Scale.scale(56);
        var padding = ESC.Scale.scale(8);
        var bitmapWidth = slotSize * 3 + padding * 2;
        var bitmapHeight = slotSize + ESC.Scale.scale(30);
        this.bitmap = new Bitmap(bitmapWidth, bitmapHeight);
        this.anchor.x = 0.5;
        this.anchor.y = 1;
    };

    Sprite_SkillBar.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.updateSkills();
        this.redraw();
    };

    Sprite_SkillBar.prototype.updateSkills = function() {
        if (ESC.Equipment && ESC.Equipment.getActiveSkills) {
            var skills = ESC.Equipment.getActiveSkills();
            this._skills = skills || [null, null, null];
        }
    };

    Sprite_SkillBar.prototype.redraw = function() {
        var bitmap = this.bitmap;
        var ctx = bitmap._context;
        bitmap.clear();

        var slotSize = ESC.Scale.scale(56);
        var padding = ESC.Scale.scale(8);
        var iconSize = ESC.Scale.scale(48);
        var fontSize = ESC.Scale.scaleFont(14);

        bitmap.fontSize = fontSize;

        for (var i = 0; i < 3; i++) {
            var x = padding + i * (slotSize + ESC.Scale.scale(4));
            var y = padding;

            // 绘制格子背景
            bitmap.fillRect(x, y, slotSize, slotSize, 'rgba(0,0,0,0.6)');

            // 边框
            if (ctx) {
                ctx.strokeStyle = '#7777aa';
                ctx.lineWidth = ESC.Scale.scale(2);
                ctx.strokeRect(x, y, slotSize, slotSize);
            }

            // 绘制技能图标
            var skill = this._skills[i];
            if (skill && skill.iconIndex) {
                this.drawIcon(skill.iconIndex, x + ESC.Scale.scale(4), y + ESC.Scale.scale(4), iconSize);
            }

            // 绘制快捷键提示
            bitmap.drawText('E' + (i + 1), x, y + slotSize, slotSize, ESC.Scale.scale(18), 'center');
        }
    };

    Sprite_SkillBar.prototype.drawIcon = function(iconIndex, x, y, size) {
        var bitmap = ImageManager.loadSystem('IconSet');
        var pw = ImageManager.iconWidth;
        var ph = ImageManager.iconHeight;
        var sx = (iconIndex % 16) * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        this.bitmap.blt(bitmap, sx, sy, pw, ph, x, y, size, size);
    };

    //=============================================================================
    // HUD精灵 - 快捷道具栏 - 支持动态缩放
    //=============================================================================
    function Sprite_QuickBar() {
        this.initialize.apply(this, arguments);
    }

    Sprite_QuickBar.prototype = Object.create(Sprite.prototype);
    Sprite_QuickBar.prototype.constructor = Sprite_QuickBar;

    Sprite_QuickBar.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this._items = [null, null, null, null];
        this._hoveredSlot = -1;

        // 动态缩放尺寸
        var slotSize = ESC.Scale.scale(56);
        var padding = ESC.Scale.scale(8);
        var backpackWidth = ESC.Scale.scale(50);
        var bitmapWidth = slotSize * 4 + padding * 2 + backpackWidth + ESC.Scale.scale(10);
        var bitmapHeight = slotSize + ESC.Scale.scale(30);
        this.bitmap = new Bitmap(bitmapWidth, bitmapHeight);
        this.anchor.x = 1;
        this.anchor.y = 1;
    };

    Sprite_QuickBar.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.updateItems();
        this.redraw();
    };

    Sprite_QuickBar.prototype.updateItems = function() {
        if (!ESC.QuickSlots) return;
        for (var i = 0; i < 4; i++) {
            this._items[i] = ESC.QuickSlots.getSlot(i);
        }
    };

    Sprite_QuickBar.prototype.redraw = function() {
        var bitmap = this.bitmap;
        var ctx = bitmap._context;
        bitmap.clear();

        var slotSize = ESC.Scale.scale(56);
        var padding = ESC.Scale.scale(8);
        var iconSize = ESC.Scale.scale(48);
        var fontSize = ESC.Scale.scaleFont(14);
        var labelHeight = ESC.Scale.scale(18);

        bitmap.fontSize = fontSize;

        for (var i = 0; i < 4; i++) {
            var x = padding + i * (slotSize + ESC.Scale.scale(4));
            var y = padding;

            // 绘制格子背景
            var bgColor = this._hoveredSlot === i ? 'rgba(100,100,120,0.8)' : 'rgba(0,0,0,0.6)';
            bitmap.fillRect(x, y, slotSize, slotSize, bgColor);

            // 边框
            if (ctx) {
                ctx.strokeStyle = '#7777aa';
                ctx.lineWidth = ESC.Scale.scale(2);
                ctx.strokeRect(x, y, slotSize, slotSize);
            }

            // 绘制物品图标
            var item = this._items[i];
            if (item && item.iconIndex) {
                this.drawIcon(item.iconIndex, x + ESC.Scale.scale(4), y + ESC.Scale.scale(4), iconSize);
            }

            // 绘制快捷键提示
            bitmap.drawText(String(i + 1), x, y + slotSize, slotSize, labelHeight, 'center');
        }

        // 背包按钮
        var bx = padding + 4 * (slotSize + ESC.Scale.scale(4));
        var backpackHeight = slotSize;
        bitmap.fillRect(bx, padding, ESC.Scale.scale(50), backpackHeight, 'rgba(0,0,0,0.6)');
        if (ctx) {
            ctx.strokeStyle = '#9999bb';
            ctx.lineWidth = ESC.Scale.scale(2);
            ctx.strokeRect(bx, padding, ESC.Scale.scale(50), backpackHeight);
        }
        bitmap.fontSize = ESC.Scale.scaleFont(24);
        bitmap.drawText('B', bx, padding + (backpackHeight - ESC.Scale.scale(24)) / 2, ESC.Scale.scale(50), ESC.Scale.scale(24), 'center');
    };

    Sprite_QuickBar.prototype.drawIcon = function(iconIndex, x, y, size) {
        var bitmap = ImageManager.loadSystem('IconSet');
        var pw = ImageManager.iconWidth;
        var ph = ImageManager.iconHeight;
        var sx = (iconIndex % 16) * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        this.bitmap.blt(bitmap, sx, sy, pw, ph, x, y, size, size);
    };

    //=============================================================================
    // HUD管理器 - 支持动态缩放
    //=============================================================================
    ESC.HUD = {
        _spriteset: null,
        _statusBars: null,
        _skillBar: null,
        _quickBar: null,
        _visible: true,

        create: function(spriteset) {
            this._spriteset = spriteset;
            this.createStatusBars();
            this.createSkillBar();
            this.createQuickBar();
        },

        createStatusBars: function() {
            this._statusBars = new Sprite_StatusBars();
            this._statusBars.x = ESC.Scale.scale(20);
            this._statusBars.y = Graphics.boxHeight - ESC.Scale.scale(15);
            this._statusBars.opacity = ESC.HUDConfig.hudOpacity;
            this._spriteset.addChild(this._statusBars);
        },

        createSkillBar: function() {
            this._skillBar = new Sprite_SkillBar();
            this._skillBar.x = Graphics.boxWidth / 2;
            this._skillBar.y = Graphics.boxHeight - ESC.Scale.scale(15);
            this._skillBar.opacity = ESC.HUDConfig.hudOpacity;
            this._spriteset.addChild(this._skillBar);
        },

        createQuickBar: function() {
            this._quickBar = new Sprite_QuickBar();
            this._quickBar.x = Graphics.boxWidth - ESC.Scale.scale(20);
            this._quickBar.y = Graphics.boxHeight - ESC.Scale.scale(15);
            this._quickBar.opacity = ESC.HUDConfig.hudOpacity;
            this._spriteset.addChild(this._quickBar);
        },

        show: function() {
            this._visible = true;
            this.updateVisibility();
        },

        hide: function() {
            this._visible = false;
            this.updateVisibility();
        },

        updateVisibility: function() {
            var visible = this._visible && !$gameMessage.isBusy();
            if (this._statusBars) this._statusBars.visible = visible;
            if (this._skillBar) this._skillBar.visible = visible;
            if (this._quickBar) this._quickBar.visible = visible;
        },

        destroy: function() {
            if (this._statusBars) this._statusBars.destroy();
            if (this._skillBar) this._skillBar.destroy();
            if (this._quickBar) this._quickBar.destroy();
            this._statusBars = null;
            this._skillBar = null;
            this._quickBar = null;
        }
    };

    //=============================================================================
    // 集成到Spriteset_Map
    //=============================================================================
    var _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _Spriteset_Map_createLowerLayer.call(this);
        ESC.HUD.create(this);
    };

    var _Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _Spriteset_Map_update.call(this);
        ESC.HUD.updateVisibility();
    };

    var _Spriteset_Map_destroy = Spriteset_Map.prototype.destroy;
    Spriteset_Map.prototype.destroy = function() {
        ESC.HUD.destroy();
        _Spriteset_Map_destroy.call(this);
    };

    //=============================================================================
    // 快捷键处理
    //=============================================================================
    var _ESC_UI_HUD_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _ESC_UI_HUD_Scene_Map_update.call(this);

        // 奔跑 Shift - 在所有情况下都处理
        if ($gamePlayer && $gamePlayer.setRunning) {
            $gamePlayer.setRunning(Input.isPressed('shift'));
        }

        // 安全检查其他按键
        if (this.isBusy()) return;
        if (!$gamePlayer) return;
        if (typeof $gamePlayer.canMove !== 'function') return;
        if (!$gamePlayer.canMove()) return;

        // 快捷栏 1-4 (消耗品)
        for (var i = 0; i < 4; i++) {
            var keyName = String(i + 1);
            if (Input.isTriggered(keyName)) {
                if (ESC.QuickSlots) {
                    ESC.QuickSlots.useSlot(i);
                }
            }
        }
        // 注意：背包键由ESC_Backpack插件处理
    };

    //=============================================================================
    // 按键映射扩展
    //=============================================================================
    // 数字键 1-4
    Input.keyMapper[49] = '1';  // 1
    Input.keyMapper[50] = '2';  // 2
    Input.keyMapper[51] = '3';  // 3
    Input.keyMapper[52] = '4';  // 4
    // B键用于背包
    Input.keyMapper[66] = 'backpack';  // B
    // R键用于旋转
    Input.keyMapper[82] = 'rotate';  // R

    //=============================================================================
    // 存档扩展
    //=============================================================================
    var _ESC_UI_HUD_DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        var contents = _ESC_UI_HUD_DataManager_makeSaveContents.call(this);
        if (!contents.escData) contents.escData = {};
        contents.escData.quickSlots = ESC.QuickSlots.saveData();
        return contents;
    };

    var _ESC_UI_HUD_DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _ESC_UI_HUD_DataManager_extractSaveContents.call(this, contents);
        if (contents.escData && contents.escData.quickSlots) {
            ESC.QuickSlots.loadData(contents.escData.quickSlots);
        }
    };

    //=============================================================================
    // 调试命令
    //=============================================================================
    if (Utils.isOptionValid('test')) {
        window.ESCDebug = window.ESCDebug || {};
        window.ESCDebug.setQuickSlot = function(index, itemId) {
            var item = $dataItems[itemId];
            if (item) {
                ESC.QuickSlots.setSlot(index, item);
                console.log('Set slot ' + index + ' to ' + item.name);
            }
        };
        window.ESCDebug.stamina = function(value) {
            $gamePlayer.setStamina(value);
            console.log('Stamina set to ' + value);
        };
    }

    console.log('ESC_UI_HUD loaded successfully');
})();
