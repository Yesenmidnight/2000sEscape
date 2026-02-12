//=============================================================================
// ESC_DreamLobby.js - 逃离千禧年 梦境大厅系统
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 梦境大厅系统 - 货币、升级、商店、回忆节点选择
@author 2000sEscape Team
@version 1.0.0
@orderAfter ESC_Core
@orderAfter ESC_Extraction

@help
梦境大厅系统，支持：
- 回忆货币管理
- 记忆等级升级
- 武器/道具商店
- 回忆节点（关卡）选择

在地图事件备注中使用：
<DreamLobby>
<lobbyType:main> - main, shop, upgrade, nodeSelect

回忆节点配置（在事件备注）：
<MemoryNode>
<nodeName:童年小巷>
<nodeMapId:3>
<nodeDifficulty:1>
<requiredLevel:1>

商店物品配置：
<ShopItem>
<itemType:weapon> - weapon, item, skill
<itemId:1>
<price:50>

@param startingCoins
@text 初始货币
@default 0
@type number

@param levelUpBase
@text 升级基础消耗
@default 100
@type number

@param levelUpMultiplier
@text 升级消耗倍率
@default 1.5
@type number
*/

(() => {
    'use strict';

    const pluginName = 'ESC_DreamLobby';
    const params = PluginManager.parameters(pluginName);

    //=============================================================================
    // 配置
    //=============================================================================
    const Config = {
        startingCoins: Number(params.startingCoins) || 0,
        levelUpBase: Number(params.levelUpBase) || 100,
        levelUpMultiplier: Number(params.levelUpMultiplier) || 1.5
    };

    //=============================================================================
    // 梦境大厅管理器
    //=============================================================================
    ESC.DreamLobby = {
        // 可用的回忆节点
        memoryNodes: [
            {
                id: 1,
                name: '童年小巷',
                description: '黄昏时分的小巷，充满了童年的气息...',
                mapId: 3,
                difficulty: 1,
                requiredLevel: 1,
                iconIndex: 1,
                unlocked: true
            },
            {
                id: 2,
                name: '学校走廊',
                description: '放学后的空荡走廊，回声在墙壁间回响...',
                mapId: 4,
                difficulty: 2,
                requiredLevel: 2,
                iconIndex: 2,
                unlocked: false
            },
            {
                id: 3,
                name: '老式商场',
                description: '曾经繁华的商场，如今只剩下回忆...',
                mapId: 5,
                difficulty: 3,
                requiredLevel: 3,
                iconIndex: 3,
                unlocked: false
            }
        ],

        // 商店物品
        shopItems: [
            {
                id: 1,
                type: 'weapon',
                itemId: 1,
                name: '记忆碎片（武器）',
                description: '增加攻击力',
                price: 50,
                effect: { attack: 5 }
            },
            {
                id: 2,
                type: 'item',
                itemId: 2,
                name: '怀旧糖果',
                description: '恢复生命值',
                price: 20,
                effect: { heal: 50 }
            },
            {
                id: 3,
                type: 'skill',
                skillId: 1,
                name: '快速回忆',
                description: '移动速度提升',
                price: 100,
                effect: { speed: 0.2 }
            }
        ],

        // 获取可进入的节点
        getAvailableNodes() {
            const playerLevel = ESC.GameState.playerData.memoryLevel;
            return this.memoryNodes.filter(node =>
                node.unlocked && node.requiredLevel <= playerLevel
            );
        },

        // 获取所有节点（用于显示锁定状态）
        getAllNodes() {
            return this.memoryNodes;
        },

        // 解锁节点
        unlockNode(nodeId) {
            const node = this.memoryNodes.find(n => n.id === nodeId);
            if (node) {
                node.unlocked = true;
            }
        },

        // 计算升级费用
        getLevelUpCost(currentLevel) {
            return Math.floor(Config.levelUpBase * Math.pow(Config.levelUpMultiplier, currentLevel - 1));
        },

        // 升级记忆等级
        levelUp() {
            const currentLevel = ESC.GameState.playerData.memoryLevel;
            const cost = this.getLevelUpCost(currentLevel);

            if (ESC.GameState.playerData.memoryCoins >= cost) {
                ESC.GameState.playerData.memoryCoins -= cost;
                ESC.GameState.playerData.memoryLevel++;

                // 解锁新节点
                this.checkNodeUnlocks();

                return { success: true, newLevel: ESC.GameState.playerData.memoryLevel };
            }

            return { success: false, reason: '回忆碎片不足' };
        },

        // 检查节点解锁
        checkNodeUnlocks() {
            const level = ESC.GameState.playerData.memoryLevel;
            this.memoryNodes.forEach(node => {
                if (node.requiredLevel <= level) {
                    node.unlocked = true;
                }
            });
        },

        // 购买商店物品
        buyItem(shopItemId) {
            const item = this.shopItems.find(i => i.id === shopItemId);
            if (!item) return { success: false, reason: '物品不存在' };

            if (ESC.GameState.playerData.memoryCoins < item.price) {
                return { success: false, reason: '回忆碎片不足' };
            }

            ESC.GameState.playerData.memoryCoins -= item.price;

            // 根据类型处理
            switch(item.type) {
                case 'weapon':
                    // 添加武器到背包
                    $gameParty.gainItem($dataWeapons[item.itemId], 1);
                    break;
                case 'item':
                    $gameParty.gainItem($dataItems[item.itemId], 1);
                    break;
                case 'skill':
                    // 解锁技能
                    if (!ESC.GameState.playerData.unlockedSkills.includes(item.skillId)) {
                        ESC.GameState.playerData.unlockedSkills.push(item.skillId);
                    }
                    break;
            }

            return { success: true, item: item };
        },

        // 进入回忆节点
        enterNode(nodeId) {
            const node = this.memoryNodes.find(n => n.id === nodeId);
            if (!node || !node.unlocked) return false;

            // 重置关卡状态
            ESC.GameState.resetCurrentLevel();
            ESC.GameState.currentLevel.id = node.mapId;
            ESC.GameState.currentLevel.name = node.name;

            // 传送玩家
            $gamePlayer.reserveTransfer(node.mapId, 0, 0, 2, 0);

            return true;
        },

        // 初始化
        init() {
            // 检查是否是新游戏
            if (ESC.GameState.playerData.memoryCoins === 0 && ESC.GameState.playerData.totalExtractions === 0) {
                ESC.GameState.playerData.memoryCoins = Config.startingCoins;
            }

            // 检查节点解锁
            this.checkNodeUnlocks();
        }
    };

    //=============================================================================
    // 节点选择窗口
    //=============================================================================
    class Window_MemoryNodes extends Window_Selectable {
        initialize(rect) {
            this._nodes = ESC.DreamLobby.getAllNodes();
            super.initialize(rect);
            this.refresh();
        }

        maxItems() {
            return this._nodes.length;
        }

        drawItem(index) {
            const node = this._nodes[index];
            const rect = this.itemLineRect(index);
            const playerLevel = ESC.GameState.playerData.memoryLevel;

            // 锁定状态
            const isLocked = !node.unlocked || node.requiredLevel > playerLevel;

            if (isLocked) {
                this.contents.textColor = '#666666';
            } else {
                this.contents.textColor = ESC.ItemManager.getRarityColor(
                    node.difficulty === 3 ? 'legendary' : node.difficulty === 2 ? 'rare' : 'common'
                );
            }

            // 图标
            this.drawIcon(isLocked ? 159 : node.iconIndex, rect.x, rect.y);

            // 名称
            let name = isLocked ? '???' : node.name;
            this.contents.drawText(name, rect.x + 36, rect.y, rect.width - 36, this.lineHeight());

            // 难度
            if (!isLocked) {
                this.contents.textColor = '#888888';
                this.contents.fontSize = 12;
                this.contents.drawText(`难度: ${'★'.repeat(node.difficulty)}`, rect.x + 200, rect.y + 4, 100, this.lineHeight());
                this.contents.fontSize = this.standardFontSize();
            }

            // 等级要求
            if (isLocked && node.requiredLevel > playerLevel) {
                this.contents.textColor = '#ff6666';
                this.contents.drawText(`需要等级 ${node.requiredLevel}`, rect.x, rect.y, rect.width, this.lineHeight(), 'right');
            }
        }

        getNode(index) {
            return this._nodes[index];
        }

        isCurrentItemEnabled() {
            const node = this._nodes[this.index()];
            const playerLevel = ESC.GameState.playerData.memoryLevel;
            return node && node.unlocked && node.requiredLevel <= playerLevel;
        }
    }

    window.Window_MemoryNodes = Window_MemoryNodes;

    //=============================================================================
    // 节点详情窗口
    //=============================================================================
    class Window_NodeDetail extends Window_Base {
        initialize(rect) {
            super.initialize(rect);
            this._node = null;
        }

        setNode(node) {
            if (this._node !== node) {
                this._node = node;
                this.refresh();
            }
        }

        refresh() {
            this.contents.clear();

            if (!this._node) {
                this.contents.textColor = '#888888';
                this.contents.drawText('选择一个回忆节点...', 0, 50, this.width, this.lineHeight(), 'center');
                return;
            }

            const node = this._node;
            const playerLevel = ESC.GameState.playerData.memoryLevel;
            const isLocked = !node.unlocked || node.requiredLevel > playerLevel;

            // 名称
            this.contents.fontSize = 24;
            this.contents.textColor = isLocked ? '#666666' : '#00ff88';
            this.contents.drawText(isLocked ? '???' : node.name, 20, 10, this.width - 40, 30);

            // 描述
            this.contents.fontSize = 16;
            this.contents.textColor = isLocked ? '#555555' : '#cccccc';
            this.drawTextEx(isLocked ? '???' : node.description, 20, 50, this.width - 40);

            // 难度
            this.contents.textColor = '#ffffff';
            this.contents.drawText(`难度: ${'★'.repeat(node.difficulty)}${'☆'.repeat(3 - node.difficulty)}`, 20, 100, this.width - 40, this.lineHeight());

            // 等级要求
            this.contents.textColor = node.requiredLevel > playerLevel ? '#ff6666' : '#00ff88';
            this.contents.drawText(`需要等级: ${node.requiredLevel}`, 20, 130, this.width - 40, this.lineHeight());

            // 提示
            if (!isLocked) {
                this.contents.textColor = '#888888';
                this.contents.drawText('按确认键进入', 20, this.height - 50, this.width - 40, this.lineHeight(), 'center');
            }
        }
    }

    window.Window_NodeDetail = Window_NodeDetail;

    //=============================================================================
    // 升级窗口
    //=============================================================================
    class Window_LevelUp extends Window_Command {
        initialize(rect) {
            super.initialize(rect);
        }

        makeCommandList() {
            const level = ESC.GameState.playerData.memoryLevel;
            const coins = ESC.GameState.playerData.memoryCoins;
            const cost = ESC.DreamLobby.getLevelUpCost(level);
            const canUpgrade = coins >= cost;

            this.addCommand(`升级记忆等级 (${cost} 回忆碎片)`, 'levelUp', canUpgrade);
            this.addCommand('返回', 'cancel');
        }

        drawItem(index) {
            const rect = this.itemLineRect(index);
            this.contents.clearRect(rect);

            this.contents.fontFace = $gameSystem.mainFontFace();
            this.contents.textColor = this.commandColor(index);

            const level = ESC.GameState.playerData.memoryLevel;
            const coins = ESC.GameState.playerData.memoryCoins;
            const cost = ESC.DreamLobby.getLevelUpCost(level);

            if (index === 0) {
                // 显示当前等级和升级信息
                this.contents.drawText(`当前等级: ${level}`, rect.x, rect.y, rect.width, rect.height, 'left');
                this.contents.drawText(`升级费用: ${cost}`, rect.x, rect.y + 30, rect.width, rect.height, 'left');
                this.contents.drawText(`持有碎片: ${coins}`, rect.x, rect.y + 60, rect.width, rect.height, 'left');

                const canUpgrade = coins >= cost;
                this.changeTextColor(canUpgrade ? '#00ff88' : '#ff6666');
                this.contents.drawText(canUpgrade ? '可以升级' : '碎片不足', rect.x, rect.y + 90, rect.width, rect.height, 'left');
            } else {
                this.contents.drawText(this.commandName(index), rect.x, rect.y, rect.width, rect.height, 'center');
            }
        }

        commandColor(index) {
            return index === 0 ? '#00ff88' : '#ffffff';
        }

        windowHeight() {
            return 200;
        }
    }

    window.Window_LevelUp = Window_LevelUp;

    //=============================================================================
    // 商店窗口
    //=============================================================================
    class Window_Shop extends Window_Selectable {
        initialize(rect) {
            this._items = ESC.DreamLobby.shopItems;
            super.initialize(rect);
            this.refresh();
        }

        maxItems() {
            return this._items.length;
        }

        drawItem(index) {
            const item = this._items[index];
            const rect = this.itemLineRect(index);
            const coins = ESC.GameState.playerData.memoryCoins;
            const canBuy = coins >= item.price;

            // 类型图标
            const typeIcon = item.type === 'weapon' ? 97 : item.type === 'item' ? 64 : 128;
            this.drawIcon(typeIcon, rect.x, rect.y);

            // 名称
            this.contents.textColor = canBuy ? '#ffffff' : '#666666';
            this.contents.drawText(item.name, rect.x + 36, rect.y, rect.width - 100, this.lineHeight());

            // 价格
            this.contents.textColor = canBuy ? '#ffd700' : '#ff6666';
            this.contents.drawText(`${item.price}`, rect.x, rect.y, rect.width - 10, this.lineHeight(), 'right');
        }

        getItem(index) {
            return this._items[index];
        }

        isCurrentItemEnabled() {
            const item = this._items[this.index()];
            return item && ESC.GameState.playerData.memoryCoins >= item.price;
        }
    }

    window.Window_Shop = Window_Shop;

    //=============================================================================
    // 商店详情窗口
    //=============================================================================
    class Window_ShopDetail extends Window_Base {
        initialize(rect) {
            super.initialize(rect);
            this._item = null;
        }

        setItem(item) {
            if (this._item !== item) {
                this._item = item;
                this.refresh();
            }
        }

        refresh() {
            this.contents.clear();

            if (!this._item) {
                this.contents.textColor = '#888888';
                this.contents.drawText('选择一件商品...', 0, 50, this.width, this.lineHeight(), 'center');
                return;
            }

            const item = this._item;
            const coins = ESC.GameState.playerData.memoryCoins;
            const canBuy = coins >= item.price;

            // 名称
            this.contents.fontSize = 24;
            this.contents.textColor = '#00ff88';
            this.contents.drawText(item.name, 20, 10, this.width - 40, 30);

            // 描述
            this.contents.fontSize = 16;
            this.contents.textColor = '#cccccc';
            this.contents.drawText(item.description, 20, 50, this.width - 40);

            // 价格
            this.contents.textColor = canBuy ? '#ffd700' : '#ff6666';
            this.contents.drawText(`价格: ${item.price} 回忆碎片`, 20, 90, this.width - 40, this.lineHeight());

            // 持有
            this.contents.textColor = '#ffffff';
            this.contents.drawText(`持有: ${coins} 回忆碎片`, 20, 120, this.width - 40, this.lineHeight());

            // 提示
            this.contents.textColor = '#888888';
            this.contents.drawText(canBuy ? '按确认键购买' : '回忆碎片不足', 20, this.height - 50, this.width - 40, this.lineHeight(), 'center');
        }
    }

    window.Window_ShopDetail = Window_ShopDetail;

    //=============================================================================
    // HUD - 显示当前货币和等级
    //=============================================================================
    class Sprite_DreamLobbyHud extends Sprite {
        initialize() {
            super.initialize();
            this.createContents();
            this._lastCoins = -1;
            this._lastLevel = -1;
        }

        createContents() {
            this.bitmap = new Bitmap(250, 80);
            this.x = Graphics.boxWidth - 260;
            this.y = 10;
            this.z = 100;
        }

        update() {
            super.update();

            const coins = ESC.GameState.playerData.memoryCoins;
            const level = ESC.GameState.playerData.memoryLevel;

            if (coins !== this._lastCoins || level !== this._lastLevel) {
                this._lastCoins = coins;
                this._lastLevel = level;
                this.refresh();
            }
        }

        refresh() {
            this.bitmap.clear();

            // 背景
            this.bitmap.fillAll('rgba(0, 0, 0, 0.6)');
            this.bitmap.strokeRect(0, 0, 250, 80, 'rgba(0, 255, 136, 0.5)');

            // 标题
            this.bitmap.fontSize = 14;
            this.bitmap.textColor = '#888888';
            this.bitmap.drawText('梦境大厅', 10, 5, 230, 20);

            // 货币
            this.bitmap.fontSize = 20;
            this.bitmap.textColor = '#ffd700';
            this.bitmap.drawText(`${this._lastCoins}`, 10, 25, 180, 24);
            this.bitmap.fontSize = 12;
            this.bitmap.textColor = '#aaaaaa';
            this.bitmap.drawText(ESC.Config.memoryCurrencyName, 100, 28, 100, 20);

            // 等级
            this.bitmap.fontSize = 16;
            this.bitmap.textColor = '#00ff88';
            this.bitmap.drawText(`记忆等级: ${this._lastLevel}`, 10, 52, 230, 20);
        }
    }

    window.Sprite_DreamLobbyHud = Sprite_DreamLobbyHud;

    //=============================================================================
    // 场景初始化
    //=============================================================================
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);

        // 初始化梦境大厅
        ESC.DreamLobby.init();
    };

    // 添加HUD到场景
    const _Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
    Spriteset_Map.prototype.createUpperLayer = function() {
        _Spriteset_Map_createUpperLayer.call(this);

        // 检查是否是梦境大厅地图
        if ($gameMap.mapId() === 2) { // 假设梦境大厅是地图2
            this._dreamLobbyHud = new Sprite_DreamLobbyHud();
            this.addChild(this._dreamLobbyHud);
        }
    };

    //=============================================================================
    // 插件命令
    //=============================================================================
    PluginManager.registerCommand(pluginName, 'showNodeSelect', args => {
        SceneManager.push(Scene_NodeSelect);
    });

    PluginManager.registerCommand(pluginName, 'showShop', args => {
        SceneManager.push(Scene_Shop);
    });

    PluginManager.registerCommand(pluginName, 'showLevelUp', args => {
        SceneManager.push(Scene_LevelUp);
    });

    PluginManager.registerCommand(pluginName, 'getCoins', args => {
        const varId = Number(args.variableId) || 10;
        $gameVariables.setValue(varId, ESC.GameState.playerData.memoryCoins);
    });

    PluginManager.registerCommand(pluginName, 'addCoins', args => {
        const amount = Number(args.amount) || 0;
        ESC.GameState.playerData.memoryCoins += amount;
    });

    PluginManager.registerCommand(pluginName, 'getLevel', args => {
        const varId = Number(args.variableId) || 11;
        $gameVariables.setValue(varId, ESC.GameState.playerData.memoryLevel);
    });

    //=============================================================================
    // 节点选择场景
    //=============================================================================
    class Scene_NodeSelect extends Scene_MenuBase {
        create() {
            super.create();
            this.createBackground();
            this.createTitleWindow();
            this.createNodeWindow();
            this.createDetailWindow();
        }

        createTitleWindow() {
            const rect = new Rectangle(0, 0, Graphics.boxWidth, 60);
            this._titleWindow = new Window_Base(rect);
            this._titleWindow.contents.fontSize = 28;
            this._titleWindow.contents.textColor = '#00ff88';
            this._titleWindow.contents.drawText('选择回忆节点', 0, 10, Graphics.boxWidth, 40, 'center');
            this.addWindow(this._titleWindow);
        }

        createNodeWindow() {
            const rect = new Rectangle(0, 60, 350, Graphics.boxHeight - 60);
            this._nodeWindow = new Window_MemoryNodes(rect);
            this._nodeWindow.setHandler('ok', this.onNodeOk.bind(this));
            this._nodeWindow.setHandler('cancel', this.popScene.bind(this));
            this._nodeWindow.setHandler('change', this.onNodeChange.bind(this));
            this.addWindow(this._nodeWindow);
            this._nodeWindow.activate();
        }

        createDetailWindow() {
            const rect = new Rectangle(350, 60, Graphics.boxWidth - 350, Graphics.boxHeight - 60);
            this._detailWindow = new Window_NodeDetail(rect);
            this.addWindow(this._detailWindow);

            // 显示第一个节点的详情
            if (this._nodeWindow.maxItems() > 0) {
                this._detailWindow.setNode(this._nodeWindow.getNode(0));
            }
        }

        onNodeChange() {
            const node = this._nodeWindow.getNode(this._nodeWindow.index());
            this._detailWindow.setNode(node);
        }

        onNodeOk() {
            const node = this._nodeWindow.getNode(this._nodeWindow.index());

            if (ESC.DreamLobby.enterNode(node.id)) {
                SceneManager.goto(Scene_Map);
            }
        }
    }

    window.Scene_NodeSelect = Scene_NodeSelect;

    //=============================================================================
    // 商店场景
    //=============================================================================
    class Scene_Shop extends Scene_MenuBase {
        create() {
            super.create();
            this.createBackground();
            this.createTitleWindow();
            this.createShopWindow();
            this.createDetailWindow();
        }

        createTitleWindow() {
            const rect = new Rectangle(0, 0, Graphics.boxWidth, 60);
            this._titleWindow = new Window_Base(rect);
            this._titleWindow.contents.fontSize = 28;
            this._titleWindow.contents.textColor = '#ffd700';
            this._titleWindow.contents.drawText('回忆商店', 0, 10, Graphics.boxWidth, 40, 'center');
            this.addWindow(this._titleWindow);
        }

        createShopWindow() {
            const rect = new Rectangle(0, 60, 350, Graphics.boxHeight - 60);
            this._shopWindow = new Window_Shop(rect);
            this._shopWindow.setHandler('ok', this.onShopOk.bind(this));
            this._shopWindow.setHandler('cancel', this.popScene.bind(this));
            this._shopWindow.setHandler('change', this.onShopChange.bind(this));
            this.addWindow(this._shopWindow);
            this._shopWindow.activate();
        }

        createDetailWindow() {
            const rect = new Rectangle(350, 60, Graphics.boxWidth - 350, Graphics.boxHeight - 60);
            this._detailWindow = new Window_ShopDetail(rect);
            this.addWindow(this._detailWindow);

            if (this._shopWindow.maxItems() > 0) {
                this._detailWindow.setItem(this._shopWindow.getItem(0));
            }
        }

        onShopChange() {
            const item = this._shopWindow.getItem(this._shopWindow.index());
            this._detailWindow.setItem(item);
        }

        onShopOk() {
            const item = this._shopWindow.getItem(this._shopWindow.index());
            const result = ESC.DreamLobby.buyItem(item.id);

            if (result.success) {
                $gameMessage.add(`购买了 ${item.name}！`);
                this._shopWindow.refresh();
                this._detailWindow.refresh();
            } else {
                $gameMessage.add(result.reason);
            }

            this._shopWindow.activate();
        }
    }

    window.Scene_Shop = Scene_Shop;

    //=============================================================================
    // 升级场景
    //=============================================================================
    class Scene_LevelUp extends Scene_MenuBase {
        create() {
            super.create();
            this.createBackground();
            this.createLevelWindow();
        }

        createLevelWindow() {
            const rect = new Rectangle(Graphics.boxWidth / 2 - 200, Graphics.boxHeight / 2 - 100, 400, 200);
            this._levelWindow = new Window_LevelUp(rect);
            this._levelWindow.setHandler('levelUp', this.onLevelUp.bind(this));
            this._levelWindow.setHandler('cancel', this.popScene.bind(this));
            this.addWindow(this._levelWindow);
            this._levelWindow.activate();
        }

        onLevelUp() {
            const result = ESC.DreamLobby.levelUp();

            if (result.success) {
                $gameMessage.add(`记忆等级提升到 ${result.newLevel}！`);
                this._levelWindow.refresh();
            } else {
                $gameMessage.add(result.reason);
            }

            this._levelWindow.activate();
        }
    }

    window.Scene_LevelUp = Scene_LevelUp;

    console.log('ESC_DreamLobby loaded successfully');
})();
