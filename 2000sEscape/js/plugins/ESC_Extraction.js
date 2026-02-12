//=============================================================================
// ESC_Extraction.js - 逃离千禧年 撤离点与结算系统
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 撤离点与结算系统 - 找到出口、结算回忆价值
@author 2000sEscape Team
@version 1.0.0
@orderAfter ESC_Core
@orderAfter ESC_MemoryItem

@help
撤离点与结算系统，支持：
- 地图上的撤离点
- 撤离条件检测
- 结算界面显示
- 回忆货币转换

在事件备注中使用：
<ExtractionPoint>
<extractionType:basic>  - basic, conditional, rare
<extractionTime:3>      - 撤离所需时间（秒）
<requiredValue:50>      - 需要的最低回忆价值（可选）

撤离流程：
1. 玩家进入撤离点区域
2. 按住确认键开始撤离（需要时间）
3. 撤离成功后进入结算界面
4. 结算后返回梦境大厅

@param extractionKey
@text 撤离按键
@default ok
@type select
@option 确定(ok)
@option Shift

@param baseExtractionTime
@text 基础撤离时间(秒)
@default 3
@type number

@param showExtractionBar
@text 显示撤离进度条
@default true
@type boolean

@param settlementScene
@text 结算后跳转地图ID
@default 2
@type number
*/

