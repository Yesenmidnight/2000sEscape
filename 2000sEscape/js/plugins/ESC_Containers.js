//=============================================================================
// ESC_Containers.js - 逃离千禧年 容器系统
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 容器系统 - 场景容器、物品收集、容器界面
@author 2000sEscape Team
@version 1.0.0
@base ESC_Core
@base ESC_Backpack

@help
容器系统，包含：
- 多种规格的容器（背包、抽屉、书架、冰箱等）
- 容器交互检测（靠近时按确认键打开）
- 容器界面（双网格显示：容器+玩家背包）
- 拖拽物品在容器和背包之间转移
- 锁定容器机制（需要特定钥匙物品）

数据文件：data/Containers.json
每个容器配置：
- id: 容器唯一ID
- name: 容器名称
- description: 容器描述
- gridCols/gridRows: 容器网格尺寸
- sceneId: 所在场景ID（对应地图ID或自定义标识）
- containerType: 容器类型（backpack/drawer/shelf/fridge等）
- posX/posY: 在场景中的触发位置（像素坐标）
- isLocked: 是否锁定
- lockKeyItem: 解锁所需物品ID（null表示不可解锁）
- items: 容器内物品 [{itemId, x, y}, ...]

按键操作：
- 靠近容器按确认键(空格/Z)打开
- 拖拽物品在容器和背包间转移
- R键旋转物品
- ESC键关闭容器

@param interactionRange
@text 交互距离(像素)
@type number
@default 48

@param autoSaveContainers
@text 自动保存容器状态
@type boolean
@default true
*/

