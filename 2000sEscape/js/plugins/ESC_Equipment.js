//=============================================================================
// ESC_Equipment.js - 逃离千禧年 装备系统
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 装备系统 - 5部位装备、技能关联
@author 2000sEscape Team
@version 1.0.0
@base ESC_Core
@base ESC_UI_HUD

@help
装备系统，包含：
- 5个装备部位：头部、颈部、躯干、手部、腿部
- 前3个部位的主动技能显示在探索界面技能栏
- 装备类型：主动技能/被动技能/纯数值

在物品/武器/防具的备注中使用以下标签：
<ESC_slot:head>     装备部位 (head/neck/body/hand/leg)
<ESC_skillType:active>  技能类型 (active/passive/none)
<ESC_skill:1>       关联技能ID
<ESC_skillCooldown:10>  技能冷却时间(秒)

@param defaultSlots
@text 默认装备槽数
@type number
@default 5
*/

(function() {
    'use strict';

    var pluginName = 'ESC_Equipment';
    var params = PluginManager.parameters(pluginName);

    window.ESC = window.ESC || {};

    //=============================================================================
    // 装备部位定义
    //=============================================================================
    ESC.EquipSlots = {
        HEAD: 0,   // 头部 → 技能1
        NECK: 1,   // 颈部 → 技能2
        BODY: 2,   // 躯干 → 技能3
        HAND: 3,   // 手部
        LEG: 4     // 腿部
    };

    ESC.EquipSlotNames = ['头部', '颈部', '躯干', '手部', '腿部'];

    //=============================================================================
    // 装备系统
    //=============================================================================
    ESC.Equipment = {
        _slots: [null, null, null, null, null],  // 5个装备槽
        _skillCooldowns: [0, 0, 0],  // 前3个技能的冷却

        // 获取装备
        getEquip: function(slotIndex) {
            return this._slots[slotIndex];
        },

        // 装备物品
        equip: function(slotIndex, item) {
            if (slotIndex < 0 || slotIndex >= 5) return false;

            // 检查物品是否适合该部位
            var itemSlot = this.getItemSlot(item);
            if (itemSlot !== null && itemSlot !== slotIndex) {
                console.log('Item slot mismatch');
                return false;
            }

            // 卸下旧装备
            var oldItem = this._slots[slotIndex];
            if (oldItem) {
                this.unequip(slotIndex);
            }

            // 装备新物品
            this._slots[slotIndex] = item;

            // 从背包移除
            if ($gameParty.hasItem(item)) {
                $gameParty.loseItem(item, 1);
            }

            // 应用装备效果
            this.applyEquipEffects(item, true);

            return true;
        },

        // 卸下装备
        unequip: function(slotIndex) {
            var item = this._slots[slotIndex];
            if (!item) return null;

            // 移除装备效果
            this.applyEquipEffects(item, false);

            // 放回背包
            $gameParty.gainItem(item, 1);

            this._slots[slotIndex] = null;
            return item;
        },

        // 获取物品的装备部位
        getItemSlot: function(item) {
            if (!item) return null;
            var note = item.note || '';

            var match = note.match(/<ESC_slot:(\w+)>/i);
            if (match) {
                var slotMap = {
                    'head': 0, '头部': 0,
                    'neck': 1, '颈部': 1,
                    'body': 2, '躯干': 2,
                    'hand': 3, '手部': 3,
                    'leg': 4, '腿部': 4
                };
                var key = match[1].toLowerCase();
                return slotMap.hasOwnProperty(key) ? slotMap[key] : null;
            }
            return null;
        },

        // 获取物品技能类型
        getSkillType: function(item) {
            if (!item) return 'none';
            var note = item.note || '';

            var match = note.match(/<ESC_skillType:(\w+)>/i);
            if (match) {
                return match[1].toLowerCase();
            }
            return 'none';
        },

        // 获取物品关联技能
        getSkill: function(item) {
            if (!item) return null;
            var note = item.note || '';

            var match = note.match(/<ESC_skill:(\d+)>/i);
            if (match) {
                var skillId = parseInt(match[1]);
                return $dataSkills[skillId] || null;
            }
            return null;
        },

        // 获取技能冷却时间
        getSkillCooldown: function(item) {
            if (!item) return 0;
            var note = item.note || '';

            var match = note.match(/<ESC_skillCooldown:(\d+)>/i);
            if (match) {
                return parseInt(match[1]) * 60;  // 转换为帧数
            }
            return 600;  // 默认10秒
        },

        // 应用/移除装备效果
        applyEquipEffects: function(item, equip) {
            if (!item) return;

            var actor = $gameParty.leader();
            if (!actor) return;

            // 如果是武器或防具，使用RPG Maker内置系统
            if (DataManager.isWeapon(item) || DataManager.isArmor(item)) {
                // RPG Maker会自动处理
                return;
            }

            // 自定义装备效果（从备注读取）
            var note = item.note || '';

            // 参数加成
            var params = ['maxHp', 'maxMp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'];
            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                var regex = new RegExp('<ESC_' + param + ':(-?\\d+)>', 'i');
                var match = note.match(regex);
                if (match) {
                    var value = parseInt(match[1]);
                    if (equip) {
                        actor._paramPlus[i] += value;
                    } else {
                        actor._paramPlus[i] -= value;
                    }
                }
            }

            // 被动效果
            var passiveMatch = note.match(/<ESC_passive:(\w+):(-?\d+)>/i);
            if (passiveMatch) {
                // 这里可以扩展被动效果系统
                console.log('Passive effect: ' + passiveMatch[1] + ' = ' + passiveMatch[2]);
            }
        },

        // 获取主动技能列表（前3个部位）
        getActiveSkills: function() {
            var skills = [];

            for (var i = 0; i < 3; i++) {
                var item = this._slots[i];
                if (item && this.getSkillType(item) === 'active') {
                    var skill = this.getSkill(item);
                    if (skill) {
                        skills.push({
                            slotIndex: i,
                            skill: skill,
                            item: item,
                            cooldown: this._skillCooldowns[i]
                        });
                    } else {
                        skills.push(null);
                    }
                } else {
                    skills.push(null);
                }
            }

            return skills;
        },

        // 使用技能
        useSkill: function(slotIndex) {
            if (slotIndex < 0 || slotIndex >= 3) return false;

            var item = this._slots[slotIndex];
            if (!item) return false;

            if (this._skillCooldowns[slotIndex] > 0) {
                console.log('Skill on cooldown');
                return false;
            }

            var skill = this.getSkill(item);
            if (!skill) return false;

            // 执行技能效果
            this.executeSkill(skill, item);

            // 设置冷却
            this._skillCooldowns[slotIndex] = this.getSkillCooldown(item);

            return true;
        },

        // 执行技能效果
        executeSkill: function(skill, item) {
            var note = item.note || '';

            // 从备注读取技能效果
            var effectMatch = note.match(/<ESC_effect:(\w+)(?::([^>]+))?>/i);
            if (effectMatch) {
                var effectType = effectMatch[1].toLowerCase();
                var effectParams = effectMatch[2] ? effectMatch[2].split(',') : [];

                switch (effectType) {
                    case 'freeze_enemies':
                        this.effectFreezeEnemies(parseFloat(effectParams[0]) || 1);
                        break;
                    case 'heal':
                        this.effectHeal(parseInt(effectParams[0]) || 50);
                        break;
                    case 'speed_boost':
                        this.effectSpeedBoost(parseFloat(effectParams[0]) || 1.5, parseInt(effectParams[1]) || 5);
                        break;
                    case 'flash':
                        this.effectFlash();
                        break;
                    default:
                        console.log('Unknown effect: ' + effectType);
                }
            }

            // 播放动画
            if (skill.animationId > 0) {
                var actor = $gameParty.leader();
                if (actor) {
                    $gameTemp.requestAnimation([actor], skill.animationId);
                }
            }

            console.log('Used skill: ' + skill.name);
        },

        // 效果：冻结敌人
        effectFreezeEnemies: function(duration) {
            // 标记面朝方向的敌人为冻结状态
            var player = $gamePlayer;
            var dir = player.direction();

            // 这里需要与敌人系统配合
            if (ESC.EnemyManager) {
                ESC.EnemyManager.freezeEnemiesInDirection(dir, duration * 60);
            }

            console.log('Freeze enemies for ' + duration + 's in direction ' + dir);
        },

        // 效果：治疗
        effectHeal: function(amount) {
            var actor = $gameParty.leader();
            if (actor) {
                actor.gainHp(amount);
            }
        },

        // 效果：速度提升
        effectSpeedBoost: function(multiplier, duration) {
            // 临时速度提升
            if (ESC.GameState) {
                ESC.GameState.tempSpeedBoost = {
                    multiplier: multiplier,
                    duration: duration * 60
                };
            }
        },

        // 效果：闪光
        effectFlash: function() {
            $gameScreen.startFlash([255, 255, 255, 200], 10);
        },

        // 更新冷却
        updateCooldowns: function() {
            for (var i = 0; i < 3; i++) {
                if (this._skillCooldowns[i] > 0) {
                    this._skillCooldowns[i]--;
                }
            }
        },

        // 检查技能是否可用
        isSkillReady: function(slotIndex) {
            return this._skillCooldowns[slotIndex] <= 0;
        },

        // 获取冷却进度 (0-1)
        getCooldownProgress: function(slotIndex) {
            var item = this._slots[slotIndex];
            if (!item) return 1;

            var maxCooldown = this.getSkillCooldown(item);
            var currentCooldown = this._skillCooldowns[slotIndex];

            return 1 - (currentCooldown / maxCooldown);
        },

        // 保存数据
        saveData: function() {
            return this._slots.map(function(item) {
                if (item) {
                    return {
                        type: DataManager.isWeapon(item) ? 'weapon' :
                              DataManager.isArmor(item) ? 'armor' : 'item',
                        id: item.id
                    };
                }
                return null;
            });
        },

        // 加载数据
        loadData: function(data) {
            if (!data || !Array.isArray(data)) return;

            this._slots = data.map(function(saved) {
                if (!saved) return null;

                switch (saved.type) {
                    case 'weapon':
                        return $dataWeapons[saved.id];
                    case 'armor':
                        return $dataArmors[saved.id];
                    case 'item':
                        return $dataItems[saved.id];
                    default:
                        return null;
                }
            });
        }
    };

    //=============================================================================
    // 集成到场景更新 - 使用累加模式避免覆盖其他插件
    //=============================================================================
    var _ESC_Equipment_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _ESC_Equipment_Scene_Map_update.call(this);

        // 更新技能冷却
        if (ESC.Equipment && ESC.Equipment.updateCooldowns) {
            ESC.Equipment.updateCooldowns();
        }

        // 处理技能按键 - 安全检查
        if (this.isBusy()) return;
        if (!$gamePlayer) return;
        if (typeof $gamePlayer.canMove !== 'function') return;
        if (!$gamePlayer.canMove()) return;

        // 技能键 Q, W, E
        for (var i = 0; i < 3; i++) {
            if (Input.isTriggered('skill' + (i + 1))) {
                if (ESC.Equipment && ESC.Equipment.useSkill) {
                    ESC.Equipment.useSkill(i);
                }
            }
        }
    };

    //=============================================================================
    // 按键映射
    //=============================================================================
    Input.keyMapper[81] = 'skill1';   // Q
    Input.keyMapper[87] = 'skill2';   // W
    Input.keyMapper[69] = 'skill3';   // E

    //=============================================================================
    // 存档扩展 - 使用累加模式
    //=============================================================================
    var _ESC_Equipment_DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        var contents = _ESC_Equipment_DataManager_makeSaveContents.call(this);
        if (!contents.escData) contents.escData = {};
        contents.escData.equipment = ESC.Equipment.saveData();
        return contents;
    };

    var _ESC_Equipment_DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _ESC_Equipment_DataManager_extractSaveContents.call(this, contents);
        if (contents.escData && contents.escData.equipment) {
            ESC.Equipment.loadData(contents.escData.equipment);
        }
    };

    //=============================================================================
    // 装备界面窗口 (基础版)
    //=============================================================================
    function Window_Equipment() {
        this.initialize.apply(this, arguments);
    }

    Window_Equipment.prototype = Object.create(Window_Selectable.prototype);
    Window_Equipment.prototype.constructor = Window_Equipment;

    Window_Equipment.prototype.initialize = function(rect, menuScale) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this._menuScale = menuScale || 1;  // 菜单缩放比例（60%限制时可能<1）
        this._actor = $gameParty ? $gameParty.leader() : null;
        // 确保调用refresh绘制内容
        this.refresh();
    };

    // 获取实际使用的缩放偏移值
    Window_Equipment.prototype.getScaledValue = function(baseValue) {
        var resolutionScaled = ESC.Scale ? ESC.Scale.scale(baseValue) : baseValue;
        return Math.floor(resolutionScaled * this._menuScale);
    };

    // 获取实际使用的字体大小
    Window_Equipment.prototype.getScaledFont = function(baseFontSize) {
        var resolutionScaled = ESC.Scale ? ESC.Scale.scaleFont(baseFontSize) : baseFontSize;
        return Math.floor(resolutionScaled * Math.sqrt(this._menuScale));
    };

    Window_Equipment.prototype.maxItems = function() {
        return 5;
    };

    Window_Equipment.prototype.maxCols = function() {
        return 1;
    };

    Window_Equipment.prototype.itemHeight = function() {
        return this.lineHeight() * 1;
    };

    Window_Equipment.prototype.item = function() {
        return ESC.Equipment.getEquip(this.index());
    };

    Window_Equipment.prototype.drawItem = function(index) {
        // 安全检查
        if (!this.contents) return;

        var rect = this.itemLineRect(index);
        var item = ESC.Equipment.getEquip(index);

        // 绘制部位名称
        this.changeTextColor(this.systemColor());
        this.drawText(ESC.EquipSlotNames[index], rect.x, rect.y, 80);

        // 绘制装备名称
        this.resetTextColor();
        if (item) {
            this.drawItemName(item, rect.x + 85, rect.y, rect.width - 85);
        } else {
            this.changePaintOpacity(false);
            this.drawText('---', rect.x + 85, rect.y, rect.width - 85);
            this.changePaintOpacity(true);
        }
    };

    Window_Equipment.prototype.refresh = function() {
        // 先调用父类refresh创建contents
        Window_Selectable.prototype.refresh.call(this);

        // 检查contents是否存在
        if (!this.contents) return;

        // 清除内容
        this.contents.clear();

        // 动态缩放参数（结合分辨率缩放和菜单缩放）
        var padding = this.getScaledValue(12);
        var titleFontSize = this.getScaledFont(22);
        var slotFontSize = this.getScaledFont(14);
        var nameFontSize = this.getScaledFont(16);

        // 绘制标题 - 使用更大的字体
        this.contents.fontSize = titleFontSize;
        this.contents.textColor = '#b0b0d0';
        this.contents.drawText('装备', 0, padding, this.contents.width, 'center');

        // 绘制所有装备槽（5个部位全部显示，带图标）
        var offsetY = this.getScaledValue(50);  // 标题区域
        var slotHeight = this.getScaledValue(50);  // 每个槽位高度
        var iconSize = this.getScaledValue(42);  // 图标大小

        for (var i = 0; i < this.maxItems(); i++) {
            var y = offsetY + i * slotHeight;
            var item = ESC.Equipment.getEquip(i);
            var x = padding;

            // 绘制槽位背景
            this.contents.fillRect(x, y, this.contents.width - padding * 2, slotHeight - this.getScaledValue(6), '#1e1e2a');

            // 绘制槽位边框
            var ctx = this.contents._context;
            if (ctx) {
                ctx.strokeStyle = '#4a4a6a';
                ctx.lineWidth = Math.max(1, this.getScaledValue(1));
                ctx.strokeRect(x, y, this.contents.width - padding * 2, slotHeight - this.getScaledValue(6));
            }

            // 绘制图标区域
            var iconX = x + this.getScaledValue(6);
            var iconY = y + this.getScaledValue(4);
            this.contents.fillRect(iconX, iconY, iconSize, iconSize, '#2a2a3a');
            if (ctx) {
                ctx.strokeStyle = '#5a5a7a';
                ctx.lineWidth = Math.max(1, this.getScaledValue(1));
                ctx.strokeRect(iconX, iconY, iconSize, iconSize);
            }

            // 绘制装备图标
            if (item && item.iconIndex) {
                var iconBitmap = ImageManager.loadSystem('IconSet');
                var sx = (item.iconIndex % 16) * 32;
                var sy = Math.floor(item.iconIndex / 16) * 32;
                this.contents.blt(iconBitmap, sx, sy, 32, 32, iconX + this.getScaledValue(5), iconY + this.getScaledValue(5), iconSize - this.getScaledValue(10), iconSize - this.getScaledValue(10));
            }

            // 绘制部位名称
            this.contents.fontSize = slotFontSize;
            this.contents.textColor = '#8a8aaa';
            this.contents.drawText(ESC.EquipSlotNames[i], iconX + iconSize + this.getScaledValue(10), y + this.getScaledValue(6), this.getScaledValue(80), slotFontSize);

            // 绘制装备名称
            this.contents.fontSize = nameFontSize;
            var nameX = iconX + iconSize + this.getScaledValue(10);
            var nameY = y + this.getScaledValue(24);
            var nameWidth = this.contents.width - nameX - padding * 2;

            if (item) {
                this.contents.textColor = '#d0d0e0';
                var name = item.name;
                while (this.contents.measureTextWidth(name) > nameWidth && name.length > 1) {
                    name = name.slice(0, -1);
                }
                if (name !== item.name) name += '...';
                this.contents.drawText(name, nameX, nameY, nameWidth, nameFontSize);
            } else {
                this.contents.textColor = '#5a5a6a';
                this.contents.drawText('空', nameX, nameY, nameWidth, nameFontSize);
            }
        }
    };

    // 挂载到ESC命名空间，供其他插件使用
    ESC.Window_Equipment = Window_Equipment;

    //=============================================================================
    // 调试命令
    //=============================================================================
    if (Utils.isOptionValid('test')) {
        window.ESCDebug = window.ESCDebug || {};
        window.ESCDebug.equip = function(slotIndex, itemId) {
            var item = $dataArmors[itemId] || $dataWeapons[itemId] || $dataItems[itemId];
            if (item) {
                ESC.Equipment.equip(slotIndex, item);
                console.log('Equipped ' + item.name + ' to ' + ESC.EquipSlotNames[slotIndex]);
            }
        };
        window.ESCDebug.unequip = function(slotIndex) {
            var item = ESC.Equipment.unequip(slotIndex);
            if (item) {
                console.log('Unequipped ' + item.name + ' from ' + ESC.EquipSlotNames[slotIndex]);
            }
        };
        window.ESCDebug.getSkills = function() {
            return ESC.Equipment.getActiveSkills();
        };
    }

    console.log('ESC_Equipment loaded successfully');
})();
