//=============================================================================
// ESC_Backpack.js - 逃离千禧年 背包系统
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 背包系统 - 不规则网格、拖拽、快捷栏绑定
@author 2000sEscape Team
@version 1.1.0
@base ESC_Core
@base ESC_UI_HUD

@help
背包系统，包含：
- 不规则网格布局（像逃离塔科夫/背包乱斗）
- 物品有不同尺寸（1x1, 1x2, 2x2, 2x3等）
- 快捷栏绑定（拓印机制）
- 拾取检测（自动寻找连续空格）
- 支持动态分辨率适配

在物品的备注中使用以下标签定义尺寸：
<ESC_size:1x1>   物品尺寸 (1x1, 1x2, 2x1, 2x2, 2x3, 3x2)
<ESC_color:#3a5a7a>  物品在网格中的背景颜色（十六进制）
<ESC_image:filename> 物品在网格中显示的图片（img/items/filename.png）

默认配置：6列x5行=30格背包空间
支持1920x1080分辨率自动缩放

@param gridCols
@text 背包列数
@type number
@default 6

@param gridRows
@text 背包行数
@type number
@default 5

@param cellSize
@text 格子大小(像素) - 基准分辨率下
@type number
@default 48
*/

(function() {
    'use strict';

    var pluginName = 'ESC_Backpack';
    var params = PluginManager.parameters(pluginName);

    window.ESC = window.ESC || {};

    //=============================================================================
    // 配置 - 支持动态缩放
    //=============================================================================
    ESC.BackpackConfig = {
        gridCols: Number(params.gridCols) || 6,
        gridRows: Number(params.gridRows) || 5,
        baseCellSize: Number(params.cellSize) || 48,  // 基准格子大小

        // 获取动态缩放后的格子大小
        getCellSize: function() {
            if (ESC.Scale) {
                return ESC.Scale.scale(this.baseCellSize);
            }
            return this.baseCellSize;
        },

        // 获取缩放比例
        getScale: function() {
            if (ESC.Scale) {
                return ESC.Scale.getScale();
            }
            return 1;
        }
    };

    //=============================================================================
    // 物品尺寸定义
    //=============================================================================
    ESC.ItemSize = {
        // 从物品备注获取尺寸
        get: function(item) {
            if (!item) return { w: 1, h: 1 };

            var note = item.note || '';
            var match = note.match(/<ESC_size:(\d+)x(\d+)>/i);

            if (match) {
                return {
                    w: parseInt(match[1]),
                    h: parseInt(match[2])
                };
            }

            // 默认尺寸
            return { w: 1, h: 1 };
        },

        // 获取物品面积
        getArea: function(item) {
            var size = this.get(item);
            return size.w * size.h;
        }
    };

    //=============================================================================
    // 物品外观定义 - 颜色和图片
    //=============================================================================
    ESC.ItemAppearance = {
        _imageCache: {},  // 图片缓存 (Bitmap对象)
        _canvasCache: {},  // Canvas缓存 (用于旋转绘制)
        _loadingImages: {},  // 正在加载的图片
        _refreshCallback: null,  // 图片加载完成后的刷新回调

        // 设置刷新回调
        setRefreshCallback: function(callback) {
            this._refreshCallback = callback;
        },

        // 从物品备注获取颜色
        getColor: function(item) {
            if (!item) return null;
            var note = item.note || '';
            var match = note.match(/<ESC_color:(#[0-9a-fA-F]{6})>/i);
            if (match) {
                return match[1];
            }
            return null;
        },

        // 从物品备注获取图片文件名
        getImage: function(item) {
            if (!item) return null;
            var note = item.note || '';
            var match = note.match(/<ESC_image:(\S+)>/i);
            if (match) {
                return match[1];
            }
            return null;
        },

        // 从Bitmap创建Canvas缓存（用于旋转绘制）
        createCanvasCache: function(filename, bitmap) {
            if (!bitmap || !bitmap.isReady()) return null;

            try {
                // 尝试从bitmap获取可绘制的源
                var source = null;

                // 方法1: 使用bitmap的内部canvas
                if (bitmap._canvas) {
                    source = bitmap._canvas;
                }
                // 方法2: 使用bitmap的canvas属性
                else if (bitmap.canvas) {
                    source = bitmap.canvas;
                }
                // 方法3: 从PixiJS texture获取源图像
                else if (bitmap._baseTexture && bitmap._baseTexture.resource) {
                    source = bitmap._baseTexture.resource.source;
                }

                if (source) {
                    // 创建canvas并绘制图像
                    var canvas = document.createElement('canvas');
                    canvas.width = bitmap.width;
                    canvas.height = bitmap.height;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(source, 0, 0, bitmap.width, bitmap.height);
                    this._canvasCache[filename] = canvas;
                    return canvas;
                }
            } catch (e) {
                console.log('[ESC] Failed to create canvas cache for ' + filename + ':', e);
            }
            return null;
        },

        // 加载物品图片（带缓存）
        loadImage: function(filename) {
            if (!filename) return null;

            // 检查缓存
            if (this._imageCache[filename]) {
                return this._imageCache[filename];
            }

            // 检查是否正在加载
            if (this._loadingImages[filename]) {
                return this._loadingImages[filename];
            }

            // 开始加载
            var self = this;
            var path = 'img/items/' + filename + '.png';
            var bitmap = Bitmap.load(path);

            // 标记为正在加载
            this._loadingImages[filename] = bitmap;

            // 监听加载完成
            bitmap.addLoadListener(function() {
                self._imageCache[filename] = bitmap;
                delete self._loadingImages[filename];
                // 创建canvas缓存用于旋转绘制
                self.createCanvasCache(filename, bitmap);
                // 触发刷新回调
                if (self._refreshCallback) {
                    self._refreshCallback();
                }
            });

            return bitmap;
        },

        // 预加载所有背包物品的图片
        preloadBackpackImages: function() {
            var items = ESC.Backpack._items;
            for (var i = 0; i < items.length; i++) {
                var item = items[i].item;
                var imageName = this.getImage(item);
                if (imageName) {
                    this.loadImage(imageName);
                }
            }
        },

        // 获取缓存的图片（如果已加载完成）
        getCachedImage: function(filename) {
            if (!filename) return null;
            return this._imageCache[filename] || null;
        },

        // 获取缓存的Canvas（用于旋转绘制）
        getCachedCanvas: function(filename) {
            if (!filename) return null;
            return this._canvasCache[filename] || null;
        }
    };

    //=============================================================================
    // 背包物品类
    //=============================================================================
    function BackpackItem() {
        this.initialize.apply(this, arguments);
    }

    BackpackItem.prototype.initialize = function(item, x, y) {
        this.item = item;           // 物品数据
        this.x = x || 0;            // 背包位置X
        this.y = y || 0;            // 背包位置Y
        this.rotation = 0;          // 旋转角度 (0 或 90)
        this.size = ESC.ItemSize.get(item);
    };

    // 获取实际尺寸（考虑旋转）
    BackpackItem.prototype.getWidth = function() {
        return this.rotation === 90 ? this.size.h : this.size.w;
    };

    BackpackItem.prototype.getHeight = function() {
        return this.rotation === 90 ? this.size.w : this.size.h;
    };

    // 旋转
    BackpackItem.prototype.rotate = function() {
        this.rotation = this.rotation === 0 ? 90 : 0;
    };

    // 检查位置是否在物品范围内
    BackpackItem.prototype.containsPoint = function(px, py) {
        return px >= this.x && px < this.x + this.getWidth() &&
               py >= this.y && py < this.y + this.getHeight();
    };

    // 转换为保存数据
    BackpackItem.prototype.toJSON = function() {
        return {
            itemId: this.item.id,
            itemType: this.getItemType(),
            x: this.x,
            y: this.y,
            rotation: this.rotation
        };
    };

    BackpackItem.prototype.getItemType = function() {
        if (DataManager.isWeapon(this.item)) return 'weapon';
        if (DataManager.isArmor(this.item)) return 'armor';
        return 'item';
    };

    // 暴露BackpackItem到ESC命名空间，供容器系统使用
    ESC.BackpackItem = BackpackItem;

    //=============================================================================
    // 背包系统
    //=============================================================================
    ESC.Backpack = {
        _items: [],            // BackpackItem数组
        _grid: null,           // 网格缓存
        _quickSlots: [null, null, null, null],  // 快捷栏引用

        // 初始化网格
        initGrid: function() {
            this._grid = [];
            for (var y = 0; y < ESC.BackpackConfig.gridRows; y++) {
                this._grid[y] = [];
                for (var x = 0; x < ESC.BackpackConfig.gridCols; x++) {
                    this._grid[y][x] = null;
                }
            }
        },

        // 获取网格
        getGrid: function() {
            if (!this._grid) this.initGrid();
            return this._grid;
        },

        // 重建网格缓存
        rebuildGrid: function() {
            this.initGrid();
            for (var i = 0; i < this._items.length; i++) {
                this.placeOnGrid(this._items[i]);
            }
        },

        // 在网格上放置物品
        placeOnGrid: function(bpItem) {
            var grid = this.getGrid();
            for (var dy = 0; dy < bpItem.getHeight(); dy++) {
                for (var dx = 0; dx < bpItem.getWidth(); dx++) {
                    var gx = bpItem.x + dx;
                    var gy = bpItem.y + dy;
                    if (gy < grid.length && gx < grid[0].length) {
                        grid[gy][gx] = bpItem;
                    }
                }
            }
        },

        // 从网格移除物品
        removeFromGrid: function(bpItem) {
            var grid = this.getGrid();
            for (var dy = 0; dy < bpItem.getHeight(); dy++) {
                for (var dx = 0; dx < bpItem.getWidth(); dx++) {
                    var gx = bpItem.x + dx;
                    var gy = bpItem.y + dy;
                    if (gy < grid.length && gx < grid[0].length) {
                        if (grid[gy][gx] === bpItem) {
                            grid[gy][gx] = null;
                        }
                    }
                }
            }
        },

        // 检查是否可以放置
        canPlaceAt: function(x, y, width, height, excludeItem) {
            var grid = this.getGrid();
            excludeItem = excludeItem || null;

            // 检查边界
            if (x < 0 || y < 0 ||
                x + width > ESC.BackpackConfig.gridCols ||
                y + height > ESC.BackpackConfig.gridRows) {
                return false;
            }

            // 检查每个格子
            for (var dy = 0; dy < height; dy++) {
                for (var dx = 0; dx < width; dx++) {
                    var cell = grid[y + dy][x + dx];
                    if (cell !== null && cell !== excludeItem) {
                        return false;
                    }
                }
            }

            return true;
        },

        // 查找可放置位置
        findPlacePosition: function(width, height) {
            for (var y = 0; y <= ESC.BackpackConfig.gridRows - height; y++) {
                for (var x = 0; x <= ESC.BackpackConfig.gridCols - width; x++) {
                    if (this.canPlaceAt(x, y, width, height)) {
                        return { x: x, y: y };
                    }
                }
            }
            return null;
        },

        // 添加物品
        addItem: function(item) {
            var size = ESC.ItemSize.get(item);
            var pos = this.findPlacePosition(size.w, size.h);

            if (pos) {
                var bpItem = new BackpackItem(item, pos.x, pos.y);
                this._items.push(bpItem);
                this.placeOnGrid(bpItem);
                return true;
            }

            return false;  // 背包已满
        },

        // 移除物品
        removeItem: function(bpItem) {
            var index = this._items.indexOf(bpItem);
            if (index >= 0) {
                this.removeFromGrid(bpItem);
                this._items.splice(index, 1);

                // 清除快捷栏引用
                for (var i = 0; i < 4; i++) {
                    if (this._quickSlots[i] === bpItem) {
                        this._quickSlots[i] = null;
                        if (ESC.QuickSlots) {
                            ESC.QuickSlots.clearSlot(i);
                        }
                    }
                }

                return bpItem.item;
            }
            return null;
        },

        // 移动物品
        moveItem: function(bpItem, newX, newY) {
            var width = bpItem.getWidth();
            var height = bpItem.getHeight();

            // 检查新位置是否可用
            if (!this.canPlaceAt(newX, newY, width, height, bpItem)) {
                return false;
            }

            // 从旧位置移除
            this.removeFromGrid(bpItem);

            // 更新位置
            bpItem.x = newX;
            bpItem.y = newY;

            // 放到新位置
            this.placeOnGrid(bpItem);

            return true;
        },

        // 旋转物品
        rotateItem: function(bpItem) {
            bpItem.rotate();

            var newWidth = bpItem.getWidth();
            var newHeight = bpItem.getHeight();

            // 检查旋转后是否还在有效位置
            if (!this.canPlaceAt(bpItem.x, bpItem.y, newWidth, newHeight, bpItem)) {
                bpItem.rotate();  // 旋转回去
                return false;
            }

            // 更新网格
            this.rebuildGrid();
            return true;
        },

        // 获取指定位置的物品
        getItemAt: function(x, y) {
            var grid = this.getGrid();
            if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
                return grid[y][x];
            }
            return null;
        },

        // 检查背包是否已满
        isFull: function() {
            var grid = this.getGrid();
            for (var y = 0; y < grid.length; y++) {
                for (var x = 0; x < grid[0].length; x++) {
                    if (grid[y][x] === null) return false;
                }
            }
            return true;
        },

        // 获取剩余空格数
        getEmptySlots: function() {
            var grid = this.getGrid();
            var count = 0;
            for (var y = 0; y < grid.length; y++) {
                for (var x = 0; x < grid[0].length; x++) {
                    if (grid[y][x] === null) count++;
                }
            }
            return count;
        },

        // 获取所有物品
        getAllItems: function() {
            return this._items.map(function(bpItem) { return bpItem.item; });
        },

        // 快捷栏绑定
        bindToQuickSlot: function(bpItem, slotIndex) {
            if (slotIndex >= 0 && slotIndex < 4) {
                this._quickSlots[slotIndex] = bpItem;
                if (ESC.QuickSlots) {
                    ESC.QuickSlots.setSlot(slotIndex, bpItem.item);
                }
                return true;
            }
            return false;
        },

        // 取消快捷栏绑定
        unbindQuickSlot: function(slotIndex) {
            if (slotIndex >= 0 && slotIndex < 4) {
                this._quickSlots[slotIndex] = null;
                if (ESC.QuickSlots) {
                    ESC.QuickSlots.clearSlot(slotIndex);
                }
            }
        },

        // 使用快捷栏物品
        useQuickSlotItem: function(slotIndex) {
            var bpItem = this._quickSlots[slotIndex];
            if (!bpItem) return false;

            var item = bpItem.item;

            // 检查是否可消耗
            if (item.consumable) {
                this.removeItem(bpItem);
            }

            // 应用物品效果
            var actor = $gameParty.leader();
            if (actor) {
                actor.useItem(item);
            }

            return true;
        },

        // 清空背包
        clear: function() {
            this._items = [];
            this._quickSlots = [null, null, null, null];
            this.initGrid();
        },

        // 保存数据
        saveData: function() {
            var self = this;
            return {
                items: this._items.map(function(bpItem) { return bpItem.toJSON(); }),
                quickSlots: this._quickSlots.map(function(bpItem) {
                    if (bpItem) {
                        var idx = self._items.indexOf(bpItem);
                        return idx >= 0 ? idx : null;
                    }
                    return null;
                })
            };
        },

        // 加载数据
        loadData: function(data) {
            this.clear();

            if (!data || !data.items) return;

            // 加载物品
            for (var i = 0; i < data.items.length; i++) {
                var saved = data.items[i];
                var item = null;
                switch (saved.itemType) {
                    case 'weapon':
                        item = $dataWeapons[saved.itemId];
                        break;
                    case 'armor':
                        item = $dataArmors[saved.itemId];
                        break;
                    default:
                        item = $dataItems[saved.itemId];
                }

                if (item) {
                    var bpItem = new BackpackItem(item, saved.x, saved.y);
                    bpItem.rotation = saved.rotation || 0;
                    this._items.push(bpItem);
                    this.placeOnGrid(bpItem);
                }
            }

            // 加载快捷栏引用
            if (data.quickSlots) {
                for (var i = 0; i < 4; i++) {
                    var idx = data.quickSlots[i];
                    if (idx !== null && idx < this._items.length) {
                        this._quickSlots[i] = this._items[idx];
                        if (ESC.QuickSlots) {
                            ESC.QuickSlots.setSlot(i, this._items[idx].item);
                        }
                    }
                }
            }
        }
    };

    //=============================================================================
    // 背包界面窗口 - 使用Window_Base以便更好地控制内容
    //=============================================================================
    function Window_Backpack() {
        this.initialize.apply(this, arguments);
    }

    Window_Backpack.prototype = Object.create(Window_Base.prototype);
    Window_Backpack.prototype.constructor = Window_Backpack;

    Window_Backpack.prototype.initialize = function(rect, menuScale) {
        Window_Base.prototype.initialize.call(this, rect);
        this._menuScale = menuScale || 1;  // 菜单缩放比例（60%限制时可能<1）
        this._draggingItem = null;
        this._hoveredItem = null;
        this._dragOffsetX = 0;
        this._dragOffsetY = 0;
        this._hoveredCell = null;
        // 拖拽视觉反馈相关
        this._originalX = 0;
        this._originalY = 0;
        this._originalRotation = 0;  // 记录原始旋转角度
        this._returningItem = null;
        this._returnStartX = 0;
        this._returnStartY = 0;
        this._returnStartRotation = 0;  // 返回动画起始旋转
        this._returnTargetX = 0;
        this._returnTargetY = 0;
        this._returnTargetRotation = 0;  // 返回动画目标旋转
        this._returnProgress = 0;

        // 设置图片加载完成后的刷新回调
        var self = this;
        ESC.ItemAppearance.setRefreshCallback(function() {
            self.refresh();
        });

        this.refresh();
    };

    // 获取实际使用的格子大小（考虑菜单缩放）
    Window_Backpack.prototype.getCellSize = function() {
        var baseCellSize = ESC.BackpackConfig.getCellSize();  // 分辨率缩放后的格子大小
        return Math.floor(baseCellSize * this._menuScale);
    };

    // 获取实际使用的缩放偏移值
    Window_Backpack.prototype.getScaledValue = function(baseValue) {
        var resolutionScaled = ESC.Scale ? ESC.Scale.scale(baseValue) : baseValue;
        return Math.floor(resolutionScaled * this._menuScale);
    };

    // 获取实际使用的字体大小
    Window_Backpack.prototype.getScaledFont = function(baseFontSize) {
        var resolutionScaled = ESC.Scale ? ESC.Scale.scaleFont(baseFontSize) : baseFontSize;
        return Math.floor(resolutionScaled * Math.sqrt(this._menuScale));
    };

    Window_Backpack.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.updateDragging();
        this.updateHover();
        this.updateReturnAnimation();
    };

    Window_Backpack.prototype.updateReturnAnimation = function() {
        if (this._returningItem) {
            this._returnProgress += 0.15; // 动画速度
            if (this._returnProgress >= 1) {
                // 动画结束
                this._returningItem = null;
                this._returnProgress = 0;
            }
            this.refresh();
        }
    };

    // 获取经过CRT畸变校正的鼠标坐标
    Window_Backpack.prototype.getTransformedTouchPos = function() {
        if (ESC.CRTFilterManager) {
            return ESC.CRTFilterManager.transformTouchInput();
        }
        return { x: TouchInput.x, y: TouchInput.y };
    };

    // 检查触摸是否在网格区域内
    Window_Backpack.prototype.isTouchedInGrid = function() {
        var pos = this.getTransformedTouchPos();
        var cellSize = this.getCellSize();
        var offsetY = this.getScaledValue(50); // 标题区域
        var offsetX = this.getScaledValue(15);
        var gridX = this.x + this.padding + offsetX;
        var gridY = this.y + this.padding + offsetY;
        var gridWidth = ESC.BackpackConfig.gridCols * cellSize;
        var gridHeight = ESC.BackpackConfig.gridRows * cellSize;

        return pos.x >= gridX && pos.x < gridX + gridWidth &&
               pos.y >= gridY && pos.y < gridY + gridHeight;
    };

    Window_Backpack.prototype.updateDragging = function() {
        // 鼠标按下时开始拖拽
        if (TouchInput.isTriggered() && this.isTouchedInGrid()) {
            this.onTouchStart();
        }
        // 鼠标释放时结束拖拽
        if (TouchInput.isReleased() && this._draggingItem) {
            this.onTouchEnd();
        }
        // 拖拽过程中持续刷新显示
        if (this._draggingItem) {
            this.refresh();
        }
    };

    Window_Backpack.prototype.updateHover = function() {
        // 更新悬停状态用于显示物品信息
        // 只在非拖拽状态下更新悬停物品
        if (!this._draggingItem) {
            if (this.isMouseOverGrid()) {
                var cell = this.getCellFromMouse();
                if (cell && cell.x >= 0 && cell.y >= 0 &&
                    cell.x < ESC.BackpackConfig.gridCols &&
                    cell.y < ESC.BackpackConfig.gridRows) {
                    var bpItem = ESC.Backpack.getItemAt(cell.x, cell.y);
                    if (bpItem !== this._hoveredItem) {
                        this._hoveredItem = bpItem;
                    }
                }
            } else {
                // 鼠标移出网格区域时清除悬停
                this._hoveredItem = null;
            }
        }
    };

    // 检查鼠标是否在网格区域内（不需要按下）
    Window_Backpack.prototype.isMouseOverGrid = function() {
        var pos = this.getTransformedTouchPos();
        var cellSize = this.getCellSize();
        var offsetY = this.getScaledValue(50); // 标题区域
        var offsetX = this.getScaledValue(15);
        var gridX = this.x + this.padding + offsetX;
        var gridY = this.y + this.padding + offsetY;
        var gridWidth = ESC.BackpackConfig.gridCols * cellSize;
        var gridHeight = ESC.BackpackConfig.gridRows * cellSize;

        return pos.x >= gridX && pos.x < gridX + gridWidth &&
               pos.y >= gridY && pos.y < gridY + gridHeight;
    };

    // 从鼠标位置获取格子坐标（不需要按下）
    Window_Backpack.prototype.getCellFromMouse = function() {
        var pos = this.getTransformedTouchPos();
        var cellSize = this.getCellSize();
        var offsetY = this.getScaledValue(50); // 标题区域偏移
        var offsetX = this.getScaledValue(15);
        var x = pos.x - this.x - this.padding - offsetX;
        var y = pos.y - this.y - this.padding - offsetY;

        return {
            x: Math.floor(x / cellSize),
            y: Math.floor(y / cellSize)
        };
    };

    Window_Backpack.prototype.onTouchStart = function() {
        var cell = this.getCellFromTouch();
        if (cell) {
            var bpItem = ESC.Backpack.getItemAt(cell.x, cell.y);
            if (bpItem) {
                this._draggingItem = bpItem;
                this._dragOffsetX = cell.x - bpItem.x;
                this._dragOffsetY = cell.y - bpItem.y;
                // 记录原始位置和旋转
                this._originalX = bpItem.x;
                this._originalY = bpItem.y;
                this._originalRotation = bpItem.rotation;
                console.log('[ESC] Started dragging: ' + bpItem.item.name + ' from (' + this._originalX + ',' + this._originalY + ') rotation=' + this._originalRotation);
            }
        }
    };

    Window_Backpack.prototype.onTouchEnd = function() {
        if (this._draggingItem) {
            var bpItem = this._draggingItem;
            var cell = this.getCellFromTouch();
            var currentX = bpItem.x;
            var currentY = bpItem.y;
            var currentRotation = bpItem.rotation;
            var success = true;

            if (cell) {
                var newX = cell.x - this._dragOffsetX;
                var newY = cell.y - this._dragOffsetY;

                // 检查位置或旋转是否有变化
                var hasPositionChanged = (newX !== this._originalX || newY !== this._originalY);
                var hasRotationChanged = (currentRotation !== this._originalRotation);

                if (hasPositionChanged || hasRotationChanged) {
                    // 尝试移动到新位置
                    success = ESC.Backpack.moveItem(bpItem, newX, newY);
                    console.log('[ESC] Move to (' + newX + ',' + newY + ') rotation=' + currentRotation + ': ' + (success ? 'success' : 'failed'));

                    if (!success) {
                        // 移动失败，启动返回动画（包括位置和旋转）
                        this.startReturnAnimation(bpItem, newX, newY, currentRotation, this._originalX, this._originalY, this._originalRotation);
                    }
                }
            }

            this._draggingItem = null;
            this.refresh();
        }
    };

    Window_Backpack.prototype.startReturnAnimation = function(bpItem, fromX, fromY, fromRotation, toX, toY, toRotation) {
        this._returningItem = bpItem;
        this._returnStartX = fromX;
        this._returnStartY = fromY;
        this._returnStartRotation = fromRotation;
        this._returnTargetX = toX;
        this._returnTargetY = toY;
        this._returnTargetRotation = toRotation;
        this._returnProgress = 0;

        // 先设置物品到目标位置和旋转（动画会在绘制时插值）
        bpItem.x = toX;
        bpItem.y = toY;
        bpItem.rotation = toRotation;
        ESC.Backpack.rebuildGrid();
    };

    Window_Backpack.prototype.getCellFromTouch = function() {
        var pos = this.getTransformedTouchPos();
        var cellSize = this.getCellSize();
        var offsetY = this.getScaledValue(50); // 标题区域偏移
        var offsetX = this.getScaledValue(15);
        var x = pos.x - this.x - this.padding - offsetX;
        var y = pos.y - this.y - this.padding - offsetY;

        return {
            x: Math.floor(x / cellSize),
            y: Math.floor(y / cellSize)
        };
    };

    Window_Backpack.prototype.refresh = function() {
        if (!this.contents) return;

        this.contents.clear();

        // 动态缩放字体
        var titleFontSize = this.getScaledFont(24);
        var offsetX = this.getScaledValue(15);

        // 绘制标题 - 使用更大的字体和更亮的颜色
        this.contents.fontSize = titleFontSize;
        this.contents.textColor = '#b0b0d0';
        this.contents.drawText('背包', 0, this.getScaledValue(12), this.contents.width, 'center');

        // 绘制网格
        this.drawGrid();

        // 绘制物品
        this.drawItems();
    };

    Window_Backpack.prototype.drawGrid = function() {
        var cellSize = this.getCellSize();
        var cols = ESC.BackpackConfig.gridCols;
        var rows = ESC.BackpackConfig.gridRows;
        var offsetY = this.getScaledValue(50); // 标题区域
        var offsetX = this.getScaledValue(15);
        var bitmap = this.contents;
        var ctx = bitmap._context;

        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {
                var px = x * cellSize + offsetX;
                var py = y * cellSize + offsetY;

                // 格子背景 - 深灰紫色，与边框有明显对比
                bitmap.fillRect(px, py, cellSize - 2, cellSize - 2, '#1e1e2a');

                // 格子边框 - 更亮的紫灰色
                if (ctx) {
                    ctx.strokeStyle = '#5a5a7a';
                    ctx.lineWidth = Math.max(1, Math.floor(this._menuScale));
                    ctx.strokeRect(px, py, cellSize - 2, cellSize - 2);
                }
            }
        }
    };

    Window_Backpack.prototype.drawItems = function() {
        var cellSize = this.getCellSize();
        var offsetY = this.getScaledValue(50); // 与drawGrid保持一致
        var offsetX = this.getScaledValue(15);
        var bitmap = this.contents;
        var ctx = bitmap._context;
        var items = ESC.Backpack._items;

        for (var i = 0; i < items.length; i++) {
            var bpItem = items[i];

            // 跳过正在拖拽的物品（稍后单独绘制）
            if (bpItem === this._draggingItem) {
                continue;
            }

            // 跳过正在返回动画的物品（单独处理）
            if (bpItem === this._returningItem) {
                continue;
            }

            var px = bpItem.x * cellSize + offsetX + 2;
            var py = bpItem.y * cellSize + offsetY + 2;
            var width = bpItem.getWidth() * cellSize - 6;
            var height = bpItem.getHeight() * cellSize - 6;

            this.drawItemWithBackground(bitmap, ctx, bpItem, px, py, width, height);
        }

        // 绘制正在返回动画的物品
        if (this._returningItem) {
            this.drawReturningItem(bitmap, ctx, cellSize, offsetY);
        }

        // 绘制正在拖拽的物品（跟随鼠标）
        if (this._draggingItem) {
            this.drawDraggingItem(bitmap, ctx, cellSize, offsetY);
        }
    };

    Window_Backpack.prototype.drawItemWithBackground = function(bitmap, ctx, bpItem, px, py, width, height, isDragging) {
        isDragging = isDragging || false;
        var rotation = bpItem.rotation || 0;
        var shouldRotate = rotation === 90;

        // 获取自定义颜色
        var customColor = ESC.ItemAppearance.getColor(bpItem.item);
        var bgColor = customColor || '#3a3a5a';

        // 物品背景
        if (isDragging) {
            var r = parseInt(bgColor.slice(1, 3), 16);
            var g = parseInt(bgColor.slice(3, 5), 16);
            var b = parseInt(bgColor.slice(5, 7), 16);
            bitmap.fillRect(px, py, width, height, 'rgba(' + r + ',' + g + ',' + b + ',0.7)');
        } else {
            bitmap.fillRect(px, py, width, height, bgColor);
        }

        // 物品边框
        if (ctx) {
            ctx.strokeStyle = isDragging ? '#aaaadd' : '#7a7aaa';
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, width, height);
        }

        // 获取自定义图片
        var customImage = ESC.ItemAppearance.getImage(bpItem.item);

        if (customImage) {
            var itemBitmap = ESC.ItemAppearance.getCachedImage(customImage);
            if (!itemBitmap) {
                itemBitmap = ESC.ItemAppearance.loadImage(customImage);
            }
            if (itemBitmap && itemBitmap.isReady()) {
                if (shouldRotate) {
                    // 旋转绘制：优先使用缓存的Canvas
                    var cachedCanvas = ESC.ItemAppearance.getCachedCanvas(customImage);
                    if (cachedCanvas && ctx) {
                        this.drawRotatedFromCanvas(ctx, cachedCanvas, px, py, width, height, itemBitmap.width, itemBitmap.height);
                    } else {
                        // 回退到尝试从bitmap获取源
                        this.drawRotatedImage(bitmap, ctx, itemBitmap, px, py, width, height);
                    }
                } else {
                    bitmap.blt(itemBitmap, 0, 0, itemBitmap.width, itemBitmap.height, px + 2, py + 2, width - 4, height - 4);
                }
            } else {
                this.drawDefaultIcon(bitmap, bpItem, px, py, width, height, shouldRotate);
            }
        } else {
            this.drawDefaultIcon(bitmap, bpItem, px, py, width, height, shouldRotate);
        }
    };

    // 使用缓存的Canvas进行旋转绘制
    Window_Backpack.prototype.drawRotatedFromCanvas = function(ctx, canvas, px, py, width, height, srcWidth, srcHeight) {
        ctx.save();

        // 旋转中心点：道具矩形的几何中心
        var centerX = px + width / 2;
        var centerY = py + height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-centerX, -centerY);

        // 在旋转后的坐标系中绘制图片
        // 旋转90度后，图片的宽高需要交换以匹配新的道具矩形尺寸
        // 绘制尺寸：(height - 4) x (width - 4)
        // 在旋转后的坐标系中，基于中心点计算绘制位置
        var drawWidth = height - 4;
        var drawHeight = width - 4;
        var drawX = centerX - drawWidth / 2;
        var drawY = centerY - drawHeight / 2;
        ctx.drawImage(canvas, 0, 0, srcWidth, srcHeight, drawX, drawY, drawWidth, drawHeight);

        ctx.restore();
    };

    // 旋转绘制图片 - 获取可绘制的画布源
    Window_Backpack.prototype.getDrawableSource = function(itemBitmap) {
        // 尝试多种方式获取可绘制的图像源
        // 1. 首先尝试 _canvas (RPG Maker内部canvas)
        if (itemBitmap._canvas) {
            return itemBitmap._canvas;
        }
        // 2. 尝试 canvas 属性 (公共getter)
        if (itemBitmap.canvas) {
            return itemBitmap.canvas;
        }
        // 3. 尝试 _image (HTML Image元素)
        if (itemBitmap._image) {
            return itemBitmap._image;
        }
        // 4. 创建临时canvas并绘制bitmap内容
        if (itemBitmap.isReady && itemBitmap.isReady()) {
            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = itemBitmap.width;
            tempCanvas.height = itemBitmap.height;
            var tempCtx = tempCanvas.getContext('2d');
            // 使用bitmap的内部绘制方法
            try {
                // 尝试获取bitmap的原始图像数据
                if (itemBitmap._baseTexture && itemBitmap._baseTexture.resource) {
                    var source = itemBitmap._baseTexture.resource.source;
                    if (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement) {
                        tempCtx.drawImage(source, 0, 0);
                        return tempCanvas;
                    }
                }
            } catch (e) {
                console.log('[ESC] Failed to get drawable source:', e);
            }
        }
        return null;
    };

    // 旋转绘制图片
    Window_Backpack.prototype.drawRotatedImage = function(bitmap, ctx, itemBitmap, px, py, width, height) {
        if (!ctx) {
            // 如果没有context，回退到普通绘制
            bitmap.blt(itemBitmap, 0, 0, itemBitmap.width, itemBitmap.height, px + 2, py + 2, width - 4, height - 4);
            return;
        }

        // 获取可绘制的图像源
        var drawSource = this.getDrawableSource(itemBitmap);

        if (!drawSource) {
            // 如果无法获取图像源，使用普通绘制
            bitmap.blt(itemBitmap, 0, 0, itemBitmap.width, itemBitmap.height, px + 2, py + 2, width - 4, height - 4);
            return;
        }

        ctx.save();

        // 旋转中心点：道具矩形的几何中心
        var centerX = px + width / 2;
        var centerY = py + height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-centerX, -centerY);

        // 在旋转后的坐标系中绘制图片
        // 旋转90度后，图片的宽高需要交换以匹配新的道具矩形尺寸
        // 在旋转后的坐标系中，基于中心点计算绘制位置
        var drawWidth = height - 4;
        var drawHeight = width - 4;
        var drawX = centerX - drawWidth / 2;
        var drawY = centerY - drawHeight / 2;
        ctx.drawImage(drawSource, 0, 0, itemBitmap.width, itemBitmap.height, drawX, drawY, drawWidth, drawHeight);

        ctx.restore();
    };

    // 带旋转支持的默认图标绘制
    Window_Backpack.prototype.drawDefaultIcon = function(bitmap, bpItem, px, py, width, height, shouldRotate) {
        if (!bpItem.item.iconIndex) return;

        var iconBitmap = ImageManager.loadSystem('IconSet');
        if (!iconBitmap || !iconBitmap.isReady()) return;

        var iconX = (bpItem.item.iconIndex % 16) * 32;
        var iconY = Math.floor(bpItem.item.iconIndex / 16) * 32;

        if (shouldRotate && bitmap._context) {
            var ctx = bitmap._context;
            // 获取可绘制的图像源
            var drawSource = this.getDrawableSource(iconBitmap);

            if (drawSource) {
                ctx.save();

                // 旋转中心点：道具矩形的几何中心
                var centerX = px + width / 2;
                var centerY = py + height / 2;

                ctx.translate(centerX, centerY);
                ctx.rotate(Math.PI / 2);
                ctx.translate(-centerX, -centerY);

                // 在旋转后的坐标系中绘制图标
                // 旋转90度后，图标的宽高需要交换
                // 在旋转后的坐标系中，基于中心点计算绘制位置
                var drawWidth = height - 8;
                var drawHeight = width - 8;
                var drawX = centerX - drawWidth / 2;
                var drawY = centerY - drawHeight / 2;
                ctx.drawImage(drawSource, iconX, iconY, 32, 32, drawX, drawY, drawWidth, drawHeight);

                ctx.restore();
            } else {
                // 回退到普通绘制
                bitmap.blt(iconBitmap, iconX, iconY, 32, 32, px + 4, py + 4, width - 8, height - 8);
            }
        } else {
            bitmap.blt(iconBitmap, iconX, iconY, 32, 32, px + 4, py + 4, width - 8, height - 8);
        }
    };

    Window_Backpack.prototype.drawDraggingItem = function(bitmap, ctx, cellSize, offsetY) {
        var bpItem = this._draggingItem;
        var offsetX = this.getScaledValue(15);

        // 获取经过CRT校正的鼠标位置
        var pos = this.getTransformedTouchPos();
        var mouseGridX = pos.x - this.x - this.padding - offsetX;
        var mouseGridY = pos.y - this.y - this.padding - offsetY;

        // 以鼠标点击位置为中心计算物品位置
        var px = mouseGridX - this._dragOffsetX * cellSize;
        var py = mouseGridY - this._dragOffsetY * cellSize;

        var width = bpItem.getWidth() * cellSize - 6;
        var height = bpItem.getHeight() * cellSize - 6;

        // 使用统一的绘制方法（带拖拽标记）
        this.drawItemWithBackground(bitmap, ctx, bpItem, px + 2, py + 2, width, height, true);

        // 绘制目标位置预览（半透明）
        var targetCell = this.getCellFromTouch();
        if (targetCell) {
            var targetX = targetCell.x - this._dragOffsetX;
            var targetY = targetCell.y - this._dragOffsetY;
            var canPlace = ESC.Backpack.canPlaceAt(targetX, targetY, bpItem.getWidth(), bpItem.getHeight(), bpItem);

            // 预览框
            var previewPx = targetX * cellSize + offsetX;
            var previewPy = targetY * cellSize + offsetY;
            var previewWidth = bpItem.getWidth() * cellSize - 2;
            var previewHeight = bpItem.getHeight() * cellSize - 2;

            if (ctx) {
                ctx.strokeStyle = canPlace ? '#66ff66' : '#ff6666';
                ctx.lineWidth = Math.max(1, Math.floor(2 * this._menuScale));
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(previewPx, previewPy, previewWidth, previewHeight);
                ctx.setLineDash([]);
            }
        }
    };

    Window_Backpack.prototype.drawReturningItem = function(bitmap, ctx, cellSize, offsetY) {
        var bpItem = this._returningItem;
        var offsetX = this.getScaledValue(15);

        // 使用缓动函数计算当前位置和旋转
        var easeProgress = this.easeOutCubic(this._returnProgress);

        var currentX = this._returnStartX + (this._returnTargetX - this._returnStartX) * easeProgress;
        var currentY = this._returnStartY + (this._returnTargetY - this._returnStartY) * easeProgress;

        // 旋转动画：从起始旋转到目标旋转
        // 由于旋转只有0和90两个值，我们直接显示目标旋转（物品已经恢复到目标状态）
        // 如果需要平滑旋转动画，可以使用canvas的rotate变换

        var px = currentX * cellSize + offsetX + 2;
        var py = currentY * cellSize + offsetY + 2;
        var width = bpItem.getWidth() * cellSize - 6;
        var height = bpItem.getHeight() * cellSize - 6;

        this.drawItemWithBackground(bitmap, ctx, bpItem, px, py, width, height);
    };

    // 缓动函数 - 让返回动画更自然
    Window_Backpack.prototype.easeOutCubic = function(t) {
        return 1 - Math.pow(1 - t, 3);
    };

    //=============================================================================
    // 拾取物品处理
    //=============================================================================
    // 拾取物品时检查背包空间
    var _ESC_Backpack_Game_Party_gainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
        if (amount > 0 && DataManager.isItem(item)) {
            // 尝试添加到自定义背包
            if (!ESC.Backpack.addItem(item)) {
                // 背包已满，显示提示
                $gameMessage.add('\\C[2]背包已满！\\C[0]');
                return;  // 不添加到RPG Maker物品系统
            }
        }

        // 调用原始方法（处理武器/防具或消耗物品）
        _ESC_Backpack_Game_Party_gainItem.call(this, item, amount, includeEquip);
    };

    //=============================================================================
    // 存档扩展 - 使用累加模式
    //=============================================================================
    var _ESC_Backpack_DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        var contents = _ESC_Backpack_DataManager_makeSaveContents.call(this);
        if (!contents.escData) contents.escData = {};
        contents.escData.backpack = ESC.Backpack.saveData();
        return contents;
    };

    var _ESC_Backpack_DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _ESC_Backpack_DataManager_extractSaveContents.call(this, contents);
        if (contents.escData && contents.escData.backpack) {
            ESC.Backpack.loadData(contents.escData.backpack);
        }
    };

    //=============================================================================
    // 调试命令
    //=============================================================================
    if (Utils.isOptionValid('test')) {
        window.ESCDebug = window.ESCDebug || {};
        window.ESCDebug.addItem = function(itemId) {
            var item = $dataItems[itemId];
            if (item) {
                if (ESC.Backpack.addItem(item)) {
                    console.log('Added ' + item.name + ' to backpack');
                } else {
                    console.log('Backpack is full!');
                }
            }
        };
        window.ESCDebug.bpStatus = function() {
            return {
                items: ESC.Backpack._items.length,
                emptySlots: ESC.Backpack.getEmptySlots(),
                isFull: ESC.Backpack.isFull()
            };
        };
        window.ESCDebug.bpClear = function() {
            ESC.Backpack.clear();
            console.log('Backpack cleared');
        };
    }

    //=============================================================================
    // 场景 - 背包界面
    // 注意：CRT滤镜现在由全局容器处理（ESC_VisualEffects.js 中的 GlobalFilterContainer）
    //=============================================================================
    function Scene_Backpack() {
        this.initialize.apply(this, arguments);
    }

    Scene_Backpack.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Backpack.prototype.constructor = Scene_Backpack;

    Scene_Backpack.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_Backpack.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);

        // CRT滤镜现在由全局容器处理，不再需要单独切换滤镜

        this.createBackground();
        this.createBackpackWindow();
        this.createEquipmentWindow();
        this.createInfoWindow();
        this.createHelpText();
    };

    // 背包关闭时不再需要恢复滤镜（由全局容器处理）
    Scene_Backpack.prototype.terminate = function() {
        // 滤镜由全局容器统一处理，无需额外操作
        Scene_MenuBase.prototype.terminate.call(this);
    };

    Scene_Backpack.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);

        // 预加载所有背包物品的图片
        ESC.ItemAppearance.preloadBackpackImages();

        // 刷新所有窗口
        if (this._backpackWindow) {
            this._backpackWindow.refresh();
        }
        if (this._equipmentWindow) {
            this._equipmentWindow.refresh();
        }

        // 绘制帮助文本
        this.drawHelpText();
    };

    Scene_Backpack.prototype.drawHelpText = function() {
        if (this._helpWindow && this._helpWindow.contents) {
            var width = this._helpWindow.contents.width;
            var height = this._helpWindow.contents.height;
            this._helpWindow.contents.clear();
            var fontSize = ESC.Scale ? ESC.Scale.scaleFont(18) : 18;
            this._helpWindow.fontSize = fontSize;
            this._helpWindow.contents.textColor = '#a0a0c0';
            this._helpWindow.contents.drawText('R:旋转(拖拽时可用) | 1-4:快捷栏 | ESC:关闭', 0, (height - fontSize) / 2, width, 'center');
        }
    };

    Scene_Backpack.prototype.createBackground = function() {
        this._backgroundSprite = new Sprite();
        var bgBitmap = SceneManager.backgroundBitmap();
        if (bgBitmap) {
            this._backgroundSprite.bitmap = bgBitmap;
        } else {
            // 如果没有背景快照，创建一个半透明黑色背景
            var bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
            bitmap.fillAll('rgba(0, 0, 0, 0.6)');
            this._backgroundSprite.bitmap = bitmap;
        }
        // 确保背景在窗口层下方
        var windowLayerIndex = this.children.indexOf(this._windowLayer);
        if (windowLayerIndex >= 0) {
            this.addChildAt(this._backgroundSprite, windowLayerIndex);
        } else {
            this.addChildAt(this._backgroundSprite, 0);
        }
    };

    Scene_Backpack.prototype.createBackpackWindow = function() {
        var cellSize = ESC.BackpackConfig.getCellSize();
        var cols = ESC.BackpackConfig.gridCols;
        var rows = ESC.BackpackConfig.gridRows;
        var padding = ESC.Scale ? ESC.Scale.scale(30) : 30;
        var titleHeight = ESC.Scale ? ESC.Scale.scale(60) : 60; // 标题区域高度

        // 背包窗口尺寸
        var bpWidth = cols * cellSize + padding * 2;
        var bpHeight = rows * cellSize + padding * 2 + titleHeight;

        // 右侧面板尺寸 - 根据分辨率缩放
        var sideWidth = ESC.Scale ? ESC.Scale.scale(320) : 320;
        var spacing = ESC.Scale ? ESC.Scale.scale(15) : 15;

        // 菜单最大只占屏幕60%
        var maxMenuWidth = Math.floor(Graphics.boxWidth * 0.6);
        var maxMenuHeight = Math.floor(Graphics.boxHeight * 0.6);

        // 计算总宽度
        var totalWidth = bpWidth + spacing + sideWidth;

        // 如果超出60%，等比缩放
        var scale = 1;
        if (totalWidth > maxMenuWidth) {
            scale = maxMenuWidth / totalWidth;
        }

        // 检查高度是否也超出
        if (bpHeight * scale > maxMenuHeight) {
            scale = maxMenuHeight / bpHeight;
        }

        // 应用缩放
        if (scale < 1) {
            bpWidth = Math.floor(bpWidth * scale);
            bpHeight = Math.floor(bpHeight * scale);
            sideWidth = Math.floor(sideWidth * scale);
            spacing = Math.floor(spacing * scale);
            totalWidth = bpWidth + spacing + sideWidth;
        }

        // 居中显示
        var startX = (Graphics.boxWidth - totalWidth) / 2;
        var startY = (Graphics.boxHeight - bpHeight) / 2;

        // 存储缩放比例供绘制时使用
        this._menuScale = scale;

        // 存储布局信息供其他窗口使用
        this._layout = {
            startX: startX,
            startY: startY,
            bpWidth: bpWidth,
            bpHeight: bpHeight,
            sideWidth: sideWidth,
            spacing: spacing
        };

        var rect = new Rectangle(startX, startY, bpWidth, bpHeight);
        this._backpackWindow = new Window_Backpack(rect, scale);
        this._backpackWindow.show();
        this._backpackWindow.activate();

        this.addWindow(this._backpackWindow);
    };

    Scene_Backpack.prototype.createEquipmentWindow = function() {
        var layout = this._layout;
        var scale = this._menuScale || 1;
        var x = layout.startX + layout.bpWidth + layout.spacing;
        var y = layout.startY;

        // 计算高度：根据实际内容计算（标题区域 + 5个装备槽 + 底部边距）
        var titleHeight = Math.floor((ESC.Scale ? ESC.Scale.scale(50) : 50) * scale);
        var slotHeight = Math.floor((ESC.Scale ? ESC.Scale.scale(50) : 50) * scale);
        var bottomPadding = Math.floor((ESC.Scale ? ESC.Scale.scale(10) : 10) * scale);
        var height = titleHeight + 5 * slotHeight + bottomPadding;

        var rect = new Rectangle(x, y, layout.sideWidth, height);
        this._equipmentWindow = new ESC.Window_Equipment(rect, scale);
        this.addWindow(this._equipmentWindow);
    };

    Scene_Backpack.prototype.createInfoWindow = function() {
        var layout = this._layout;
        var scale = this._menuScale || 1;
        var x = layout.startX + layout.bpWidth + layout.spacing;

        // 使用与createEquipmentWindow相同的高度计算
        var titleHeight = Math.floor((ESC.Scale ? ESC.Scale.scale(50) : 50) * scale);
        var slotHeight = Math.floor((ESC.Scale ? ESC.Scale.scale(50) : 50) * scale);
        var bottomPadding = Math.floor((ESC.Scale ? ESC.Scale.scale(10) : 10) * scale);
        var equipmentHeight = titleHeight + 5 * slotHeight + bottomPadding;

        var infoSpacing = Math.floor((ESC.Scale ? ESC.Scale.scale(10) : 10) * scale);
        var y = layout.startY + equipmentHeight + infoSpacing;
        var height = Math.floor((ESC.Scale ? ESC.Scale.scale(200) : 200) * scale);

        var rect = new Rectangle(x, y, layout.sideWidth, height);
        this._infoWindow = new Window_Base(rect);
        this.addWindow(this._infoWindow);
    };

    Scene_Backpack.prototype.createHelpText = function() {
        var layout = this._layout;
        var scale = this._menuScale || 1;
        var width = layout.bpWidth;
        var height = Math.floor((ESC.Scale ? ESC.Scale.scale(40) : 40) * scale);
        var x = layout.startX;
        var y = layout.startY + layout.bpHeight + Math.floor((ESC.Scale ? ESC.Scale.scale(10) : 10) * scale);

        var rect = new Rectangle(x, y, width, height);
        this._helpWindow = new Window_Base(rect);
        this.addWindow(this._helpWindow);
        // 文本在start()中绘制
    };

    Scene_Backpack.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this);
        if (!this._backpackWindow) return;
        this.updateInput();
        this.updateItemInfo();
    };

    Scene_Backpack.prototype.updateInput = function() {
        if (Input.isTriggered('cancel') || Input.isTriggered('menu')) {
            this.popScene();
            return;
        }

        if (!this._backpackWindow) return;

        // 获取当前选中物品（悬停或拖拽中的）
        var selectedItem = this._backpackWindow._draggingItem || this._backpackWindow._hoveredItem;

        // 旋转物品 (R键或PageUp)
        if (Input.isTriggered('pageup') || Input.isTriggered('rotate')) {
            if (selectedItem) {
                // 如果正在拖拽，直接旋转（不做网格检查，放置时再检查）
                if (this._backpackWindow._draggingItem) {
                    selectedItem.rotate();
                    console.log('[ESC] Rotated dragging item to ' + selectedItem.rotation + '°');
                } else {
                    // 非拖拽状态，使用正常的旋转逻辑（带网格检查）
                    var success = ESC.Backpack.rotateItem(selectedItem);
                    console.log('[ESC] Rotate: ' + (success ? 'success' : 'failed'));
                }
                this._backpackWindow.refresh();
            }
        }

        // 快捷栏绑定 1-4
        for (var i = 0; i < 4; i++) {
            if (Input.isTriggered(String(i + 1))) {
                if (selectedItem) {
                    ESC.Backpack.bindToQuickSlot(selectedItem, i);
                    console.log('[ESC] Bound to slot ' + (i + 1));
                    this._backpackWindow.refresh();
                }
            }
        }
    };

    Scene_Backpack.prototype.updateItemInfo = function() {
        // 安全检查
        if (!this._infoWindow || !this._infoWindow.contents) return;
        if (!this._backpackWindow) return;

        // 优先显示拖拽中的物品，其次显示悬停的物品
        var bpItem = this._backpackWindow._draggingItem || this._backpackWindow._hoveredItem;

        // 先清除内容
        this._infoWindow.contents.clear();

        // 动态缩放参数
        var padding = ESC.Scale ? ESC.Scale.scale(12) : 12;
        var titleSize = ESC.Scale ? ESC.Scale.scaleFont(18) : 18;
        var nameSize = ESC.Scale ? ESC.Scale.scaleFont(20) : 20;
        var infoSize = ESC.Scale ? ESC.Scale.scaleFont(15) : 15;
        var descSize = ESC.Scale ? ESC.Scale.scaleFont(14) : 14;

        if (bpItem && bpItem.item) {
            // 绘制标题
            this._infoWindow.contents.fontSize = titleSize;
            this._infoWindow.contents.textColor = '#9090b0';
            this._infoWindow.contents.drawText('物品信息', padding, padding, this._infoWindow.contents.width - padding * 2);

            // 绘制物品名称
            this._infoWindow.contents.fontSize = nameSize;
            this._infoWindow.contents.textColor = '#d0d0e0';
            var maxNameWidth = this._infoWindow.contents.width - padding * 2;
            var name = bpItem.item.name;
            while (this._infoWindow.contents.measureTextWidth(name) > maxNameWidth && name.length > 1) {
                name = name.slice(0, -1);
            }
            if (name !== bpItem.item.name) name += '...';
            this._infoWindow.contents.drawText(name, padding, padding + titleSize + ESC.Scale.scale(8), maxNameWidth);

            // 绘制尺寸信息
            this._infoWindow.contents.fontSize = infoSize;
            this._infoWindow.contents.textColor = '#8a8aaa';
            var sizeText = '尺寸: ' + bpItem.size.w + 'x' + bpItem.size.h;
            this._infoWindow.contents.drawText(sizeText, padding, padding + titleSize + nameSize + ESC.Scale.scale(16), maxNameWidth);

            // 描述文字
            if (bpItem.item.description) {
                this._infoWindow.contents.fontSize = descSize;
                this._infoWindow.contents.textColor = '#a0a0b0';
                // 简单的文本换行处理
                var desc = bpItem.item.description;
                var maxWidth = this._infoWindow.contents.width - padding * 2;
                var lineHeight = ESC.Scale ? ESC.Scale.scale(18) : 18;
                var y = padding + titleSize + nameSize + infoSize + ESC.Scale.scale(32);
                var words = desc.split('');
                var line = '';
                for (var i = 0; i < words.length; i++) {
                    var testLine = line + words[i];
                    if (this._infoWindow.contents.measureTextWidth(testLine) > maxWidth) {
                        this._infoWindow.contents.drawText(line, padding, y, maxWidth);
                        line = words[i];
                        y += lineHeight;
                        if (y > this._infoWindow.contents.height - padding) break;
                    } else {
                        line = testLine;
                    }
                }
                if (line && y <= this._infoWindow.contents.height - padding) {
                    this._infoWindow.contents.drawText(line, padding, y, maxWidth);
                }
            }
        }
    };

    // 从地图场景调用此方法打开背包
    Scene_Backpack.open = function() {
        if (!(SceneManager._scene instanceof Scene_Map)) return;
        SceneManager.push(Scene_Backpack);
    };

    // 注册场景到全局
    ESC.Scene_Backpack = Scene_Backpack;

    //=============================================================================
    // 禁用RPG Maker默认菜单，用背包系统替换
    //=============================================================================

    // 完全覆盖 callMenu，阻止默认菜单打开
    Scene_Map.prototype.callMenu = function() {
        // 不调用默认菜单，改为打开背包
        console.log('[ESC] callMenu triggered, opening backpack instead...');
        SceneManager.push(Scene_Backpack);
        // 标记菜单已调用，防止重复触发
        $gameTemp.clearDestination();
        console.log('[ESC] SceneManager.push(Scene_Backpack) called');
    };

    // 禁用默认的菜单场景
    var _ESC_Scene_MenuBase_create = Scene_MenuBase.prototype.create;
    Scene_MenuBase.prototype.create = function() {
        // 如果是默认的Scene_Menu，直接返回地图
        if (this instanceof Scene_Menu && !(this instanceof Scene_Backpack)) {
            console.log('[ESC] Default Scene_Menu blocked');
            SceneManager.pop();
            return;
        }
        _ESC_Scene_MenuBase_create.call(this);
    };

    //=============================================================================
    // 从Scene_Map打开背包 - 使用额外的按键检测作为备用
    //=============================================================================
    var _ESC_Backpack_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _ESC_Backpack_Scene_Map_update.call(this);

        // 安全检查
        if (this.isBusy()) return;
        if (!$gamePlayer) return;
        if (typeof $gamePlayer.canMove !== 'function') return;
        if (!$gamePlayer.canMove()) return;

        // B键直接打开背包（备用方式）
        if (Input.isTriggered('backpack')) {
            console.log('[ESC] B key pressed (update), opening backpack...');
            SceneManager.push(Scene_Backpack);
        }
    };

    //=============================================================================
    // 按键映射 - B键和ESC键都映射到背包
    //=============================================================================
    Input.keyMapper[66] = 'backpack';   // B键
    // 注意：ESC键默认是 'escape'，会触发 callMenu

    console.log('ESC_Backpack loaded successfully - Default menu disabled');
})();