(() => {
    'use strict';

    const pluginName = 'ESC_Extraction';
    const params = PluginManager.parameters(pluginName);

    //=============================================================================
    // 配置
    //=============================================================================
    const Config = {
        extractionKey: params.extractionKey || 'ok',
        baseExtractionTime: Number(params.baseExtractionTime) || 3,
        showExtractionBar: params.showExtractionBar === 'true',
        settlementMapId: Number(params.settlementScene) || 2
    };

    //=============================================================================
    // 撤离点管理
    //=============================================================================
    ESC.ExtractionManager = {
        _extractionPoints: [],
        _activeExtraction: null,
        _extractionProgress: 0,
        _isExtracting: false,

        // 注册撤离点
        registerPoint(point) {
            this._extractionPoints.push(point);
        },

        // 清除所有撤离点
        clearPoints() {
            this._extractionPoints = [];
        },

        // 检查玩家是否在撤离点
        checkPlayerInZone(player) {
            for (const point of this._extractionPoints) {
                const dist = ESC.Utils.distance(player.x, player.y, point.x, point.y);
                if (dist <= point.range) {
                    return point;
                }
            }
            return null;
        },

        // 开始撤离
        startExtraction(point) {
            if (this._isExtracting) return;

            // 检查条件
            if (point.requiredValue > 0) {
                const currentValue = ESC.GameState.calculateLevelValue();
                if (currentValue < point.requiredValue) {
                    $gameMessage.add(`需要至少 ${point.requiredValue} 回忆价值才能从此处撤离...`);
                    return false;
                }
            }

            this._activeExtraction = point;
            this._extractionProgress = 0;
            this._isExtracting = true;

            // 播放开始音效
            AudioManager.playSe({ name: 'Save2', volume: 80, pitch: 100 });

            return true;
        },

        // 更新撤离进度
        updateExtraction() {
            if (!this._isExtracting || !this._activeExtraction) return;

            // 检查玩家是否还在撤离点
            const player = $gamePlayer;
            const point = this._activeExtraction;
            const dist = ESC.Utils.distance(player.x, player.y, point.x, point.y);

            if (dist > point.range) {
                // 离开撤离点，取消撤离
                this.cancelExtraction();
                return;
            }

            // 检查按键是否按住
            if (!Input.isPressed(Config.extractionKey)) {
                this.cancelExtraction();
                return;
            }

            // 增加进度
            const extractionTime = point.extractionTime || Config.baseExtractionTime;
            const progressPerFrame = 1 / (extractionTime * 60);
            this._extractionProgress += progressPerFrame;

            // 检查是否完成
            if (this._extractionProgress >= 1) {
                this.completeExtraction();
            }
        },

        // 取消撤离
        cancelExtraction() {
            this._isExtracting = false;
            this._activeExtraction = null;
            this._extractionProgress = 0;

            $gameMessage.add('撤离已取消...');
        },

        // 完成撤离
        completeExtraction() {
            this._isExtracting = false;

            // 执行结算
            const result = ESC.GameState.completeExtraction();

            // 播放完成音效
            AudioManager.playSe({ name: 'Victory1', volume: 90, pitch: 100 });

            // 显示结算界面
            SceneManager.push(Scene_Settlement);
        },

        // 获取当前进度
        getProgress() {
            return this._extractionProgress;
        },

        // 是否正在撤离
        isExtracting() {
            return this._isExtracting;
        }
    };

    //=============================================================================
    // 事件扩展 - 撤离点
    //=============================================================================
    const _Game_Event_initMembers = Game_Event.prototype.initMembers;
    Game_Event.prototype.initMembers = function() {
        _Game_Event_initMembers.call(this);
        this._isExtractionPoint = false;
        this._extractionData = null;
    };

    Game_Event.prototype.setupExtractionPoint = function(data) {
        this._isExtractionPoint = true;
        this._extractionData = {
            x: this.x,
            y: this.y,
            type: data.type || 'basic',
            range: data.range || 1,
            extractionTime: data.extractionTime || Config.baseExtractionTime,
            requiredValue: data.requiredValue || 0
        };

        ESC.ExtractionManager.registerPoint(this._extractionData);
    };

    const _Game_Event_setupPage = Game_Event.prototype.setupPage;
    Game_Event.prototype.setupPage = function() {
        _Game_Event_setupPage.call(this);

        if (this.event() && this.event().note) {
            const note = this.event().note;

            if (note.includes('<ExtractionPoint>')) {
                const typeMatch = note.match(/<extractionType:\s*(\w+)>/i);
                const timeMatch = note.match(/<extractionTime:\s*(\d+)>/i);
                const valueMatch = note.match(/<requiredValue:\s*(\d+)>/i);
                const rangeMatch = note.match(/<extractionRange:\s*(\d+)>/i);

                this.setupExtractionPoint({
                    type: typeMatch ? typeMatch[1] : 'basic',
                    extractionTime: timeMatch ? parseInt(timeMatch[1]) : Config.baseExtractionTime,
                    requiredValue: valueMatch ? parseInt(valueMatch[1]) : 0,
                    range: rangeMatch ? parseInt(rangeMatch[1]) : 1
                });
            }
        }
    };

    //=============================================================================
    // 撤离进度条精灵
    //=============================================================================
    class Sprite_ExtractionBar extends Sprite {
        initialize() {
            super.initialize();
            this.createContents();
            this.visible = false;
            this._lastProgress = 0;
        }

        createContents() {
            this.bitmap = new Bitmap(200, 50);
            this.anchor.set(0.5, 0.5);
            this.z = 200;
        }

        update() {
            super.update();

            const isExtracting = ESC.ExtractionManager.isExtracting();

            if (isExtracting) {
                this.visible = true;
                const progress = ESC.ExtractionManager.getProgress();

                if (progress !== this._lastProgress) {
                    this._lastProgress = progress;
                    this.refresh(progress);
                }

                // 更新位置到玩家位置
                this.updatePosition();
            } else {
                this.visible = false;
            }
        }

        updatePosition() {
            const player = $gamePlayer;
            const tileWidth = $gameMap.tileWidth();
            const tileHeight = $gameMap.tileHeight();

            this.x = ($gameMap.adjustX(player.x) + 0.5) * tileWidth;
            this.y = ($gameMap.adjustY(player.y) - 1) * tileHeight;
        }

        refresh(progress) {
            this.bitmap.clear();

            // 背景
            this.bitmap.fillRect(0, 15, 200, 20, 'rgba(0, 0, 0, 0.7)');

            // 进度条
            const barWidth = Math.floor(196 * progress);
            this.bitmap.fillRect(2, 17, barWidth, 16, '#00ff88');

            // 边框
            this.bitmap.strokeRect(0, 15, 200, 20, '#ffffff');

            // 文字
            this.bitmap.fontFace = $gameSystem.mainFontFace();
            this.bitmap.fontSize = 14;
            this.bitmap.textColor = '#ffffff';
            this.bitmap.drawText('正在撤离...', 0, 0, 200, 15, 'center');

            // 百分比
            this.bitmap.fontSize = 12;
            this.bitmap.drawText(`${Math.floor(progress * 100)}%`, 0, 35, 200, 15, 'center');
        }
    }

    window.Sprite_ExtractionBar = Sprite_ExtractionBar;

    //=============================================================================
    // 撤离点提示精灵
    //=============================================================================
    class Sprite_ExtractionHint extends Sprite {
        initialize() {
            super.initialize();
            this.bitmap = new Bitmap(150, 30);
            this.visible = false;
            this._alphaPhase = 0;
        }

        update() {
            super.update();

            const point = ESC.ExtractionManager.checkPlayerInZone($gamePlayer);

            if (point && !ESC.ExtractionManager.isExtracting()) {
                this.visible = true;
                this._alphaPhase += 0.1;
                this.alpha = 0.7 + Math.sin(this._alphaPhase) * 0.3;
                this.refresh(point);
                this.updatePosition();
            } else {
                this.visible = false;
            }
        }

        updatePosition() {
            const player = $gamePlayer;
            const tileWidth = $gameMap.tileWidth();
            const tileHeight = $gameMap.tileHeight();

            this.x = ($gameMap.adjustX(player.x) + 0.5) * tileWidth - 75;
            this.y = ($gameMap.adjustY(player.y) - 1.5) * tileHeight;
        }

        refresh(point) {
            this.bitmap.clear();
            this.bitmap.fontFace = $gameSystem.mainFontFace();
            this.bitmap.fontSize = 12;
            this.bitmap.textColor = '#00ff88';
            this.bitmap.drawText('按住确认键撤离', 0, 0, 150, 30, 'center');
        }
    }

    window.Sprite_ExtractionHint = Sprite_ExtractionHint;

    //=============================================================================
    // 结算场景
    //=============================================================================
    class Scene_Settlement extends Scene_MenuBase {
        create() {
            super.create();
            this.createBackground();
            this.createResultWindow();
            this.createItemListWindow();
            this.createCommandWindow();
        }

        createBackground() {
            this._backgroundSprite = new Sprite();
            this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
            this._backgroundSprite.setBlendColor([16, 16, 32, 128]);
            this.addChild(this._backgroundSprite);
        }

        createResultWindow() {
            const rect = new Rectangle(0, 0, Graphics.boxWidth, 200);
            this._resultWindow = new Window_SettlementResult(rect);
            this.addWindow(this._resultWindow);
        }

        createItemListWindow() {
            const rect = new Rectangle(0, 200, Graphics.boxWidth, Graphics.boxHeight - 300);
            this._itemListWindow = new Window_SettlementItems(rect);
            this.addWindow(this._itemListWindow);
        }

        createCommandWindow() {
            const rect = new Rectangle(0, Graphics.boxHeight - 100, Graphics.boxWidth, 100);
            this._commandWindow = new Window_SettlementCommand(rect);
            this._commandWindow.setHandler('ok', this.onCommandOk.bind(this));
            this._commandWindow.setHandler('cancel', this.onCommandOk.bind(this));
            this.addWindow(this._commandWindow);
            this._commandWindow.activate();
        }

        onCommandOk() {
            // 返回梦境大厅
            ESC.GameState.resetCurrentLevel();
            ESC.LootManager.clear();
            ESC.ExtractionManager.clearPoints();

            // 保存数据
            ESC.GameState.saveToVariables();

            // 跳转到梦境大厅地图
            $gamePlayer.reserveTransfer(Config.settlementMapId, 0, 0, 2, 0);
            SceneManager.goto(Scene_Map);
        }

        start() {
            super.start();
            this._resultWindow.refresh();
            this._itemListWindow.refresh();
        }
    }

    window.Scene_Settlement = Scene_Settlement;

    //=============================================================================
    // 结算结果窗口
    //=============================================================================
    class Window_SettlementResult extends Window_Base {
        initialize(rect) {
            super.initialize(rect);
            this._result = ESC.GameState.playerData.lastExtractionResult || this.calculateResult();
        }

        calculateResult() {
            return {
                items: [...ESC.GameState.currentLevel.itemsCollected],
                totalValue: ESC.GameState.calculateLevelValue(),
                stats: {
                    time: ESC.GameState.currentLevel.timeElapsed,
                    enemies: ESC.GameState.currentLevel.enemiesDefeated,
                    itemCount: ESC.GameState.currentLevel.itemsCollected.length
                }
            };
        }

        refresh() {
            this.contents.clear();

            // 标题
            this.contents.fontFace = $gameSystem.mainFontFace();
            this.contents.fontSize = 32;
            this.contents.textColor = '#00ff88';
            this.contents.drawText('撤离成功', 0, 20, this.width, 40, 'center');

            // 分隔线
            this.contents.fillRect(50, 70, this.width - 100, 2, '#00ff88');

            // 统计信息
            this.contents.fontSize = 20;
            this.contents.textColor = '#ffffff';

            const stats = this._result.stats;
            const value = this._result.totalValue;

            this.contents.drawText(`回忆价值: ${value}`, 50, 90, this.width - 100, 30, 'left');
            this.contents.drawText(`用时: ${ESC.Utils.formatTime(stats.time)}`, 50, 120, this.width - 100, 30, 'left');
            this.contents.drawText(`收集物品: ${stats.itemCount} 件`, 50, 150, this.width - 100, 30, 'left');

            // 货币显示
            this.contents.fontSize = 24;
            this.contents.textColor = '#ffd700';
            this.contents.drawText(`+${value} ${ESC.Config.memoryCurrencyName}`, 50, 90, this.width - 100, 30, 'right');
        }
    }

    window.Window_SettlementResult = Window_SettlementResult;

    //=============================================================================
    // 结算物品列表窗口
    //=============================================================================
    class Window_SettlementItems extends Window_Selectable {
        initialize(rect) {
            this._items = [...ESC.GameState.currentLevel.itemsCollected];
            super.initialize(rect);
            this.refresh();
        }

        maxItems() {
            return this._items.length;
        }

        drawItem(index) {
            const item = this._items[index];
            if (!item) return;

            const rect = this.itemLineRect(index);

            // 稀有度颜色
            this.contents.textColor = ESC.ItemManager.getRarityColor(item.rarity);

            // 图标
            this.drawIcon(item.iconIndex, rect.x, rect.y);

            // 名称
            this.contents.drawText(item.name, rect.x + 36, rect.y, rect.width - 36, this.lineHeight());

            // 价值
            this.contents.textColor = '#00ff88';
            this.contents.drawText(`${item.memoryValue}`, rect.x, rect.y, rect.width, this.lineHeight(), 'right');
        }

        refresh() {
            this.contents.clear();
            this.drawAllItems();

            if (this._items.length === 0) {
                this.contents.textColor = '#888888';
                this.contents.drawText('没有收集到任何物品...', 0, 50, this.width, this.lineHeight(), 'center');
            }
        }
    }

    window.Window_SettlementItems = Window_SettlementItems;

    //=============================================================================
    // 结算命令窗口
    //=============================================================================
    class Window_SettlementCommand extends Window_HorzCommand {
        initialize(rect) {
            super.initialize(rect);
        }

        maxCols() {
            return 1;
        }

        makeCommandList() {
            this.addCommand('返回梦境大厅', 'ok');
        }

        drawItem(index) {
            this.contents.fontFace = $gameSystem.mainFontFace();
            this.contents.fontSize = 20;
            this.contents.textColor = '#00ff88';
            const rect = this.itemLineRect(index);
            this.contents.drawText(this.commandName(index), rect.x, rect.y, rect.width, rect.height, 'center');
        }
    }

    window.Window_SettlementCommand = Window_SettlementCommand;

    //=============================================================================
    // 场景地图扩展
    //=============================================================================
    const _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
    Scene_Map.prototype.updateMain = function() {
        _Scene_Map_updateMain.call(this);

        // 检查撤离点
        const point = ESC.ExtractionManager.checkPlayerInZone($gamePlayer);

        if (point && Input.isPressed(Config.extractionKey)) {
            if (!ESC.ExtractionManager.isExtracting()) {
                ESC.ExtractionManager.startExtraction(point);
            }
        }

        // 更新撤离进度
        ESC.ExtractionManager.updateExtraction();
    };

    // 添加撤离UI
    const _Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
    Spriteset_Map.prototype.createUpperLayer = function() {
        _Spriteset_Map_createUpperLayer.call(this);

        if (Config.showExtractionBar) {
            this._extractionBar = new Sprite_ExtractionBar();
            this.addChild(this._extractionBar);

            this._extractionHint = new Sprite_ExtractionHint();
            this.addChild(this._extractionHint);
        }
    };

    //=============================================================================
    // 地图切换时清理
    //=============================================================================
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);

        // 清理旧的撤离点
        ESC.ExtractionManager.clearPoints();
    };

    //=============================================================================
    // 插件命令
    //=============================================================================
    PluginManager.registerCommand(pluginName, 'forceExtraction', args => {
        ESC.ExtractionManager.completeExtraction();
    });

    PluginManager.registerCommand(pluginName, 'checkExtractionAccess', args => {
        const variableId = Number(args.variableId) || 5;
        const point = ESC.ExtractionManager.checkPlayerInZone($gamePlayer);
        $gameVariables.setValue(variableId, point ? 1 : 0);
    });

    console.log('ESC_Extraction loaded successfully');
})();
