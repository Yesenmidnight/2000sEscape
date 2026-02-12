//=============================================================================
// ESC_MemoryItem.js - 逃离千禧年 回忆物品系统
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 回忆物品系统 - 搜集、价值评估、特殊物品管理
@author 2000sEscape Team
@version 1.0.0
@orderAfter ESC_Core

@help
回忆物品系统，支持：
- 场景中的可收集物品
- 回忆价值计算
- 物品稀有度和描述
- 收集反馈和音效

在事件备注中使用以下标签：
<MemoryItem>
<memoryValue:15>
<rare>
<useEffect:heal> - 可选：heal, speed, light

物品拾取方式：
1. 在地图上创建事件，添加 <MemoryItem> 标签
2. 玩家接触或确认键拾取
3. 自动计算回忆价值

@param autoCollect
@text 自动拾取
@desc 接触物品时自动拾取
@default true
@type boolean

@param collectRange
@text 拾取距离
@default 1
@type number

@param showCollectMessage
@text 显示收集消息
@default true
@type boolean

@param collectSe
@text 拾取音效
@default Item3
@type file
@dir audio/se
*/

(() => {
    'use strict';

    const pluginName = 'ESC_MemoryItem';
    const params = PluginManager.parameters(pluginName);

    //=============================================================================
    // 配置
    //=============================================================================
    const Config = {
        autoCollect: params.autoCollect === 'true',
        collectRange: Number(params.collectRange) || 1,
        showCollectMessage: params.showCollectMessage === 'true',
        collectSe: params.collectSe || 'Item3'
    };

    //=============================================================================
    // 回忆物品数据库
    //=============================================================================
    ESC.ItemManager = {
        // 预设的回忆物品（可扩展）
        presetItems: {
            // 日常物品
            1: { name: '旧玩具车', value: 15, desc: '曾经最心爱的玩具，轮子已经转不动了...', rarity: 'common' },
            2: { name: '泛黄照片', value: 30, desc: '照片上的人模糊不清，但感觉很温暖。', rarity: 'rare' },
            3: { name: '褪色红包', value: 25, desc: '里面空空如也，但记得当年收到时的喜悦。', rarity: 'common' },

            // 千禧年特色
            4: { name: '小霸王卡带', value: 45, desc: '超级马里奥...还是魂斗罗？标签已经看不清了。', rarity: 'rare' },
            5: { name: '溜溜球', value: 20, desc: '曾经能玩出很多花样，现在只会缠线。', rarity: 'common' },
            6: { name: '四驱车', value: 35, desc: '赛道上的王者，马达声还在耳边回响。', rarity: 'rare' },

            // 情感物品
            7: { name: '奶奶的针线盒', value: 50, desc: '里面还有几根针和缠绕的线...', rarity: 'rare' },
            8: { name: '旧课本', value: 15, desc: '课本上有很多涂鸦，那是无聊的课堂时光。', rarity: 'common' },
            9: { name: '明信片', value: 40, desc: '远方朋友寄来的，字迹已经模糊。', rarity: 'rare' },

            // 传奇物品
            10: { name: '童年的日记本', value: 100, desc: '记录了那些已经遗忘的梦...', rarity: 'legendary' }
        },

        // 获取物品信息
        getItemInfo(itemId) {
            const preset = this.presetItems[itemId];
            const gameItem = $dataItems[itemId];

            if (preset) {
                return {
                    id: itemId,
                    name: preset.name,
                    description: preset.desc,
                    memoryValue: preset.value,
                    rarity: preset.rarity,
                    iconIndex: gameItem ? gameItem.iconIndex : 0
                };
            }

            if (gameItem) {
                const valueMatch = gameItem.note.match(/<memoryValue:\s*(\d+)>/i);
                const value = valueMatch ? parseInt(valueMatch[1]) : (gameItem.price || 10);

                let rarity = 'common';
                if (gameItem.note.includes('<legendary>')) rarity = 'legendary';
                else if (gameItem.note.includes('<rare>')) rarity = 'rare';

                return {
                    id: itemId,
                    name: gameItem.name,
                    description: gameItem.description,
                    memoryValue: value,
                    rarity: rarity,
                    iconIndex: gameItem.iconIndex
                };
            }

            return null;
        },

        // 获取稀有度颜色
        getRarityColor(rarity) {
            switch(rarity) {
                case 'legendary': return '#ffd700';
                case 'rare': return '#9966ff';
                default: return '#ffffff';
            }
        }
    };

    //=============================================================================
    // 掉落物品管理器
    //=============================================================================
    ESC.LootManager = {
        _loots: [],

        // 生成掉落物
        spawnLoot(data) {
            const loot = {
                id: Date.now(),
                x: data.x,
                y: data.y,
                itemId: data.itemId,
                sprite: null
            };

            this._loots.push(looot);
            this.createLootSprite(loot);
        },

        // 创建掉落物精灵
        createLootSprite(loot) {
            const itemInfo = ESC.ItemManager.getItemInfo(loot.itemId);
            if (!itemInfo) return;

            const sprite = new Sprite_LootItem();
            sprite.setup(loot, itemInfo);

            // 添加到场景
            if (SceneManager._scene._spriteset) {
                SceneManager._scene._spriteset._tilemap.addChild(sprite);
            }

            loot.sprite = sprite;
        },

        // 移除掉落物
        removeLoot(lootId) {
            const index = this._loots.findIndex(l => l.id === lootId);
            if (index >= 0) {
                const loot = this._loots[index];
                if (loot.sprite && loot.sprite.parent) {
                    loot.sprite.parent.removeChild(loot.sprite);
                }
                this._loots.splice(index, 1);
            }
        },

        // 检查玩家拾取
        checkPlayerCollect(player) {
            for (const loot of this._loots) {
                const dist = ESC.Utils.distance(player.x, player.y, loot.x, loot.y);
                if (dist <= Config.collectRange) {
                    return loot;
                }
            }
            return null;
        },

        // 清空所有掉落
        clear() {
            this._loots.forEach(loot => {
                if (loot.sprite && loot.sprite.parent) {
                    loot.sprite.parent.removeChild(loot.sprite);
                }
            });
            this._loots = [];
        }
    };

    //=============================================================================
    // 掉落物精灵
    //=============================================================================
    class Sprite_LootItem extends Sprite {
        setup(loot, itemInfo) {
            this._loot = loot;
            this._itemInfo = itemInfo;
            this._floatOffset = 0;
            this._glowPhase = 0;

            // 使用物品图标
            this.bitmap = ImageManager.loadSystem('IconSet');
            const pw = ImageManager.iconWidth;
            const ph = ImageManager.iconHeight;
            const sx = itemInfo.iconIndex % 16 * pw;
            const sy = Math.floor(itemInfo.iconIndex / 16) * ph;
            this.setFrame(sx, sy, pw, ph);

            this.anchor.set(0.5, 0.5);
            this.z = 100;

            // 根据稀有度设置发光效果
            this._glowColor = ESC.ItemManager.getRarityColor(itemInfo.rarity);
        }

        update() {
            super.update();

            // 浮动动画
            this._floatOffset = Math.sin(Graphics.frameCount * 0.05) * 3;

            // 更新屏幕位置
            const tileWidth = $gameMap.tileWidth();
            const tileHeight = $gameMap.tileHeight();
            this.x = ($gameMap.adjustX(this._loot.x) + 0.5) * tileWidth;
            this.y = ($gameMap.adjustY(this._loot.y) + 0.5) * tileHeight + this._floatOffset;

            // 发光效果
            this._glowPhase += 0.1;
            this.alpha = 0.8 + Math.sin(this._glowPhase) * 0.2;
        }
    }

    window.Sprite_LootItem = Sprite_LootItem;

    //=============================================================================
    // 事件扩展 - 回忆物品
    //=============================================================================
    const _Game_Event_initMembers = Game_Event.prototype.initMembers;
    Game_Event.prototype.initMembers = function() {
        _Game_Event_initMembers.call(this);
        this._isMemoryItem = false;
        this._memoryItemData = null;
        this._collected = false;
    };

    // 设置回忆物品
    Game_Event.prototype.setupMemoryItem = function(itemId) {
        const itemInfo = ESC.ItemManager.getItemInfo(itemId);
        if (!itemInfo) return;

        this._isMemoryItem = true;
        this._memoryItemData = itemInfo;

        // 设置外观为物品图标（可选）
        // 或者保持原有事件外观
    };

    // 收集物品
    Game_Event.prototype.collectItem = function() {
        if (this._collected || !this._isMemoryItem) return false;

        this._collected = true;
        const itemInfo = this._memoryItemData;

        // 添加到收集列表
        ESC.GameState.addCollectedItem(itemInfo);

        // 添加到背包
        $gameParty.gainItem($dataItems[itemInfo.id], 1);

        // 播放音效
        AudioManager.playSe({ name: Config.collectSe, volume: 90, pitch: 100 });

        // 显示收集消息
        if (Config.showCollectMessage) {
            const rarityText = itemInfo.rarity === 'legendary' ? ' ★传说★' :
                              itemInfo.rarity === 'rare' ? ' (稀有)' : '';
            const message = `获得了 ${itemInfo.name}${rarityText}\\n回忆价值: ${itemInfo.memoryValue}`;
            $gameMessage.add(message);
        }

        // 显示收集特效
        this.showCollectEffect();

        // 移除事件
        $gameMap.eraseEvent(this.eventId());

        return true;
    };

    // 收集特效
    Game_Event.prototype.showCollectEffect = function() {
        // 创建收集动画精灵
        const effect = new Sprite_CollectEffect();
        effect.setup(this.x, this.y, this._memoryItemData);
        SceneManager._scene._spriteset.addChild(effect);
    };

    // 从备注读取物品配置
    const _Game_Event_setupPage = Game_Event.prototype.setupPage;
    Game_Event.prototype.setupPage = function() {
        _Game_Event_setupPage.call(this);

        if (this.event() && this.event().note) {
            const note = this.event().note;

            if (note.includes('<MemoryItem>')) {
                const idMatch = note.match(/<itemId:\s*(\d+)>/i);
                if (idMatch) {
                    this.setupMemoryItem(parseInt(idMatch[1]));
                }
            }
        }
    };

    // 玩家接触检测
    const _Game_Player_checkEventTriggerHere = Game_Player.prototype.checkEventTriggerHere;
    Game_Player.prototype.checkEventTriggerHere = function(triggers) {
        _Game_Player_checkEventTriggerHere.call(this, triggers);

        // 检查回忆物品
        if (Config.autoCollect) {
            $gameMap.eventsXy(this.x, this.y).forEach(event => {
                if (event._isMemoryItem && !event._collected) {
                    event.collectItem();
                }
            });
        }
    };

    // 检查附近物品（确认键拾取）
    const _Game_Player_checkEventTriggerThere = Game_Player.prototype.checkEventTriggerThere;
    Game_Player.prototype.checkEventTriggerThere = function(triggers) {
        _Game_Player_checkEventTriggerThere.call(this, triggers);

        // 检查面前的事件
        const direction = this.direction();
        const x2 = $gameMap.roundXWithDirection(this.x, direction);
        const y2 = $gameMap.roundYWithDirection(this.y, direction);

        $gameMap.eventsXy(x2, y2).forEach(event => {
            if (event._isMemoryItem && !event._collected) {
                event.collectItem();
            }
        });
    };

    //=============================================================================
    // 收集特效精灵
    //=============================================================================
    class Sprite_CollectEffect extends Sprite {
        setup(x, y, itemInfo) {
            this._mapX = x;
            this._mapY = y;
            this._itemInfo = itemInfo;
            this._duration = 60;
            this._offsetY = 0;

            // 创建文本
            const bitmap = new Bitmap(120, 64);
            bitmap.fontFace = $gameSystem.mainFontFace();
            bitmap.fontSize = 20;
            bitmap.textColor = ESC.ItemManager.getRarityColor(itemInfo.rarity);
            bitmap.outlineColor = 'rgba(0,0,0,0.5)';
            bitmap.outlineWidth = 2;
            bitmap.drawText(`+${itemInfo.memoryValue}`, 0, 0, 120, 32, 'center');
            bitmap.fontSize = 14;
            bitmap.textColor = '#cccccc';
            bitmap.drawText('回忆价值', 0, 28, 120, 32, 'center');

            this.bitmap = bitmap;
            this.anchor.set(0.5, 0.5);
            this.z = 1000;
        }

        update() {
            super.update();
            this._duration--;
            this._offsetY -= 1;

            const tileWidth = $gameMap.tileWidth();
            const tileHeight = $gameMap.tileHeight();
            this.x = ($gameMap.adjustX(this._mapX) + 0.5) * tileWidth;
            this.y = ($gameMap.adjustY(this._mapY) + 0.5) * tileHeight + this._offsetY;

            // 缩放动画
            const progress = 1 - (this._duration / 60);
            this.scale.x = 1 + Math.sin(progress * Math.PI) * 0.3;
            this.scale.y = 1 + Math.sin(progress * Math.PI) * 0.3;

            // 淡出
            if (this._duration < 20) {
                this.opacity = (this._duration / 20) * 255;
            }

            if (this._duration <= 0) {
                this.parent.removeChild(this);
            }
        }
    }

    window.Sprite_CollectEffect = Sprite_CollectEffect;

    //=============================================================================
    // 场景地图扩展 - 更新掉落物检测
    //=============================================================================
    const _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
    Scene_Map.prototype.updateMain = function() {
        _Scene_Map_updateMain.call(this);

        // 检查掉落物拾取
        if (ESC.LootManager) {
            const loot = ESC.LootManager.checkPlayerCollect($gamePlayer);
            if (loot && Config.autoCollect) {
                this.collectLoot(loot);
            }
        }
    };

    Scene_Map.prototype.collectLoot = function(loot) {
        const itemInfo = ESC.ItemManager.getItemInfo(loot.itemId);
        if (!itemInfo) return;

        // 添加到收集列表
        ESC.GameState.addCollectedItem(itemInfo);

        // 添加到背包
        $gameParty.gainItem($dataItems[loot.itemId], 1);

        // 播放音效
        AudioManager.playSe({ name: Config.collectSe, volume: 90, pitch: 100 });

        // 显示特效
        const effect = new Sprite_CollectEffect();
        effect.setup(loot.x, loot.y, itemInfo);
        this._spriteset.addChild(effect);

        // 移除掉落物
        ESC.LootManager.removeLoot(loot.id);
    };

    //=============================================================================
    // HUD显示当前收集价值
    //=============================================================================
    class Sprite_MemoryHud extends Sprite {
        initialize() {
            super.initialize();
            this.createContents();
            this._lastValue = -1;
        }

        createContents() {
            this.bitmap = new Bitmap(200, 60);
            this.bitmap.fontFace = $gameSystem.mainFontFace();
            this.x = 10;
            this.y = 10;
            this.z = 100;
        }

        update() {
            super.update();
            const currentValue = ESC.GameState.calculateLevelValue();
            if (currentValue !== this._lastValue) {
                this._lastValue = currentValue;
                this.refresh();
            }
        }

        refresh() {
            this.bitmap.clear();

            // 背景
            this.bitmap.fillAll('rgba(0, 0, 0, 0.5)');

            // 标题
            this.bitmap.fontSize = 14;
            this.bitmap.textColor = '#aaaaaa';
            this.bitmap.drawText('回忆价值', 10, 5, 180, 20);

            // 数值
            this.bitmap.fontSize = 24;
            this.bitmap.textColor = '#00ff88';
            const value = ESC.GameState.calculateLevelValue();
            this.bitmap.drawText(value.toString(), 10, 25, 180, 30);

            // 物品数量
            this.bitmap.fontSize = 12;
            this.bitmap.textColor = '#888888';
            const count = ESC.GameState.currentLevel.itemsCollected.length;
            this.bitmap.drawText(`(${count}件物品)`, 80, 30, 100, 20);
        }
    }

    // 在地图场景添加HUD
    const _Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
    Spriteset_Map.prototype.createUpperLayer = function() {
        _Spriteset_Map_createUpperLayer.call(this);
        this._memoryHud = new Sprite_MemoryHud();
        this.addChild(this._memoryHud);
    };

    //=============================================================================
    // 插件命令
    //=============================================================================
    PluginManager.registerCommand(pluginName, 'spawnLoot', args => {
        const x = Number(args.x) || 0;
        const y = Number(args.y) || 0;
        const itemId = Number(args.itemId) || 1;

        ESC.LootManager.spawnLoot({ x, y, itemId });
    });

    PluginManager.registerCommand(pluginName, 'getTotalValue', args => {
        const variableId = Number(args.variableId) || 4;
        const value = ESC.GameState.calculateLevelValue();
        $gameVariables.setValue(variableId, value);
    });

    PluginManager.registerCommand(pluginName, 'clearCollected', args => {
        ESC.GameState.currentLevel.itemsCollected = [];
    });

    console.log('ESC_MemoryItem loaded successfully');
})();