(function() {
    'use strict';

    var pluginName = 'ESC_Containers';
    var params = PluginManager.parameters(pluginName);

    window.ESC = window.ESC || {};

    // 引用BackpackItem类（在ESC_Backpack.js中定义并暴露）
    var BackpackItem = ESC.BackpackItem;

    //=============================================================================
    // 配置
    //=============================================================================
    ESC.ContainerConfig = {
        interactionRange: Number(params.interactionRange) || 48,
        autoSaveContainers: params.autoSaveContainers !== 'false'
    };

    //=============================================================================
    // 容器数据管理器
    //=============================================================================
    ESC.ContainerManager = {
        _data: null,           // 原始容器数据
        _containerItems: {},   // 容器物品状态 {containerId: [BackpackItem, ...]}
        _openedContainers: {}, // 已打开过的容器（用于记录哪些容器被搜刮过）
        _modifiedContainers: {}, // 被修改过的容器状态

        // 加载容器数据（从Containers.json）
        loadContainerData: function() {
            if (this._data) return;

            try {
                var xhr = new XMLHttpRequest();
                var url = 'data/Containers.json';
                xhr.open('GET', url, false);
                xhr.overrideMimeType('application/json');
                xhr.send(null);

                if (xhr.status === 200) {
                    this._data = JSON.parse(xhr.responseText);
                    console.log('[ESC] Containers data loaded: ' + (this._data.length - 1) + ' containers');
                } else {
                    console.error('[ESC] Failed to load Containers.json');
                    this._data = [null];
                }
            } catch (e) {
                console.error('[ESC] Error loading Containers.json:', e);
                this._data = [null];
            }
        },

        // 获取容器数据
        getContainer: function(containerId) {
            this.loadContainerData();
            if (containerId <= 0 || containerId >= this._data.length) return null;
            return this._data[containerId];
        },

        // 获取当前场景的所有容器
        getSceneContainers: function(sceneId) {
            this.loadContainerData();
            var containers = [];

            // 获取当前地图ID
            var mapId = $gameMap ? $gameMap.mapId() : 0;

            for (var i = 1; i < this._data.length; i++) {
                var container = this._data[i];
                if (!container) continue;

                // 检查sceneId匹配（支持地图ID或自定义标识）
                if (container.sceneId === sceneId ||
                    container.sceneId === String(mapId) ||
                    container.sceneId === mapId) {
                    containers.push(container);
                }
            }

            return containers;
        },

        // 初始化容器的物品状态
        initContainerItems: function(containerId) {
            if (this._containerItems[containerId]) return this._containerItems[containerId];

            var container = this.getContainer(containerId);
            if (!container) return [];

            var items = [];

            // 从容器配置加载物品
            if (container.items && container.items.length > 0) {
                for (var i = 0; i < container.items.length; i++) {
                    var itemData = container.items[i];
                    var item = $dataItems[itemData.itemId];
                    if (item) {
                        var bpItem = new BackpackItem(item, itemData.x, itemData.y);
                        items.push(bpItem);
                    }
                }
            }

            this._containerItems[containerId] = items;
            return items;
        },

        // 获取容器物品
        getContainerItems: function(containerId) {
            return this.initContainerItems(containerId);
        },

        // 添加物品到容器
        addItemToContainer: function(containerId, bpItem) {
            var items = this.getContainerItems(containerId);
            items.push(bpItem);
            this._modifiedContainers[containerId] = true;
        },

        // 从容器移除物品
        removeItemFromContainer: function(containerId, bpItem) {
            var items = this.getContainerItems(containerId);
            var index = items.indexOf(bpItem);
            if (index >= 0) {
                items.splice(index, 1);
                this._modifiedContainers[containerId] = true;
                return true;
            }
            return false;
        },

        // 检查容器是否被锁定
        isContainerLocked: function(containerId) {
            var container = this.getContainer(containerId);
            return container ? container.isLocked : false;
        },

        // 尝试解锁容器
        tryUnlockContainer: function(containerId) {
            var container = this.getContainer(containerId);
            if (!container || !container.isLocked) return true;

            // 如果没有钥匙要求，无法解锁
            if (container.lockKeyItem === null) {
                return false;
            }

            // 检查玩家是否有钥匙物品
            var keyItem = $dataItems[container.lockKeyItem];
            if (!keyItem) return false;

            // 检查背包中是否有钥匙
            var backpackItems = ESC.Backpack._items;
            for (var i = 0; i < backpackItems.length; i++) {
                if (backpackItems[i].item === keyItem) {
                    // 找到钥匙，解锁容器
                    container.isLocked = false;
                    this._modifiedContainers[containerId] = true;
                    return true;
                }
            }

            return false;
        },

        // 获取解锁所需钥匙名称
        getLockKeyName: function(containerId) {
            var container = this.getContainer(containerId);
            if (!container || !container.isLocked || container.lockKeyItem === null) {
                return null;
            }
            var keyItem = $dataItems[container.lockKeyItem];
            return keyItem ? keyItem.name : null;
        },

        // 标记容器已打开
        markContainerOpened: function(containerId) {
            this._openedContainers[containerId] = true;
        },

        // 检查容器是否已打开过
        isContainerOpened: function(containerId) {
            return this._openedContainers[containerId] === true;
        },

        // 保存容器状态
        saveData: function() {
            var containerStates = {};

            for (var containerId in this._containerItems) {
                var items = this._containerItems[containerId];
                containerStates[containerId] = items.map(function(bpItem) {
                    return bpItem.toJSON();
                });
            }

            return {
                containerStates: containerStates,
                openedContainers: Object.keys(this._openedContainers).map(function(id) {
                    return parseInt(id);
                }),
                modifiedContainers: Object.keys(this._modifiedContainers).map(function(id) {
                    return parseInt(id);
                })
            };
        },

        // 加载容器状态（从存档）
        loadData: function(savedData) {
            if (!savedData) {
                // 如果没有存档数据，重新从JSON加载
                this._containerItems = {};
                this._openedContainers = {};
                this._modifiedContainers = {};
                this._data = null;
                this.loadContainerData();
                return;
            }

            // 恢复容器状态
            if (savedData.containerStates) {
                for (var containerId in savedData.containerStates) {
                    var savedItems = savedData.containerStates[containerId];
                    var items = [];

                    for (var i = 0; i < savedItems.length; i++) {
                        var saved = savedItems[i];
                        var item = $dataItems[saved.itemId];
                        if (item) {
                            var bpItem = new BackpackItem(item, saved.x, saved.y);
                            bpItem.rotation = saved.rotation || 0;
                            items.push(bpItem);
                        }
                    }

                    this._containerItems[parseInt(containerId)] = items;
                }
            }

            // 恢复已打开记录
            if (savedData.openedContainers) {
                for (var i = 0; i < savedData.openedContainers.length; i++) {
                    this._openedContainers[savedData.openedContainers[i]] = true;
                }
            }

            // 恢复修改记录
            if (savedData.modifiedContainers) {
                for (var i = 0; i < savedData.modifiedContainers.length; i++) {
                    this._modifiedContainers[savedData.modifiedContainers[i]] = true;
                }
            }
        },

        // 检查玩家是否在容器附近
        getPlayerNearbyContainer: function() {
            var containers = this.getSceneContainers();
            var playerX = $gamePlayer ? $gamePlayer.screenX() : 0;
            var playerY = $gamePlayer ? $gamePlayer.screenY() : 0;

            var range = ESC.ContainerConfig.interactionRange;

            for (var i = 0; i < containers.length; i++) {
                var container = containers[i];
                if (!container.posX || !container.posY) continue;

                var dx = Math.abs(playerX - container.posX);
                var dy = Math.abs(playerY - container.posY);

                if (dx <= range && dy <= range) {
                    return container;
                }
            }

            return null;
        }
    };

    //=============================================================================
    // 容器网格类 - 类似BackpackItem的网格管理
    //=============================================================================
    function ContainerGrid(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid = [];
        this.items = [];

        this.initGrid();
    }

    ContainerGrid.prototype.initGrid = function() {
        this.grid = [];
        for (var y = 0; y < this.rows; y++) {
            this.grid[y] = [];
            for (var x = 0; x < this.cols; x++) {
                this.grid[y][x] = null;
            }
        }
    };

    ContainerGrid.prototype.rebuildGrid = function() {
        this.initGrid();
        for (var i = 0; i < this.items.length; i++) {
            this.placeOnGrid(this.items[i]);
        }
    };

    ContainerGrid.prototype.placeOnGrid = function(bpItem) {
        for (var dy = 0; dy < bpItem.getHeight(); dy++) {
            for (var dx = 0; dx < bpItem.getWidth(); dx++) {
                var gx = bpItem.x + dx;
                var gy = bpItem.y + dy;
                if (gy < this.rows && gx < this.cols) {
                    this.grid[gy][gx] = bpItem;
                }
            }
        }
    };

    ContainerGrid.prototype.removeFromGrid = function(bpItem) {
        for (var dy = 0; dy < bpItem.getHeight(); dy++) {
            for (var dx = 0; dx < bpItem.getWidth(); dx++) {
                var gx = bpItem.x + dx;
                var gy = bpItem.y + dy;
                if (gy < this.rows && gx < this.cols) {
                    if (this.grid[gy][gx] === bpItem) {
                        this.grid[gy][gx] = null;
                    }
                }
            }
        }
    };

    ContainerGrid.prototype.canPlaceAt = function(x, y, width, height, excludeItem) {
        if (x < 0 || y < 0 || x + width > this.cols || y + height > this.rows) {
            return false;
        }

        for (var dy = 0; dy < height; dy++) {
            for (var dx = 0; dx < width; dx++) {
                var cell = this.grid[y + dy][x + dx];
                if (cell !== null && cell !== excludeItem) {
                    return false;
                }
            }
        }

        return true;
    };

    ContainerGrid.prototype.findPlacePosition = function(width, height) {
        for (var y = 0; y <= this.rows - height; y++) {
            for (var x = 0; x <= this.cols - width; x++) {
                if (this.canPlaceAt(x, y, width, height)) {
                    return { x: x, y: y };
                }
            }
        }
        return null;
    };

    ContainerGrid.prototype.addItem = function(bpItem) {
        var size = { w: bpItem.getWidth(), h: bpItem.getHeight() };
        var pos = this.findPlacePosition(size.w, size.h);

        if (pos) {
            bpItem.x = pos.x;
            bpItem.y = pos.y;
            this.items.push(bpItem);
            this.placeOnGrid(bpItem);
            return true;
        }
        return false;
    };

    ContainerGrid.prototype.removeItem = function(bpItem) {
        var index = this.items.indexOf(bpItem);
        if (index >= 0) {
            this.removeFromGrid(bpItem);
            this.items.splice(index, 1);
            return true;
        }
        return false;
    };

    ContainerGrid.prototype.moveItem = function(bpItem, newX, newY) {
        var width = bpItem.getWidth();
        var height = bpItem.getHeight();

        if (!this.canPlaceAt(newX, newY, width, height, bpItem)) {
            return false;
        }

        this.removeFromGrid(bpItem);
        bpItem.x = newX;
        bpItem.y = newY;
        this.placeOnGrid(bpItem);

        return true;
    };

    ContainerGrid.prototype.getItemAt = function(x, y) {
        if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
            return this.grid[y][x];
        }
        return null;
    };

    //=============================================================================
    // 容器界面窗口
    //=============================================================================
    function Window_Container() {
        this.initialize.apply(this, arguments);
    }

    Window_Container.prototype = Object.create(Window_Base.prototype);
    Window_Container.prototype.constructor = Window_Container;

    Window_Container.prototype.initialize = function(rect, grid, title, menuScale) {
        Window_Base.prototype.initialize.call(this, rect);
        this._grid = grid;
        this._title = title || '容器';
        this._menuScale = menuScale || 1;  // 菜单缩放比例（60%限制时可能<1）
        this._cellSize = this.getCellSize();
        this._offsetY = this.getScaledValue(36);
        this._draggingItem = null;
        this._dragOffsetX = 0;
        this._dragOffsetY = 0;
        this._originalX = 0;
        this._originalY = 0;
        this._originalRotation = 0;
        this._hoveredItem = null;
        this._isSourceGrid = false; // 拖拽物品是否来自此网格

        // 设置图片加载回调
        var self = this;
        ESC.ItemAppearance.setRefreshCallback(function() {
            self.refresh();
        });

        this.refresh();
    };

    // 获取实际使用的格子大小（考虑菜单缩放）
    Window_Container.prototype.getCellSize = function() {
        var baseCellSize = ESC.BackpackConfig.getCellSize();  // 分辨率缩放后的格子大小
        return Math.floor(baseCellSize * this._menuScale);
    };

    // 获取实际使用的缩放偏移值
    Window_Container.prototype.getScaledValue = function(baseValue) {
        var resolutionScaled = ESC.Scale ? ESC.Scale.scale(baseValue) : baseValue;
        return Math.floor(resolutionScaled * this._menuScale);
    };

    // 获取实际使用的字体大小
    Window_Container.prototype.getScaledFont = function(baseFontSize) {
        var resolutionScaled = ESC.Scale ? ESC.Scale.scaleFont(baseFontSize) : baseFontSize;
        return Math.floor(resolutionScaled * Math.sqrt(this._menuScale));
    };

    Window_Container.prototype.setGrid = function(grid) {
        this._grid = grid;
        this.refresh();
    };

    Window_Container.prototype.setTitle = function(title) {
        this._title = title;
        this.refresh();
    };

    Window_Container.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.updateHover();
    };

    Window_Container.prototype.updateHover = function() {
        if (!this._draggingItem) {
            var cell = this.getCellFromMouse();
            if (cell && cell.x >= 0 && cell.y >= 0 &&
                cell.x < this._grid.cols && cell.y < this._grid.rows) {
                var item = this._grid.getItemAt(cell.x, cell.y);
                if (item !== this._hoveredItem) {
                    this._hoveredItem = item;
                    this.refresh();
                }
            } else {
                if (this._hoveredItem !== null) {
                    this._hoveredItem = null;
                    this.refresh();
                }
            }
        }
    };

    Window_Container.prototype.getCellFromMouse = function() {
        var pos = this.getTransformedTouchPos();
        var offsetX = this.getScaledValue(10);
        var x = pos.x - this.x - this.padding - offsetX;
        var y = pos.y - this.y - this.padding - this._offsetY;
        var cellSize = this._cellSize;

        return {
            x: Math.floor(x / cellSize),
            y: Math.floor(y / cellSize)
        };
    };

    Window_Container.prototype.getTransformedTouchPos = function() {
        if (ESC.CRTFilterManager) {
            return ESC.CRTFilterManager.transformTouchInput();
        }
        return { x: TouchInput.x, y: TouchInput.y };
    };

    Window_Container.prototype.isMouseOverGrid = function() {
        var pos = this.getTransformedTouchPos();
        var offsetX = this.getScaledValue(10);
        var gridX = this.x + this.padding + offsetX;
        var gridY = this.y + this.padding + this._offsetY;
        var cellSize = this._cellSize;
        var gridWidth = this._grid.cols * cellSize;
        var gridHeight = this._grid.rows * cellSize;

        return pos.x >= gridX && pos.x < gridX + gridWidth &&
               pos.y >= gridY && pos.y < gridY + gridHeight;
    };

    Window_Container.prototype.startDrag = function(isSource) {
        if (!this.isMouseOverGrid()) return false;

        var cell = this.getCellFromMouse();
        var item = this._grid.getItemAt(cell.x, cell.y);
        if (item) {
            this._draggingItem = item;
            this._isSourceGrid = isSource;
            this._dragOffsetX = cell.x - item.x;
            this._dragOffsetY = cell.y - item.y;
            this._originalX = item.x;
            this._originalY = item.y;
            this._originalRotation = item.rotation;
            return true;
        }
        return false;
    };

    Window_Container.prototype.getDragItem = function() {
        return this._draggingItem;
    };

    Window_Container.prototype.setDragItem = function(item, isSource) {
        this._draggingItem = item;
        this._isSourceGrid = isSource;
        if (item) {
            this._originalX = item.x;
            this._originalY = item.y;
            this._originalRotation = item.rotation;
        }
    };

    Window_Container.prototype.clearDrag = function() {
        this._draggingItem = null;
        this._isSourceGrid = false;
    };

    Window_Container.prototype.getDropCell = function() {
        if (!this.isMouseOverGrid()) return null;
        return this.getCellFromMouse();
    };

    Window_Container.prototype.canDropAt = function(item, cellX, cellY) {
        if (!item || !cellX || !cellY) return false;
        return this._grid.canPlaceAt(
            cellX - this._dragOffsetX,
            cellY - this._dragOffsetY,
            item.getWidth(),
            item.getHeight(),
            this._isSourceGrid ? item : null
        );
    };

    Window_Container.prototype.getDropPosition = function(cellX, cellY) {
        return {
            x: cellX - this._dragOffsetX,
            y: cellY - this._dragOffsetY
        };
    };

    Window_Container.prototype.refresh = function() {
        if (!this.contents) return;

        this.contents.clear();

        // 动态缩放字体
        var titleFontSize = this.getScaledFont(18);

        // 绘制标题
        this.contents.fontSize = titleFontSize;
        this.contents.textColor = '#b0b0d0';
        this.contents.drawText(this._title, 0, this.getScaledValue(8), this.contents.width, 'center');

        // 绘制网格
        this.drawGrid();

        // 绘制物品
        this.drawItems();
    };

    Window_Container.prototype.drawGrid = function() {
        var ctx = this.contents._context;
        var offsetX = this.getScaledValue(10);
        var cellSize = this._cellSize;

        for (var y = 0; y < this._grid.rows; y++) {
            for (var x = 0; x < this._grid.cols; x++) {
                var px = x * cellSize + offsetX;
                var py = y * cellSize + this._offsetY;

                // 格子背景
                this.contents.fillRect(px, py, cellSize - 2, cellSize - 2, '#1e1e2a');

                // 格子边框
                if (ctx) {
                    ctx.strokeStyle = '#5a5a7a';
                    ctx.lineWidth = Math.max(1, Math.floor(this._menuScale));
                    ctx.strokeRect(px, py, cellSize - 2, cellSize - 2);
                }
            }
        }
    };

    Window_Container.prototype.drawItems = function() {
        var ctx = this.contents._context;
        var offsetX = this.getScaledValue(10);
        var cellSize = this._cellSize;

        for (var i = 0; i < this._grid.items.length; i++) {
            var item = this._grid.items[i];

            // 跳过正在拖拽的物品（由场景级别的精灵显示）
            if (item === this._draggingItem) continue;

            var px = item.x * cellSize + offsetX + 2;
            var py = item.y * cellSize + this._offsetY + 2;
            var width = item.getWidth() * cellSize - 6;
            var height = item.getHeight() * cellSize - 6;

            this.drawItemWithBackground(ctx, item, px, py, width, height);
        }

        // 不再在窗口内绘制拖拽物品，由场景级别的精灵负责显示
        // 这样拖拽物品可以跨窗口显示
    };

    Window_Container.prototype.drawItemWithBackground = function(ctx, bpItem, px, py, width, height) {
        var customColor = ESC.ItemAppearance.getColor(bpItem.item);
        var bgColor = customColor || '#3a3a5a';
        var shouldRotate = bpItem.rotation === 90;

        // 背景
        this.contents.fillRect(px, py, width, height, bgColor);

        // 边框
        if (ctx) {
            ctx.strokeStyle = '#7a7aaa';
            ctx.lineWidth = Math.max(1, Math.floor(2 * this._menuScale));
            ctx.strokeRect(px, py, width, height);
        }

        // 绘制图片或图标
        var customImage = ESC.ItemAppearance.getImage(bpItem.item);
        if (customImage) {
            var itemBitmap = ESC.ItemAppearance.getCachedImage(customImage);
            if (!itemBitmap) {
                itemBitmap = ESC.ItemAppearance.loadImage(customImage);
            }
            if (itemBitmap && itemBitmap.isReady()) {
                if (shouldRotate) {
                    var cachedCanvas = ESC.ItemAppearance.getCachedCanvas(customImage);
                    if (cachedCanvas && ctx) {
                        this.drawRotatedFromCanvas(ctx, cachedCanvas, px, py, width, height, itemBitmap.width, itemBitmap.height);
                    } else {
                        this.drawRotatedImage(this.contents, ctx, itemBitmap, px, py, width, height);
                    }
                } else {
                    this.contents.blt(itemBitmap, 0, 0, itemBitmap.width, itemBitmap.height, px + 2, py + 2, width - 4, height - 4);
                }
            } else {
                this.drawDefaultIcon(bpItem, px, py, width, height, shouldRotate);
            }
        } else {
            this.drawDefaultIcon(bpItem, px, py, width, height, shouldRotate);
        }
    };

    Window_Container.prototype.drawDefaultIcon = function(bpItem, px, py, width, height, shouldRotate) {
        if (!bpItem.item.iconIndex) return;

        var iconBitmap = ImageManager.loadSystem('IconSet');
        if (!iconBitmap || !iconBitmap.isReady()) return;

        var iconX = (bpItem.item.iconIndex % 16) * 32;
        var iconY = Math.floor(bpItem.item.iconIndex / 16) * 32;
        var ctx = this.contents._context;
        var iconPadding = this.getScaledValue(4);

        if (shouldRotate && ctx) {
            var drawSource = this.getDrawableSource(iconBitmap);
            if (drawSource) {
                ctx.save();
                var centerX = px + width / 2;
                var centerY = py + height / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate(Math.PI / 2);
                ctx.translate(-centerX, -centerY);
                var drawWidth = height - iconPadding * 2;
                var drawHeight = width - iconPadding * 2;
                var drawX = centerX - drawWidth / 2;
                var drawY = centerY - drawHeight / 2;
                ctx.drawImage(drawSource, iconX, iconY, 32, 32, drawX, drawY, drawWidth, drawHeight);
                ctx.restore();
            } else {
                this.contents.blt(iconBitmap, iconX, iconY, 32, 32, px + iconPadding, py + iconPadding, width - iconPadding * 2, height - iconPadding * 2);
            }
        } else {
            this.contents.blt(iconBitmap, iconX, iconY, 32, 32, px + iconPadding, py + iconPadding, width - iconPadding * 2, height - iconPadding * 2);
        }
    };

    Window_Container.prototype.getDrawableSource = function(itemBitmap) {
        if (itemBitmap._canvas) return itemBitmap._canvas;
        if (itemBitmap.canvas) return itemBitmap.canvas;
        if (itemBitmap._image) return itemBitmap._image;

        if (itemBitmap.isReady && itemBitmap.isReady()) {
            try {
                if (itemBitmap._baseTexture && itemBitmap._baseTexture.resource) {
                    var source = itemBitmap._baseTexture.resource.source;
                    if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
                        var tempCanvas = document.createElement('canvas');
                        tempCanvas.width = itemBitmap.width;
                        tempCanvas.height = itemBitmap.height;
                        var tempCtx = tempCanvas.getContext('2d');
                        tempCtx.drawImage(source, 0, 0);
                        return tempCanvas;
                    }
                }
            } catch (e) {}
        }
        return null;
    };

    Window_Container.prototype.drawRotatedFromCanvas = function(ctx, canvas, px, py, width, height, srcWidth, srcHeight) {
        var imgPadding = this.getScaledValue(2);

        ctx.save();
        var centerX = px + width / 2;
        var centerY = py + height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-centerX, -centerY);
        var drawWidth = height - imgPadding * 2;
        var drawHeight = width - imgPadding * 2;
        var drawX = centerX - drawWidth / 2;
        var drawY = centerY - drawHeight / 2;
        ctx.drawImage(canvas, 0, 0, srcWidth, srcHeight, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
    };

    Window_Container.prototype.drawRotatedImage = function(bitmap, ctx, itemBitmap, px, py, width, height) {
        if (!ctx) {
            bitmap.blt(itemBitmap, 0, 0, itemBitmap.width, itemBitmap.height, px + 2, py + 2, width - 4, height - 4);
            return;
        }

        var drawSource = this.getDrawableSource(itemBitmap);
        if (!drawSource) {
            bitmap.blt(itemBitmap, 0, 0, itemBitmap.width, itemBitmap.height, px + 2, py + 2, width - 4, height - 4);
            return;
        }

        var imgPadding = this.getScaledValue(2);

        ctx.save();
        var centerX = px + width / 2;
        var centerY = py + height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-centerX, -centerY);
        var drawWidth = height - imgPadding * 2;
        var drawHeight = width - imgPadding * 2;
        var drawX = centerX - drawWidth / 2;
        var drawY = centerY - drawHeight / 2;
        ctx.drawImage(drawSource, 0, 0, itemBitmap.width, itemBitmap.height, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
    };

    Window_Container.prototype.drawDraggingItem = function(ctx, offsetX) {
        var pos = this.getTransformedTouchPos();
        var mouseGridX = pos.x - this.x - this.padding - offsetX;
        var mouseGridY = pos.y - this.y - this.padding - this._offsetY;

        var cellSize = this._cellSize;
        var px = mouseGridX - this._dragOffsetX * cellSize;
        var py = mouseGridY - this._dragOffsetY * cellSize;

        var width = this._draggingItem.getWidth() * cellSize - 6;
        var height = this._draggingItem.getHeight() * cellSize - 6;

        // 半透明背景
        var customColor = ESC.ItemAppearance.getColor(this._draggingItem.item);
        var bgColor = customColor || '#3a3a5a';
        var r = parseInt(bgColor.slice(1, 3), 16);
        var g = parseInt(bgColor.slice(3, 5), 16);
        var b = parseInt(bgColor.slice(5, 7), 16);
        this.contents.fillRect(px + 2, py + 2, width, height, 'rgba(' + r + ',' + g + ',' + b + ',0.7)');

        if (ctx) {
            ctx.strokeStyle = '#aaaadd';
            ctx.lineWidth = Math.max(1, Math.floor(2 * this._menuScale));
            ctx.strokeRect(px + 2, py + 2, width, height);
        }

        // 绘制目标位置预览
        var cell = this.getCellFromMouse();
        if (cell) {
            var targetX = cell.x - this._dragOffsetX;
            var targetY = cell.y - this._dragOffsetY;
            var canPlace = this._grid.canPlaceAt(targetX, targetY,
                this._draggingItem.getWidth(), this._draggingItem.getHeight(),
                this._isSourceGrid ? this._draggingItem : null);

            var previewPx = targetX * cellSize + offsetX;
            var previewPy = targetY * cellSize + this._offsetY;
            var previewWidth = this._draggingItem.getWidth() * cellSize - 2;
            var previewHeight = this._draggingItem.getHeight() * cellSize - 2;

            if (ctx) {
                ctx.strokeStyle = canPlace ? '#66ff66' : '#ff6666';
                ctx.lineWidth = Math.max(1, Math.floor(2 * this._menuScale));
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(previewPx, previewPy, previewWidth, previewHeight);
                ctx.setLineDash([]);
            }
        }
    };

    //=============================================================================
    // 容器场景
    //=============================================================================
    function Scene_Container() {
        this.initialize.apply(this, arguments);
    }

    Scene_Container.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Container.prototype.constructor = Scene_Container;

    Scene_Container.prototype.initialize = function() {
        this._containerId = 0;
        this._containerData = null;
        this._containerGrid = null;
        this._backpackGrid = null;
        this._dragSourceWindow = null; // 'container' or 'backpack'
        this._dragSprite = null;       // 跨窗口拖拽精灵
        this._isDragging = false;      // 是否正在拖拽
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_Container.prototype.setContainer = function(containerId) {
        this._containerId = containerId;
        this._containerData = ESC.ContainerManager.getContainer(containerId);

        if (this._containerData) {
            // 初始化容器网格
            var containerItems = ESC.ContainerManager.getContainerItems(containerId);
            this._containerGrid = new ContainerGrid(this._containerData.gridCols, this._containerData.gridRows);
            for (var i = 0; i < containerItems.length; i++) {
                this._containerGrid.addItem(containerItems[i]);
            }

            // 初始化背包网格（使用当前背包物品的副本）
            this._backpackGrid = new ContainerGrid(ESC.BackpackConfig.gridCols, ESC.BackpackConfig.gridRows);
            var backpackItems = ESC.Backpack._items;
            for (var i = 0; i < backpackItems.length; i++) {
                var bpItem = backpackItems[i];
                var newItem = new BackpackItem(bpItem.item, bpItem.x, bpItem.y);
                newItem.rotation = bpItem.rotation;
                this._backpackGrid.items.push(newItem);
                this._backpackGrid.placeOnGrid(newItem);
            }
        }
    };

    Scene_Container.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);

        this.createBackground();
        this.createContainerWindow();
        this.createBackpackWindow();
        this.createInfoWindow();
        this.createHelpText();
        this.createDragSprite();

        // 标记容器已打开
        if (this._containerId > 0) {
            ESC.ContainerManager.markContainerOpened(this._containerId);
        }
    };

    Scene_Container.prototype.createDragSprite = function() {
        // 创建跨窗口拖拽精灵
        this._dragSprite = new Sprite();
        this._dragSprite.bitmap = new Bitmap(200, 200);
        this._dragSprite.visible = false;
        this._dragSprite.z = 1000;
        this.addChild(this._dragSprite);

        // 创建放置预览精灵（显示在窗口之上）
        this._previewSprite = new Sprite();
        this._previewSprite.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
        this._previewSprite.visible = false;
        this._previewSprite.z = 999;
        this.addChild(this._previewSprite);
    };

    Scene_Container.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);

        // 预加载图片
        ESC.ItemAppearance.preloadBackpackImages();

        // 刷新窗口
        if (this._containerWindow) this._containerWindow.refresh();
        if (this._backpackWindow) this._backpackWindow.refresh();
    };

    Scene_Container.prototype.createBackground = function() {
        this._backgroundSprite = new Sprite();
        var bgBitmap = SceneManager.backgroundBitmap();
        if (bgBitmap) {
            this._backgroundSprite.bitmap = bgBitmap;
        } else {
            var bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
            bitmap.fillAll('rgba(0, 0, 0, 0.6)');
            this._backgroundSprite.bitmap = bitmap;
        }
        this.addChildAt(this._backgroundSprite, 0);
    };

    Scene_Container.prototype.createContainerWindow = function() {
        if (!this._containerData) return;

        var cellSize = ESC.BackpackConfig.getCellSize(); // 使用动态缩放
        var padding = ESC.Scale ? ESC.Scale.scale(20) : 20;
        var titleHeight = ESC.Scale ? ESC.Scale.scale(44) : 44;

        var windowWidth = this._containerData.gridCols * cellSize + padding * 2;
        var windowHeight = this._containerData.gridRows * cellSize + padding * 2 + titleHeight;

        var sideWidth = ESC.Scale ? ESC.Scale.scale(280) : 280;
        var spacing = ESC.Scale ? ESC.Scale.scale(12) : 12;

        var totalWidth = windowWidth + spacing + sideWidth;

        // 菜单最大只占屏幕60%
        var maxMenuWidth = Math.floor(Graphics.boxWidth * 0.6);
        var maxMenuHeight = Math.floor(Graphics.boxHeight * 0.6);

        // 如果超出60%，等比缩放
        var scale = 1;
        if (totalWidth > maxMenuWidth) {
            scale = maxMenuWidth / totalWidth;
        }

        var backpackHeight = ESC.BackpackConfig.gridRows * cellSize + padding * 2 + titleHeight;
        if (Math.max(windowHeight, backpackHeight) * scale > maxMenuHeight) {
            scale = maxMenuHeight / Math.max(windowHeight, backpackHeight);
        }

        // 应用缩放
        if (scale < 1) {
            windowWidth = Math.floor(windowWidth * scale);
            windowHeight = Math.floor(windowHeight * scale);
            sideWidth = Math.floor(sideWidth * scale);
            spacing = Math.floor(spacing * scale);
            totalWidth = windowWidth + spacing + sideWidth;
        }

        this._menuScale = scale;

        var startX = (Graphics.boxWidth - totalWidth) / 2;
        var startY = (Graphics.boxHeight - Math.max(windowHeight, Math.floor(backpackHeight * scale))) / 2;

        this._layout = {
            startX: startX,
            startY: startY,
            containerWidth: windowWidth,
            containerHeight: windowHeight,
            backpackWidth: sideWidth,
            spacing: spacing
        };

        var rect = new Rectangle(startX, startY, windowWidth, windowHeight);
        this._containerWindow = new Window_Container(rect, this._containerGrid, this._containerData.name, scale);
        this.addWindow(this._containerWindow);
    };

    Scene_Container.prototype.createBackpackWindow = function() {
        if (!this._layout) return;

        var layout = this._layout;
        var scale = this._menuScale || 1;
        var x = layout.startX + layout.containerWidth + layout.spacing;
        var y = layout.startY;
        var width = layout.backpackWidth;
        var cellSize = Math.floor(ESC.BackpackConfig.getCellSize() * scale);
        var baseHeight = ESC.BackpackConfig.gridRows * cellSize + this.getScaledValue(64, scale);
        var height = Math.floor(baseHeight);

        var rect = new Rectangle(x, y, width, height);
        this._backpackWindow = new Window_Container(rect, this._backpackGrid, '背包', scale);
        this.addWindow(this._backpackWindow);
    };

    // 辅助方法：获取缩放后的值
    Scene_Container.prototype.getScaledValue = function(baseValue, scale) {
        var resolutionScaled = ESC.Scale ? ESC.Scale.scale(baseValue) : baseValue;
        return Math.floor(resolutionScaled * scale);
    };

    Scene_Container.prototype.createInfoWindow = function() {
        if (!this._layout) return;

        var layout = this._layout;
        var scale = this._menuScale || 1;
        var x = layout.startX + layout.containerWidth + layout.spacing;
        var cellSize = Math.floor(ESC.BackpackConfig.getCellSize() * scale);
        var backpackHeight = ESC.BackpackConfig.gridRows * cellSize + this.getScaledValue(76, scale);
        var y = layout.startY + backpackHeight;
        var height = this.getScaledValue(120, scale);

        var rect = new Rectangle(x, y, layout.backpackWidth, height);
        this._infoWindow = new Window_Base(rect);
        this.addWindow(this._infoWindow);
    };

    Scene_Container.prototype.createHelpText = function() {
        if (!this._layout) return;

        var layout = this._layout;
        var scale = this._menuScale || 1;
        var width = layout.containerWidth;
        var height = this.getScaledValue(36, scale);
        var x = layout.startX;
        var y = layout.startY + layout.containerHeight + this.getScaledValue(8, scale);

        var rect = new Rectangle(x, y, width, height);
        this._helpWindow = new Window_Base(rect);
        this.addWindow(this._helpWindow);

        // 绘制帮助文本
        if (this._helpWindow.contents) {
            this._helpWindow.contents.clear();
            var fontSize = Math.floor((ESC.Scale ? ESC.Scale.scaleFont(14) : 14) * Math.sqrt(scale));
            this._helpWindow.contents.fontSize = fontSize;
            this._helpWindow.contents.textColor = '#a0a0c0';
            this._helpWindow.contents.drawText('拖拽物品转移 | R:旋转 | ESC:关闭', 0, (height - fontSize) / 2, width, 'center');
        }
    };

    Scene_Container.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this);
        this.updateInput();
        this.updateDragging();
        this.updateItemInfo();
    };

    Scene_Container.prototype.updateInput = function() {
        if (Input.isTriggered('cancel') || Input.isTriggered('menu')) {
            this.applyChanges();
            this.popScene();
            return;
        }

        // 旋转物品
        if (Input.isTriggered('pageup') || Input.isTriggered('rotate')) {
            this.rotateHoveredItem();
        }
    };

    Scene_Container.prototype.updateDragging = function() {
        // 开始拖拽
        if (TouchInput.isTriggered()) {
            if (this._containerWindow && this._containerWindow.isMouseOverGrid()) {
                if (this._containerWindow.startDrag(true)) {
                    this._dragSourceWindow = 'container';
                    this._isDragging = true;
                }
            } else if (this._backpackWindow && this._backpackWindow.isMouseOverGrid()) {
                if (this._backpackWindow.startDrag(true)) {
                    this._dragSourceWindow = 'backpack';
                    this._isDragging = true;
                }
            }
        }

        // 更新拖拽精灵显示
        if (this._isDragging) {
            this.updateDragSprite();
        }

        // 结束拖拽
        if (TouchInput.isReleased() && (this._containerWindow._draggingItem || this._backpackWindow._draggingItem)) {
            this.endDragging();
        }

        // 刷新窗口显示（不显示窗口内的拖拽物品，由场景级别的精灵显示）
        if (this._isDragging) {
            this._containerWindow.refresh();
            this._backpackWindow.refresh();
        }
    };

    Scene_Container.prototype.updateDragSprite = function() {
        var dragItem = this._containerWindow._draggingItem || this._backpackWindow._draggingItem;
        if (!dragItem || !this._dragSprite) {
            if (this._dragSprite) {
                this._dragSprite.visible = false;
            }
            if (this._previewSprite) {
                this._previewSprite.visible = false;
            }
            return;
        }

        var sourceWindow = this._dragSourceWindow === 'container' ? this._containerWindow : this._backpackWindow;
        var pos = sourceWindow.getTransformedTouchPos();

        // 使用窗口的缩放后格子大小
        var cellSize = sourceWindow._cellSize;
        var itemWidth = dragItem.getWidth() * cellSize;
        var itemHeight = dragItem.getHeight() * cellSize;

        // 物品跟随鼠标位置
        var px = pos.x - sourceWindow._dragOffsetX * cellSize;
        var py = pos.y - sourceWindow._dragOffsetY * cellSize - sourceWindow._offsetY; // 减去标题偏移

        // 更新精灵位置和大小
        this._dragSprite.x = px - 2;
        this._dragSprite.y = py - 2;

        // 确保bitmap足够大
        var bmpWidth = itemWidth + 10;
        var bmpHeight = itemHeight + 10;
        if (!this._dragSprite.bitmap || this._dragSprite.bitmap.width < bmpWidth || this._dragSprite.bitmap.height < bmpHeight) {
            this._dragSprite.bitmap = new Bitmap(bmpWidth, bmpHeight);
        }

        // 绘制拖拽物品
        this.drawDragItem(dragItem, itemWidth, itemHeight);

        this._dragSprite.visible = true;

        // 绘制放置预览
        this.updatePreviewSprite(dragItem);
    };

    Scene_Container.prototype.updatePreviewSprite = function(dragItem) {
        if (!this._previewSprite || !this._previewSprite.bitmap) return;

        // 清除预览
        this._previewSprite.bitmap.clear();
        this._previewSprite.visible = false;

        if (!dragItem) return;

        var ctx = this._previewSprite.bitmap._context;
        var sourceWindow = this._dragSourceWindow === 'container' ? this._containerWindow : this._backpackWindow;
        var targetWindow = this._dragSourceWindow === 'container' ? this._backpackWindow : this._containerWindow;
        var sourceGrid = this._dragSourceWindow === 'container' ? this._containerGrid : this._backpackGrid;
        var targetGrid = this._dragSourceWindow === 'container' ? this._backpackGrid : this._containerGrid;

        // 使用目标窗口的缩放值
        var cellSize = targetWindow._cellSize;
        var offsetX = targetWindow.getScaledValue(10);
        var offsetY = targetWindow._offsetY;

        // 检查鼠标是否在目标窗口上
        if (targetWindow.isMouseOverGrid()) {
            var cell = targetWindow.getCellFromMouse();
            if (cell) {
                var targetX = cell.x - sourceWindow._dragOffsetX;
                var targetY = cell.y - sourceWindow._dragOffsetY;
                var canPlace = targetGrid.canPlaceAt(targetX, targetY, dragItem.getWidth(), dragItem.getHeight(), null);

                var previewX = targetWindow.x + targetWindow.padding + offsetX + targetX * cellSize;
                var previewY = targetWindow.y + targetWindow.padding + offsetY + targetY * cellSize;
                var previewWidth = dragItem.getWidth() * cellSize - 2;
                var previewHeight = dragItem.getHeight() * cellSize - 2;

                if (ctx) {
                    ctx.strokeStyle = canPlace ? '#66ff66' : '#ff6666';
                    ctx.lineWidth = Math.max(1, Math.floor(2 * this._menuScale));
                    ctx.setLineDash([4, 4]);
                    ctx.strokeRect(previewX, previewY, previewWidth, previewHeight);
                    ctx.setLineDash([]);
                }

                this._previewSprite.visible = true;
            }
        }
        // 检查鼠标是否在源窗口上（同一窗口内移动）
        else if (sourceWindow.isMouseOverGrid()) {
            var cell = sourceWindow.getCellFromMouse();
            if (cell) {
                var targetX = cell.x - sourceWindow._dragOffsetX;
                var targetY = cell.y - sourceWindow._dragOffsetY;
                var canPlace = sourceGrid.canPlaceAt(targetX, targetY, dragItem.getWidth(), dragItem.getHeight(), dragItem);

                // 使用源窗口的缩放值
                var srcCellSize = sourceWindow._cellSize;
                var srcOffsetX = sourceWindow.getScaledValue(10);
                var srcOffsetY = sourceWindow._offsetY;

                var previewX = sourceWindow.x + sourceWindow.padding + srcOffsetX + targetX * srcCellSize;
                var previewY = sourceWindow.y + sourceWindow.padding + srcOffsetY + targetY * srcCellSize;
                var previewWidth = dragItem.getWidth() * srcCellSize - 2;
                var previewHeight = dragItem.getHeight() * srcCellSize - 2;

                if (ctx) {
                    ctx.strokeStyle = canPlace ? '#66ff66' : '#ff6666';
                    ctx.lineWidth = Math.max(1, Math.floor(2 * this._menuScale));
                    ctx.setLineDash([4, 4]);
                    ctx.strokeRect(previewX, previewY, previewWidth, previewHeight);
                    ctx.setLineDash([]);
                }

                this._previewSprite.visible = true;
            }
        }
    };

    Scene_Container.prototype.drawDragItem = function(dragItem, itemWidth, itemHeight) {
        var bitmap = this._dragSprite.bitmap;
        if (!bitmap) return;

        bitmap.clear();
        var ctx = bitmap._context;
        var px = 2;
        var py = 2;
        var scale = this._menuScale || 1;

        // 获取自定义颜色
        var customColor = ESC.ItemAppearance.getColor(dragItem.item);
        var bgColor = customColor || '#3a3a5a';

        // 半透明背景
        var r = parseInt(bgColor.slice(1, 3), 16);
        var g = parseInt(bgColor.slice(3, 5), 16);
        var b = parseInt(bgColor.slice(5, 7), 16);
        bitmap.fillRect(px, py, itemWidth - 4, itemHeight - 4, 'rgba(' + r + ',' + g + ',' + b + ',0.8)');

        // 边框
        if (ctx) {
            ctx.strokeStyle = '#aaaadd';
            ctx.lineWidth = Math.max(1, Math.floor(2 * scale));
            ctx.strokeRect(px, py, itemWidth - 4, itemHeight - 4);
        }

        // 绘制物品图片或图标
        var customImage = ESC.ItemAppearance.getImage(dragItem.item);
        var shouldRotate = dragItem.rotation === 90;

        if (customImage) {
            var itemBitmap = ESC.ItemAppearance.getCachedImage(customImage);
            if (!itemBitmap) {
                itemBitmap = ESC.ItemAppearance.loadImage(customImage);
            }
            if (itemBitmap && itemBitmap.isReady()) {
                if (shouldRotate && ctx) {
                    var cachedCanvas = ESC.ItemAppearance.getCachedCanvas(customImage);
                    if (cachedCanvas) {
                        this.drawDragRotatedFromCanvas(ctx, cachedCanvas, px, py, itemWidth - 4, itemHeight - 4, itemBitmap.width, itemBitmap.height, scale);
                    } else {
                        bitmap.blt(itemBitmap, 0, 0, itemBitmap.width, itemBitmap.height, px + 2, py + 2, itemWidth - 8, itemHeight - 8);
                    }
                } else {
                    bitmap.blt(itemBitmap, 0, 0, itemBitmap.width, itemBitmap.height, px + 2, py + 2, itemWidth - 8, itemHeight - 8);
                }
            } else {
                this.drawDragDefaultIcon(bitmap, ctx, dragItem, px, py, itemWidth - 4, itemHeight - 4, shouldRotate, scale);
            }
        } else {
            this.drawDragDefaultIcon(bitmap, ctx, dragItem, px, py, itemWidth - 4, itemHeight - 4, shouldRotate, scale);
        }
    };

    Scene_Container.prototype.drawDragRotatedFromCanvas = function(ctx, canvas, px, py, width, height, srcWidth, srcHeight, scale) {
        var imgPadding = Math.floor(2 * scale);

        ctx.save();
        var centerX = px + width / 2;
        var centerY = py + height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-centerX, -centerY);
        var drawWidth = height - imgPadding * 2;
        var drawHeight = width - imgPadding * 2;
        var drawX = centerX - drawWidth / 2;
        var drawY = centerY - drawHeight / 2;
        ctx.drawImage(canvas, 0, 0, srcWidth, srcHeight, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
    };

    Scene_Container.prototype.drawDragDefaultIcon = function(bitmap, ctx, bpItem, px, py, width, height, shouldRotate, scale) {
        if (!bpItem.item.iconIndex) return;

        var iconBitmap = ImageManager.loadSystem('IconSet');
        if (!iconBitmap || !iconBitmap.isReady()) return;

        var iconX = (bpItem.item.iconIndex % 16) * 32;
        var iconY = Math.floor(bpItem.item.iconIndex / 16) * 32;
        var iconPadding = Math.floor(4 * scale);

        if (shouldRotate && ctx) {
            ctx.save();
            var centerX = px + width / 2;
            var centerY = py + height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(Math.PI / 2);
            ctx.translate(-centerX, -centerY);
            var drawWidth = height - iconPadding * 2;
            var drawHeight = width - iconPadding * 2;
            var drawX = centerX - drawWidth / 2;
            var drawY = centerY - drawHeight / 2;
            ctx.drawImage(iconBitmap._canvas || iconBitmap.canvas || iconBitmap._image, iconX, iconY, 32, 32, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();
        } else {
            bitmap.blt(iconBitmap, iconX, iconY, 32, 32, px + iconPadding, py + iconPadding, width - iconPadding * 2, height - iconPadding * 2);
        }
    };

    Scene_Container.prototype.endDragging = function() {
        var dragItem = this._containerWindow._draggingItem || this._backpackWindow._draggingItem;
        if (!dragItem) {
            this._dragSourceWindow = null;
            this._isDragging = false;
            if (this._dragSprite) this._dragSprite.visible = false;
            if (this._previewSprite) this._previewSprite.visible = false;
            return;
        }

        var sourceWindow = this._dragSourceWindow === 'container' ? this._containerWindow : this._backpackWindow;
        var targetWindow = this._dragSourceWindow === 'container' ? this._backpackWindow : this._containerWindow;
        var sourceGrid = this._dragSourceWindow === 'container' ? this._containerGrid : this._backpackGrid;
        var targetGrid = this._dragSourceWindow === 'container' ? this._backpackGrid : this._containerGrid;

        // 检查是否在目标窗口上释放
        if (targetWindow.isMouseOverGrid()) {
            var cell = targetWindow.getCellFromMouse();
            if (cell) {
                var newX = cell.x - sourceWindow._dragOffsetX;
                var newY = cell.y - sourceWindow._dragOffsetY;

                // 检查是否可以放置
                if (targetGrid.canPlaceAt(newX, newY, dragItem.getWidth(), dragItem.getHeight(), null)) {
                    // 从源网格移除
                    sourceGrid.removeItem(dragItem);

                    // 更新位置
                    dragItem.x = newX;
                    dragItem.y = newY;

                    // 添加到目标网格
                    targetGrid.items.push(dragItem);
                    targetGrid.placeOnGrid(dragItem);
                }
            }
        } else if (sourceWindow.isMouseOverGrid()) {
            // 在同一窗口内移动
            var cell = sourceWindow.getCellFromMouse();
            if (cell) {
                var newX = cell.x - sourceWindow._dragOffsetX;
                var newY = cell.y - sourceWindow._dragOffsetY;

                sourceGrid.moveItem(dragItem, newX, newY);
            }
        }

        // 清除拖拽状态
        this._containerWindow.clearDrag();
        this._backpackWindow.clearDrag();
        this._dragSourceWindow = null;
        this._isDragging = false;

        // 隐藏拖拽精灵和预览精灵
        if (this._dragSprite) {
            this._dragSprite.visible = false;
        }
        if (this._previewSprite) {
            this._previewSprite.visible = false;
        }

        // 刷新显示
        this._containerWindow.refresh();
        this._backpackWindow.refresh();
    };

    Scene_Container.prototype.rotateHoveredItem = function() {
        // 优先旋转拖拽中的物品，其次旋转悬停的物品
        var dragItem = this._containerWindow._draggingItem || this._backpackWindow._draggingItem;
        var hoverItem = this._containerWindow._hoveredItem || this._backpackWindow._hoveredItem;
        var item = dragItem || hoverItem;

        if (item) {
            item.rotate();
            this._containerWindow.refresh();
            this._backpackWindow.refresh();

            // 如果正在拖拽，更新拖拽精灵
            if (dragItem && this._dragSprite && this._isDragging) {
                this.updateDragSprite();
            }
        }
    };

    Scene_Container.prototype.updateItemInfo = function() {
        if (!this._infoWindow || !this._infoWindow.contents) return;

        // 获取悬停物品
        var item = this._containerWindow._hoveredItem || this._backpackWindow._hoveredItem;

        this._infoWindow.contents.clear();

        // 动态缩放参数
        var scale = this._menuScale || 1;
        var padding = Math.floor((ESC.Scale ? ESC.Scale.scale(8) : 8) * scale);
        var nameSize = Math.floor((ESC.Scale ? ESC.Scale.scaleFont(16) : 16) * Math.sqrt(scale));
        var infoSize = Math.floor((ESC.Scale ? ESC.Scale.scaleFont(12) : 12) * Math.sqrt(scale));

        if (item && item.item) {
            this._infoWindow.contents.fontSize = nameSize;
            this._infoWindow.contents.textColor = '#d0d0e0';
            this._infoWindow.contents.drawText(item.item.name, padding, padding, this._infoWindow.contents.width - padding * 2);

            this._infoWindow.contents.fontSize = infoSize;
            this._infoWindow.contents.textColor = '#8a8aaa';
            var sizeText = '尺寸: ' + item.size.w + 'x' + item.size.h;
            this._infoWindow.contents.drawText(sizeText, padding, padding + nameSize + Math.floor(6 * scale), this._infoWindow.contents.width - padding * 2);

            if (item.item.description) {
                this._infoWindow.contents.textColor = '#a0a0b0';
                this._infoWindow.contents.drawText(item.item.description, padding, padding + nameSize + infoSize + Math.floor(14 * scale), this._infoWindow.contents.width - padding * 2);
            }
        }
    };

    Scene_Container.prototype.applyChanges = function() {
        // 将容器网格的物品同步回容器管理器
        if (this._containerId > 0 && this._containerGrid) {
            ESC.ContainerManager._containerItems[this._containerId] = this._containerGrid.items.slice();
            ESC.ContainerManager._modifiedContainers[this._containerId] = true;
        }

        // 将背包网格的物品同步回背包系统
        if (this._backpackGrid) {
            // 先清空背包
            ESC.Backpack._items = [];
            ESC.Backpack.initGrid();

            // 重新添加物品
            for (var i = 0; i < this._backpackGrid.items.length; i++) {
                var bpItem = this._backpackGrid.items[i];
                ESC.Backpack._items.push(bpItem);
                ESC.Backpack.placeOnGrid(bpItem);
            }
        }
    };

    Scene_Container.prototype.terminate = function() {
        Scene_MenuBase.prototype.terminate.call(this);
    };

    // 静态方法：打开容器
    Scene_Container.open = function(containerId) {
        if (!(SceneManager._scene instanceof Scene_Map)) return;

        // 检查容器是否锁定
        if (ESC.ContainerManager.isContainerLocked(containerId)) {
            var keyName = ESC.ContainerManager.getLockKeyName(containerId);
            if (keyName) {
                $gameMessage.add('这个容器被锁住了。\\C[2]需要 ' + keyName + '\\C[0]才能打开。');
            } else {
                $gameMessage.add('这个容器被锁住了，无法打开。');
            }
            return;
        }

        SceneManager.push(Scene_Container);
        var scene = SceneManager._nextScene;
        if (scene) {
            scene.setContainer(containerId);
        }
    };

    // 暴露到全局
    ESC.Scene_Container = Scene_Container;

    //=============================================================================
    // 地图场景交互检测
    //=============================================================================
    var _ESC_Containers_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _ESC_Containers_Scene_Map_update.call(this);

        // 检测容器交互
        if (this.isBusy()) return;
        if (!$gamePlayer) return;
        if (typeof $gamePlayer.canMove !== 'function') return;
        if (!$gamePlayer.canMove()) return;

        // 确认键触发容器交互
        if (Input.isTriggered('ok') || Input.isTriggered('action')) {
            var container = ESC.ContainerManager.getPlayerNearbyContainer();
            if (container) {
                console.log('[ESC] Player near container: ' + container.name);
                Scene_Container.open(container.id);
            }
        }
    };

    //=============================================================================
    // 存档扩展
    //=============================================================================
    var _ESC_Containers_DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        var contents = _ESC_Containers_DataManager_makeSaveContents.call(this);
        if (!contents.escData) contents.escData = {};
        contents.escData.containers = ESC.ContainerManager.saveData();
        return contents;
    };

    var _ESC_Containers_DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _ESC_Containers_DataManager_extractSaveContents.call(this, contents);
        if (contents.escData && contents.escData.containers) {
            ESC.ContainerManager.loadData(contents.escData.containers);
        }
    };

    //=============================================================================
    // 插件命令 - 在事件中调用
    //=============================================================================
    // 打开容器命令：ESC_Containers open containerId:3
    PluginManager.registerCommand(pluginName, 'open', function(args) {
        var containerId = Number(args.containerId) || 0;
        if (containerId > 0) {
            Scene_Container.open(containerId);
        }
    });

    // 解锁容器命令：ESC_Containers unlock containerId:3
    PluginManager.registerCommand(pluginName, 'unlock', function(args) {
        var containerId = Number(args.containerId) || 0;
        if (containerId > 0) {
            var container = ESC.ContainerManager.getContainer(containerId);
            if (container) {
                container.isLocked = false;
                ESC.ContainerManager._modifiedContainers[containerId] = true;
                console.log('[ESC] Container ' + containerId + ' unlocked');
            }
        }
    });

    // 锁定容器命令：ESC_Containers lock containerId:3
    PluginManager.registerCommand(pluginName, 'lock', function(args) {
        var containerId = Number(args.containerId) || 0;
        if (containerId > 0) {
            var container = ESC.ContainerManager.getContainer(containerId);
            if (container) {
                container.isLocked = true;
                ESC.ContainerManager._modifiedContainers[containerId] = true;
                console.log('[ESC] Container ' + containerId + ' locked');
            }
        }
    });

    // 添加物品到容器：ESC_Containers addItem containerId:3 itemId:31 x:0 y:0
    PluginManager.registerCommand(pluginName, 'addItem', function(args) {
        var containerId = Number(args.containerId) || 0;
        var itemId = Number(args.itemId) || 0;
        var x = Number(args.x) || 0;
        var y = Number(args.y) || 0;

        if (containerId > 0 && itemId > 0) {
            var item = $dataItems[itemId];
            if (item) {
                var bpItem = new BackpackItem(item, x, y);
                ESC.ContainerManager.addItemToContainer(containerId, bpItem);
                console.log('[ESC] Added item ' + itemId + ' to container ' + containerId);
            }
        }
    });

    //=============================================================================
    // 调试命令
    //=============================================================================
    if (Utils.isOptionValid('test')) {
        window.ESCDebug = window.ESCDebug || {};
        window.ESCDebug.openContainer = function(containerId) {
            Scene_Container.open(containerId);
        };
        window.ESCDebug.listContainers = function() {
            var mapId = $gameMap ? $gameMap.mapId() : 0;
            var containers = ESC.ContainerManager.getSceneContainers();
            console.log('Containers on map ' + mapId + ':');
            for (var i = 0; i < containers.length; i++) {
                var c = containers[i];
                console.log('  [' + c.id + '] ' + c.name + ' (' + c.gridCols + 'x' + c.gridRows + ')');
            }
            return containers;
        };
        window.ESCDebug.getContainer = function(containerId) {
            return ESC.ContainerManager.getContainer(containerId);
        };
    }

    console.log('ESC_Containers loaded successfully');
})();
