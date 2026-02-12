//=============================================================================
// ESC_Core.js - 逃离千禧年 核心系统
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 逃离千禧年核心系统 - 管理游戏全局状态和数据
@author 2000sEscape Team
@version 1.0.0

@help
这是逃离千禧年的核心插件，提供全局状态管理和工具函数。

@param memoryCurrency
@text 回忆货币名称
@default 回忆碎片
@type string

@param attackKey
@text 攻击按键
@default ok
@type select
@option 确定(ok)
@option Shift
@option Z

@param attackCooldown
@text 攻击冷却(帧)
@default 30
@type number
*/

(function() {
    'use strict';

    var pluginName = 'ESC_Core';
    var params = PluginManager.parameters(pluginName);

    // 全局命名空间
    window.ESC = window.ESC || {};

    //=============================================================================
    // 配置
    //=============================================================================
    ESC.Config = {
        memoryCurrencyName: params.memoryCurrency || '回忆碎片',
        attackKey: params.attackKey || 'ok',
        attackCooldown: Number(params.attackCooldown) || 30,
        invincibleFrames: 60,      // 受伤无敌帧数
        knockbackDistance: 1,      // 击退距离
        attackRange: 1.5,          // 攻击范围
        collectDistance: 1         // 拾取距离
    };

    //=============================================================================
    // 游戏状态管理
    //=============================================================================
    ESC.GameState = {
        // 当前关卡数据
        currentLevel: {
            id: 0,
            name: '',
            itemsCollected: [],
            enemiesDefeated: 0,
            timeElapsed: 0,
            extractionPoints: []
        },

        // 玩家持久数据
        playerData: {
            memoryCoins: 0,          // 回忆货币
            memoryLevel: 1,          // 记忆等级
            unlockedWeapons: [],     // 已解锁武器
            unlockedSkills: [],      // 已解锁技能
            collectedItems: [],      // 历史收集物品ID
            totalExtractions: 0,     // 总撤离次数
            playTime: 0              // 总游戏时间
        },

        // 重置当前关卡数据
        resetCurrentLevel: function() {
            this.currentLevel = {
                id: 0,
                name: '',
                itemsCollected: [],
                enemiesDefeated: 0,
                timeElapsed: 0,
                extractionPoints: []
            };
        },

        // 添加收集物品
        addCollectedItem: function(item) {
            this.currentLevel.itemsCollected.push(item);
        },

        // 计算当前关卡回忆价值
        calculateLevelValue: function() {
            var sum = 0;
            for (var i = 0; i < this.currentLevel.itemsCollected.length; i++) {
                sum += this.currentLevel.itemsCollected[i].memoryValue || 0;
            }
            return sum;
        },

        // 完成撤离，结算
        completeExtraction: function() {
            var value = this.calculateLevelValue();
            this.playerData.memoryCoins += value;
            this.playerData.totalExtractions++;

            // 记录历史收集
            for (var i = 0; i < this.currentLevel.itemsCollected.length; i++) {
                var item = this.currentLevel.itemsCollected[i];
                if (this.playerData.collectedItems.indexOf(item.id) === -1) {
                    this.playerData.collectedItems.push(item.id);
                }
            }

            return {
                items: this.currentLevel.itemsCollected,
                totalValue: value,
                stats: {
                    time: this.currentLevel.timeElapsed,
                    enemies: this.currentLevel.enemiesDefeated,
                    itemCount: this.currentLevel.itemsCollected.length
                }
            };
        },

        // 保存数据到游戏变量
        saveToVariables: function() {
            // 使用游戏变量存储
            // 变量1: 回忆货币
            // 变量2: 记忆等级
            // 变量3: 总撤离次数
            $gameVariables.setValue(1, this.playerData.memoryCoins);
            $gameVariables.setValue(2, this.playerData.memoryLevel);
            $gameVariables.setValue(3, this.playerData.totalExtractions);
        },

        // 从游戏变量加载数据
        loadFromVariables: function() {
            this.playerData.memoryCoins = $gameVariables.value(1) || 0;
            this.playerData.memoryLevel = $gameVariables.value(2) || 1;
            this.playerData.totalExtractions = $gameVariables.value(3) || 0;
        }
    };

    //=============================================================================
    // 工具函数
    //=============================================================================
    ESC.Utils = {
        // 计算两点距离
        distance: function(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        },

        // 计算方向
        directionBetween: function(x1, y1, x2, y2) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            if (Math.abs(dx) > Math.abs(dy)) {
                return dx > 0 ? 6 : 4; // 右或左
            } else {
                return dy > 0 ? 2 : 8; // 下或上
            }
        },

        // 检查是否在扇形范围内
        isInFanRange: function(attackerX, attackerY, attackerDir, targetX, targetY, range) {
            var dist = this.distance(attackerX, attackerY, targetX, targetY);
            if (dist > range) return false;

            // 简化版本：检查是否在正面或侧前方
            var dx = targetX - attackerX;
            var dy = targetY - attackerY;

            switch(attackerDir) {
                case 2: return dy >= -0.5; // 下
                case 8: return dy <= 0.5;  // 上
                case 4: return dx <= 0.5;  // 左
                case 6: return dx >= -0.5; // 右
                default: return true;
            }
        },

        // 格式化时间（帧数转分:秒）
        formatTime: function(frames) {
            var seconds = Math.floor(frames / 60);
            var minutes = Math.floor(seconds / 60);
            var secs = seconds % 60;
            var secsStr = secs < 10 ? '0' + secs : String(secs);
            return minutes + ':' + secsStr;
        },

        // 随机整数
        randomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    };

    //=============================================================================
    // 数据管理器扩展 - 回忆物品数据库
    //=============================================================================
    ESC.MemoryItems = {
        _data: {},

        // 初始化物品数据
        init: function() {
            // 这里可以加载自定义物品数据
            // 目前使用游戏内置物品系统的扩展属性
        },

        // 获取物品的回忆价值
        getMemoryValue: function(itemId) {
            var item = $dataItems[itemId];
            if (!item) return 0;

            // 从物品备注中读取，或使用价格作为基础
            var noteMatch = item.note.match(/<memoryValue:\s*(\d+)>/i);
            if (noteMatch) {
                return parseInt(noteMatch[1]);
            }
            return item.price || 0;
        },

        // 检查物品是否可使用
        isUsable: function(itemId) {
            var item = $dataItems[itemId];
            if (!item) return false;
            return item.consumable;
        },

        // 获取物品稀有度
        getRarity: function(itemId) {
            var item = $dataItems[itemId];
            if (!item) return 'common';

            if (item.note.indexOf('<rare>') >= 0) return 'rare';
            if (item.note.indexOf('<legendary>') >= 0) return 'legendary';
            return 'common';
        },

        // 获取物品完整信息
        getItemInfo: function(itemId) {
            var item = $dataItems[itemId];
            if (!item) return null;

            return {
                id: itemId,
                name: item.name,
                description: item.description,
                iconIndex: item.iconIndex,
                memoryValue: this.getMemoryValue(itemId),
                usable: this.isUsable(itemId),
                rarity: this.getRarity(itemId)
            };
        }
    };

    //=============================================================================
    // 场景启动时初始化
    //=============================================================================
    var _ESC_Core_Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _ESC_Core_Scene_Map_start.call(this);
        ESC.MemoryItems.init();

        // 检查是否是新关卡
        if (ESC.GameState.currentLevel.id === 0) {
            ESC.GameState.currentLevel.id = $gameMap.mapId();
            var mapInfo = $dataMapInfos[$gameMap.mapId()];
            ESC.GameState.currentLevel.name = mapInfo ? mapInfo.name : '未知回忆';
        }
    };

    //=============================================================================
    // 游戏时间追踪
    //=============================================================================
    var _ESC_Core_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _ESC_Core_Scene_Map_update.call(this);
        // 检查地图是否有效且没有消息窗口阻塞 - 不使用 return
        if ($gameMap && $gameMessage && !$gameMessage.isBusy()) {
            ESC.GameState.currentLevel.timeElapsed++;
        }
        // 注意：不要在这里 return，让其他插件的 update 也能执行
    };

    //=============================================================================
    // 存档扩展
    //=============================================================================
    var _ESC_Core_DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        var contents = _ESC_Core_DataManager_makeSaveContents.call(this);
        contents.escGameState = ESC.GameState;
        return contents;
    };

    var _ESC_Core_DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _ESC_Core_DataManager_extractSaveContents.call(this, contents);
        if (contents.escGameState) {
            // 合并存档数据
            var keys = Object.keys(contents.escGameState.playerData);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                ESC.GameState.playerData[key] = contents.escGameState.playerData[key];
            }
        }
    };

    //=============================================================================
    // 控制台调试命令
    //=============================================================================
    if (Utils.isOptionValid('test')) {
        window.ESCDebug = {
            addCoins: function(amount) {
                ESC.GameState.playerData.memoryCoins += amount;
                console.log('Added ' + amount + ' memory coins. Total: ' + ESC.GameState.playerData.memoryCoins);
            },
            getState: function() {
                return ESC.GameState;
            },
            resetState: function() {
                ESC.GameState.resetCurrentLevel();
                console.log('Level state reset');
            }
        };
        console.log('ESC Debug commands available: ESCDebug.addCoins(n), ESCDebug.getState(), ESCDebug.resetState()');
    }

    console.log('ESC_Core loaded successfully');
})();
