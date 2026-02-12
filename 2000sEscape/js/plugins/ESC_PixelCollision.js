//=============================================================================
// ESC_PixelCollision.js - 逃离千禧年 像素级碰撞检测
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 像素级碰撞检测 - 基于PNG图片大小判定事件触发
@author 2000sEscape Team
@version 1.0.0
@base ESC_Core
@base ESC_Physics

@help
将事件触发规则从格子判定改为基于PNG图片像素大小的判定。

功能说明：
- 默认RPG Maker：事件触发基于格子坐标（48x48像素格子）
- 本插件：事件触发基于事件图片的实际像素大小

工作原理：
1. 获取事件精灵的实际图片尺寸（宽度、高度）
2. 获取事件的锚点位置（默认底部中心）
3. 计算事件的实际碰撞框（Bounding Box）
4. 检测玩家与事件碰撞框是否重叠

事件备注标签：
<ESC_hitbox:widthxheight>  - 自定义碰撞框大小（像素）
<ESC_hitboxOffset:x,y>     - 碰撞框偏移量（像素）
<ESC_noPixelCollision>     - 禁用此事件的像素碰撞（使用原版格子判定）

配置参数：
- triggerDistance: 默认触发距离（当无法获取图片大小时使用）
- playerHitboxScale: 玩家碰撞框缩放比例
- eventHitboxScale: 事件碰撞框缩放比例

@param triggerDistance
@text 默认触发距离(像素)
@type number
@default 32
@min 8
@max 96

@param playerHitboxScale
@text 玩家碰撞框缩放
@type number
@default 0.8
@min 0.5
@max 1.5
@decimals 1

@param eventHitboxScale
@text 事件碰撞框缩放
@type number
@default 0.9
@min 0.5
@max 1.5
@decimals 1

@param enableDebug
@text 启用调试信息
@type boolean
@default false
*/

(function() {
    'use strict';

    var pluginName = 'ESC_PixelCollision';
    var params = PluginManager.parameters(pluginName);

    window.ESC = window.ESC || {};

    //=============================================================================
    // 配置
    //=============================================================================
    ESC.PixelCollisionConfig = {
        triggerDistance: parseInt(params.triggerDistance) || 32,
        playerHitboxScale: parseFloat(params.playerHitboxScale) || 0.8,
        eventHitboxScale: parseFloat(params.eventHitboxScale) || 0.9,
        enableDebug: true  // 临时开启调试
    };

    //=============================================================================
    // 像素碰撞管理器
    //=============================================================================
    ESC.PixelCollision = {
        // 事件碰撞框缓存
        _eventHitboxCache: {},

        // 清除缓存
        clearCache: function() {
            this._eventHitboxCache = {};
        },

        // 获取玩家的像素碰撞框
        getPlayerHitbox: function() {
            if (!$gamePlayer || !$gameMap) return null;

            var tileWidth = $gameMap.tileWidth();
            var tileHeight = $gameMap.tileHeight();

            // 获取玩家的像素位置
            var pixelX, pixelY;
            if ($gamePlayer._pixelX !== undefined && $gamePlayer._pixelY !== undefined) {
                // 使用物理系统的像素坐标
                pixelX = $gamePlayer._pixelX;
                pixelY = $gamePlayer._pixelY;
            } else {
                // 回退到格子坐标
                pixelX = $gamePlayer._x * tileWidth;
                pixelY = $gamePlayer._y * tileHeight;
            }

            var scale = ESC.PixelCollisionConfig.playerHitboxScale;

            // 玩家碰撞框：以玩家中心为基准
            var width = tileWidth * scale;
            var height = tileHeight * scale;

            // 碰撞框居中于玩家
            var hitboxX = pixelX + (tileWidth - width) / 2;
            var hitboxY = pixelY + (tileHeight - height) / 2;

            return {
                x: hitboxX,
                y: hitboxY,
                width: width,
                height: height,
                centerX: hitboxX + width / 2,
                centerY: hitboxY + height / 2,
                // 保存原始位置用于调试
                _pixelX: pixelX,
                _pixelY: pixelY
            };
        },

        // 获取事件的像素碰撞框
        getEventHitbox: function(event) {
            if (!event) return null;

            // 检查是否禁用像素碰撞
            if (this.isNoPixelCollision(event)) {
                return null;
            }

            var eventId = event.eventId ? event.eventId() : event._eventId;
            var cacheKey = eventId + '_' + event._characterName + '_' + event._characterIndex;

            // 检查缓存
            if (this._eventHitboxCache[cacheKey]) {
                var cached = this._eventHitboxCache[cacheKey];
                return this.calculateEventHitboxPosition(event, cached.width, cached.height, cached.offsetX, cached.offsetY);
            }

            // 获取自定义碰撞框
            var customHitbox = this.getCustomHitbox(event);
            if (customHitbox) {
                this._eventHitboxCache[cacheKey] = customHitbox;
                return this.calculateEventHitboxPosition(event, customHitbox.width, customHitbox.height, customHitbox.offsetX, customHitbox.offsetY);
            }

            // 基础格子尺寸
            var tileWidth = $gameMap.tileWidth();
            var tileHeight = $gameMap.tileHeight();
            var scale = ESC.PixelCollisionConfig.eventHitboxScale;

            // 基础碰撞框（格子尺寸）
            var baseWidth = tileWidth * scale;
            var baseHeight = tileHeight * scale;

            // 获取精灵和图片信息
            var spriteInfo = this.getEventSpriteInfo(event);

            // 调试：输出精灵信息
            if (ESC.PixelCollisionConfig.enableDebug) {
                console.log('[PixelCollision] Event ' + eventId + ' spriteInfo:', spriteInfo);
            }

            // 同时使用格子尺寸和图片尺寸，取较大的
            var finalWidth, finalHeight;

            if (spriteInfo && spriteInfo.size && !spriteInfo.isTransparent) {
                var spriteWidth = spriteInfo.size.width * scale;
                var spriteHeight = spriteInfo.size.height * scale;

                // 取较大的尺寸
                finalWidth = Math.max(baseWidth, spriteWidth);
                finalHeight = Math.max(baseHeight, spriteHeight);

                if (ESC.PixelCollisionConfig.enableDebug) {
                    console.log('[PixelCollision] Event ' + eventId + ' hitbox: base=' + baseWidth.toFixed(0) + 'x' + baseHeight.toFixed(0) +
                        ', sprite=' + spriteWidth.toFixed(0) + 'x' + spriteHeight.toFixed(0) +
                        ', final=' + finalWidth.toFixed(0) + 'x' + finalHeight.toFixed(0));
                }
            } else {
                // 没有图片或图片完全透明，使用格子尺寸
                finalWidth = baseWidth;
                finalHeight = baseHeight;

                if (ESC.PixelCollisionConfig.enableDebug) {
                    console.log('[PixelCollision] Event ' + eventId + ' using tile size: ' + finalWidth.toFixed(0) + 'x' + finalHeight.toFixed(0));
                }
            }

            var hitbox = {
                width: finalWidth,
                height: finalHeight,
                offsetX: 0,
                offsetY: 0
            };
            this._eventHitboxCache[cacheKey] = hitbox;

            return this.calculateEventHitboxPosition(event, hitbox.width, hitbox.height, 0, 0);
        },

        // 检查事件是否禁用像素碰撞
        isNoPixelCollision: function(event) {
            if (!event.event) return false;
            var note = event.event().note || '';
            return note.includes('<ESC_noPixelCollision>');
        },

        // 获取自定义碰撞框（从事件备注）
        getCustomHitbox: function(event) {
            if (!event.event) return null;

            var note = event.event().note || '';
            var hitbox = null;

            // 解析 <ESC_hitbox:widthxheight>
            var sizeMatch = note.match(/<ESC_hitbox:(\d+)x(\d+)>/i);
            if (sizeMatch) {
                hitbox = hitbox || {};
                hitbox.width = parseInt(sizeMatch[1]);
                hitbox.height = parseInt(sizeMatch[2]);
            }

            // 解析 <ESC_hitboxOffset:x,y>
            var offsetMatch = note.match(/<ESC_hitboxOffset:(-?\d+),(-?\d+)>/i);
            if (offsetMatch) {
                hitbox = hitbox || {};
                hitbox.offsetX = parseInt(offsetMatch[1]);
                hitbox.offsetY = parseInt(offsetMatch[2]);
            }

            if (hitbox) {
                hitbox.width = (hitbox.width || ESC.PixelCollisionConfig.triggerDistance) * ESC.PixelCollisionConfig.eventHitboxScale;
                hitbox.height = (hitbox.height || ESC.PixelCollisionConfig.triggerDistance) * ESC.PixelCollisionConfig.eventHitboxScale;
                hitbox.offsetX = hitbox.offsetX || 0;
                hitbox.offsetY = hitbox.offsetY || 0;
            }

            return hitbox;
        },

        // 检查图片是否完全透明
        isBitmapFullyTransparent: function(bitmap) {
            if (!bitmap || !bitmap.isReady()) return true;

            try {
                // 获取 canvas 上下文来检查像素
                var canvas = bitmap._canvas || bitmap._image;
                if (!canvas) return true;

                // 创建临时 canvas 来读取像素数据
                var tempCanvas = document.createElement('canvas');
                var tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = bitmap.width;
                tempCanvas.height = bitmap.height;
                tempCtx.drawImage(canvas instanceof HTMLCanvasElement ? canvas : bitmap._image, 0, 0);

                var imageData = tempCtx.getImageData(0, 0, bitmap.width, bitmap.height);
                var data = imageData.data;

                // 检查每个像素的 alpha 值
                // 如果所有像素的 alpha 都是 0，则图片完全透明
                for (var i = 3; i < data.length; i += 4) {
                    if (data[i] > 0) {
                        return false; // 发现非透明像素
                    }
                }
                return true; // 所有像素都是透明的
            } catch (e) {
                // 跨域或其他错误，假设不是完全透明
                if (ESC.PixelCollisionConfig.enableDebug) {
                    console.log('[PixelCollision] Error checking transparency:', e);
                }
                return false;
            }
        },

        // 获取事件精灵信息（包括大小和透明度）
        getEventSpriteInfo: function(event) {
            // 尝试从场景获取精灵
            if (SceneManager._scene && SceneManager._scene._spriteset) {
                var sprites = SceneManager._scene._spriteset._characterSprites;
                if (sprites) {
                    for (var i = 0; i < sprites.length; i++) {
                        var sprite = sprites[i];
                        if (sprite && sprite._character === event) {
                            if (sprite.bitmap && sprite.bitmap.isReady()) {
                                // 获取角色的实际显示大小
                                // RPG Maker角色精灵通常每帧是原图的1/3宽和1/4高
                                var charWidth = sprite.bitmap.width / 3;
                                var charHeight = sprite.bitmap.height / 4;

                                // 检查图片是否完全透明
                                var isTransparent = this.isBitmapFullyTransparent(sprite.bitmap);

                                return {
                                    size: { width: charWidth, height: charHeight },
                                    isTransparent: isTransparent,
                                    bitmap: sprite.bitmap
                                };
                            }
                        }
                    }
                }
            }

            // 如果无法获取精灵，但有角色名，返回默认大小
            if (event._characterName) {
                return {
                    size: { width: 48, height: 48 },
                    isTransparent: false, // 有角色名假设不透明
                    bitmap: null
                };
            }

            return null;
        },

        // 获取事件精灵的实际图片大小
        getEventSpriteSize: function(event) {
            // 尝试从场景获取精灵
            if (SceneManager._scene && SceneManager._scene._spriteset) {
                var sprites = SceneManager._scene._spriteset._characterSprites;
                if (sprites) {
                    for (var i = 0; i < sprites.length; i++) {
                        var sprite = sprites[i];
                        if (sprite && sprite._character === event) {
                            if (sprite.bitmap && sprite.bitmap.isReady()) {
                                // 获取角色的实际显示大小
                                // RPG Maker角色精灵通常每帧是原图的1/3宽和1/4高
                                var charWidth = sprite.bitmap.width / 3;
                                var charHeight = sprite.bitmap.height / 4;

                                // 检查图片是否完全透明
                                if (this.isBitmapFullyTransparent(sprite.bitmap)) {
                                    if (ESC.PixelCollisionConfig.enableDebug) {
                                        console.log('[PixelCollision] Event ' + event._eventId + ' has fully transparent image, using tile size');
                                    }
                                    // 返回 null，让调用者使用格子尺寸
                                    return null;
                                }

                                return { width: charWidth, height: charHeight };
                            }
                        }
                    }
                }
            }

            // 如果无法获取精灵，尝试预估大小
            if (event._characterName) {
                // 默认角色精灵大小假设为48x48的3倍宽4倍高 = 144x192
                // 每帧大小 = 48x48
                return { width: 48, height: 48 };
            }

            return null;
        },

        // 计算事件碰撞框的实际位置
        calculateEventHitboxPosition: function(event, width, height, offsetX, offsetY) {
            var tileWidth = $gameMap.tileWidth();
            var tileHeight = $gameMap.tileHeight();

            // 事件的像素位置（格子坐标 * 格子大小）
            var eventPixelX = event._x * tileWidth;
            var eventPixelY = event._y * tileHeight;

            // 碰撞框居中于事件
            var hitboxX = eventPixelX + (tileWidth - width) / 2 + offsetX;
            var hitboxY = eventPixelY + (tileHeight - height) / 2 + offsetY;

            return {
                x: hitboxX,
                y: hitboxY,
                width: width,
                height: height,
                centerX: hitboxX + width / 2,
                centerY: hitboxY + height / 2,
                // 保存原始位置用于调试
                _eventX: event._x,
                _eventY: event._y
            };
        },

        // AABB碰撞检测
        checkAABBCollision: function(boxA, boxB) {
            if (!boxA || !boxB) return false;

            return boxA.x < boxB.x + boxB.width &&
                   boxA.x + boxA.width > boxB.x &&
                   boxA.y < boxB.y + boxB.height &&
                   boxA.y + boxA.height > boxB.y;
        },

        // 检测玩家是否与事件碰撞
        isPlayerCollidingWithEvent: function(event) {
            var playerHitbox = this.getPlayerHitbox();
            var eventHitbox = this.getEventHitbox(event);

            if (!playerHitbox || !eventHitbox) {
                return false;
            }

            var isColliding = this.checkAABBCollision(playerHitbox, eventHitbox);

            // 只在检测到碰撞时输出调试信息
            if (isColliding && ESC.PixelCollisionConfig.enableDebug) {
                var eventName = event.event ? event.event().name : ('Event_' + event._eventId);
                console.log('[PixelCollision] Collision detected with: ' + eventName);
                console.log('  Player hitbox:', playerHitbox);
                console.log('  Event hitbox:', eventHitbox);
            }

            return isColliding;
        },

        // 检测玩家是否在事件触发范围内（用于ActionButton触发）
        isPlayerInEventTriggerRange: function(event, triggerDistance) {
            var playerHitbox = this.getPlayerHitbox();
            if (!playerHitbox) return false;

            var eventHitbox = this.getEventHitbox(event);
            if (!eventHitbox) {
                // 使用格子判定作为后备
                return this.isPlayerAdjacentToEvent(event);
            }

            // 扩展事件碰撞框用于触发检测
            var distance = triggerDistance || ESC.PixelCollisionConfig.triggerDistance;
            var expandedHitbox = {
                x: eventHitbox.x - distance,
                y: eventHitbox.y - distance,
                width: eventHitbox.width + distance * 2,
                height: eventHitbox.height + distance * 2
            };

            return this.checkAABBCollision(playerHitbox, expandedHitbox);
        },

        // 格子相邻检测（后备方案）
        isPlayerAdjacentToEvent: function(event) {
            if (!$gamePlayer) return false;

            var dx = Math.abs($gamePlayer.x - event.x);
            var dy = Math.abs($gamePlayer.y - event.y);

            return (dx <= 1 && dy === 0) || (dx === 0 && dy <= 1);
        },

        // 获取玩家面对方向上的最近事件
        getFacingEvent: function(triggers) {
            if (!$gamePlayer || !$gameMap) return null;

            var playerHitbox = this.getPlayerHitbox();
            if (!playerHitbox) return null;

            var events = $gameMap.events();
            var facingDirection = $gamePlayer.direction();
            var closestEvent = null;
            var closestDistance = Infinity;

            // 触发距离
            var triggerDistance = ESC.PixelCollisionConfig.triggerDistance;

            // 调试
            if (ESC.PixelCollisionConfig.enableDebug && Graphics.frameCount % 60 === 0) {
                console.log('[PixelCollision] getFacingEvent: playerHitbox.centerX=' + playerHitbox.centerX.toFixed(0) +
                    ', centerY=' + playerHitbox.centerY.toFixed(0) + ', direction=' + facingDirection);
            }

            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                if (!event.isTriggerIn(triggers)) continue;

                // 获取事件碰撞框
                var eventHitbox = this.getEventHitbox(event);
                if (!eventHitbox) continue;

                // 扩展事件碰撞框用于触发检测
                var expandedHitbox = {
                    x: eventHitbox.x - triggerDistance,
                    y: eventHitbox.y - triggerDistance,
                    width: eventHitbox.width + triggerDistance * 2,
                    height: eventHitbox.height + triggerDistance * 2
                };

                // 检查玩家是否在扩展碰撞框内
                var inRange = this.checkAABBCollision(playerHitbox, expandedHitbox);
                var inDirection = this.isEventInFacingDirection(playerHitbox, eventHitbox, facingDirection);

                // 调试
                if (ESC.PixelCollisionConfig.enableDebug && Graphics.frameCount % 60 === 0) {
                    var eventName = event.event() ? event.event().name : ('Event_' + event._eventId);
                    console.log('[PixelCollision] getFacingEvent: ' + eventName +
                        ', hitbox=' + eventHitbox.width.toFixed(0) + 'x' + eventHitbox.height.toFixed(0) +
                        ', inRange=' + inRange + ', inDirection=' + inDirection);
                }

                if (inRange && inDirection) {
                    var dist = this.getDistanceBetweenHitboxes(playerHitbox, eventHitbox);
                    if (dist < closestDistance) {
                        closestDistance = dist;
                        closestEvent = event;
                    }
                }
            }

            // 如果没找到，使用格子检测作为后备
            if (!closestEvent) {
                for (var j = 0; j < events.length; j++) {
                    var evt = events[j];
                    if (!evt.isTriggerIn(triggers)) continue;

                    if (this.isEventInFrontOfPlayer(evt)) {
                        var dist = this.getDistanceToEvent(evt);
                        if (dist < closestDistance) {
                            closestDistance = dist;
                            closestEvent = evt;
                        }
                    }
                }
            }

            return closestEvent;
        },

        // 检查事件是否在玩家面对的方向上
        isEventInFacingDirection: function(playerHitbox, eventHitbox, direction) {
            var playerCenterX = playerHitbox.centerX;
            var playerCenterY = playerHitbox.centerY;
            var eventCenterX = eventHitbox.centerX;
            var eventCenterY = eventHitbox.centerY;

            switch (direction) {
                case 2: // 下
                    return eventCenterY >= playerCenterY;
                case 4: // 左
                    return eventCenterX <= playerCenterX;
                case 6: // 右
                    return eventCenterX >= playerCenterX;
                case 8: // 上
                    return eventCenterY <= playerCenterY;
            }
            return true;
        },

        // 检查事件是否在玩家正前方（格子模式的后备方案）
        isEventInFrontOfPlayer: function(event) {
            if (!$gamePlayer) return false;

            var direction = $gamePlayer.direction();
            var x = Math.floor($gamePlayer._x);
            var y = Math.floor($gamePlayer._y);

            switch (direction) {
                case 2: y++; break; // 下
                case 4: x--; break; // 左
                case 6: x++; break; // 右
                case 8: y--; break; // 上
            }

            return event.x === x && event.y === y;
        },

        // 获取到事件的距离
        getDistanceToEvent: function(event) {
            if (!$gamePlayer) return Infinity;
            var dx = $gamePlayer.x - event.x;
            var dy = $gamePlayer.y - event.y;
            return Math.sqrt(dx * dx + dy * dy);
        },

        // 获取两个碰撞框之间的距离
        getDistanceBetweenHitboxes: function(boxA, boxB) {
            var dx = boxA.centerX - boxB.centerX;
            var dy = boxA.centerY - boxB.centerY;
            return Math.sqrt(dx * dx + dy * dy);
        }
    };

    //=============================================================================
    // 在物理移动更新中添加持续碰撞检测
    //=============================================================================

    // 标记是否已经添加了碰撞检测，避免重复
    ESC.PixelCollision._frameChecked = false;

    var _ESC_PixelCollision_Game_Player_updatePhysicsMovement = Game_Player.prototype.updatePhysicsMovement;
    Game_Player.prototype.updatePhysicsMovement = function() {
        // 检查原始方法是否存在
        if (_ESC_PixelCollision_Game_Player_updatePhysicsMovement) {
            _ESC_PixelCollision_Game_Player_updatePhysicsMovement.call(this);
        }

        // 每帧检查与 PlayerTouch (1) 和 EventTouch (2) 事件的碰撞
        // 使用标记避免重复检测
        if ($gameMap && !ESC.PixelCollision._frameChecked) {
            ESC.PixelCollision._frameChecked = true;
            this.checkEventTriggerHere([1, 2]);
        }
    };

    // 在帧结束时重置标记
    var _ESC_PixelCollision_Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        ESC.PixelCollision._frameChecked = false;
        _ESC_PixelCollision_Scene_Map_update.call(this);
    };

    //=============================================================================
    // 覆盖 Game_Player 的事件触发检测
    //=============================================================================

    // 保存原版方法
    var _ESC_PixelCollision_Game_Player_checkEventTriggerHere = Game_Player.prototype.checkEventTriggerHere;
    var _ESC_PixelCollision_Game_Player_checkEventTriggerThere = Game_Player.prototype.checkEventTriggerThere;

    // 检查当前位置的事件（PlayerTouch / EventTouch 触发）
    // 像素碰撞 + 格子碰撞同时生效，所有优先级都可触发
    Game_Player.prototype.checkEventTriggerHere = function(triggers) {
        if (!$gameMap) return;

        // 获取所有事件
        var events = $gameMap.events();

        // 玩家的格子坐标（取整，因为物理系统可能产生浮点数）
        var playerTileX = Math.floor(this._x);
        var playerTileY = Math.floor(this._y);

        // 每60帧输出一次调试
        if (ESC.PixelCollisionConfig.enableDebug && Graphics.frameCount % 60 === 0) {
            console.log('[PixelCollision] Player tile: (' + playerTileX + ', ' + playerTileY + '), events count: ' + events.length);
        }

        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var triggerMatch = event.isTriggerIn(triggers);

            // 每60帧输出事件信息
            if (ESC.PixelCollisionConfig.enableDebug && Graphics.frameCount % 60 === 0) {
                var eventName = event.event() ? event.event().name : ('Event_' + event._eventId);
                console.log('[PixelCollision] Event: ' + eventName +
                    ', pos: (' + event.x + ', ' + event.y + ')' +
                    ', trigger: ' + event._trigger +
                    ', triggerMatch: ' + triggerMatch);
            }

            if (triggerMatch) {
                // 1. 像素碰撞检测
                var pixelCollision = ESC.PixelCollision.isPlayerCollidingWithEvent(event);

                // 2. 格子碰撞检测（玩家和事件在同一格子，取整比较）
                var tileCollision = (event.x === playerTileX && event.y === playerTileY);

                // 每60帧输出碰撞结果
                if (ESC.PixelCollisionConfig.enableDebug && Graphics.frameCount % 60 === 0) {
                    console.log('[PixelCollision]   pixelCollision: ' + pixelCollision + ', tileCollision: ' + tileCollision);
                }

                // 任一碰撞检测通过就触发
                if (pixelCollision || tileCollision) {
                    event.start();
                }
            }
        }
    };

    // 检查面前的事件（ActionButton 触发）
    Game_Player.prototype.checkEventTriggerThere = function(triggers) {
        if (!$gameMap) return;

        if (ESC.PixelCollisionConfig.enableDebug) {
            console.log('[PixelCollision] checkEventTriggerThere, triggers:', triggers);
        }

        // 使用像素碰撞获取面对方向的最近事件
        var event = ESC.PixelCollision.getFacingEvent(triggers);

        if (event) {
            event.start();
            if (ESC.PixelCollisionConfig.enableDebug) {
                console.log('[PixelCollision] Triggered event (there):', event.event().name);
            }
            return;
        }

        // 检查面前是否有计数器地形
        var direction = this.direction();
        var x2 = $gameMap.roundXWithDirection(this.x, direction);
        var y2 = $gameMap.roundYWithDirection(this.y, direction);

        if ($gameMap.isCounter(x2, y2)) {
            var x3 = $gameMap.roundXWithDirection(x2, direction);
            var y3 = $gameMap.roundYWithDirection(y2, direction);

            // 在计数器后面查找事件
            var events = $gameMap.eventsXy(x3, y3);
            for (var i = 0; i < events.length; i++) {
                var evt = events[i];
                if (evt.isTriggerIn(triggers) && evt.isNormalPriority()) {
                    evt.start();
                    return;
                }
            }
        }
    };

    //=============================================================================
    // 覆盖 Game_Event 的碰撞检测
    //=============================================================================

    var _ESC_PixelCollision_Game_Event_isCollidedWithPlayer = Game_Event.prototype.isCollidedWithPlayer;

    Game_Event.prototype.isCollidedWithPlayer = function(x, y) {
        // 使用像素碰撞检测
        if (ESC.PixelCollision.isPlayerCollidingWithEvent(this)) {
            return true;
        }

        // 后备：使用原版格子检测
        return _ESC_PixelCollision_Game_Event_isCollidedWithPlayer.call(this, x, y);
    };

    //=============================================================================
    // 地图切换时清除缓存
    //=============================================================================

    var _ESC_PixelCollision_Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        ESC.PixelCollision.clearCache();
        _ESC_PixelCollision_Game_Map_setup.call(this, mapId);
    };

    //=============================================================================
    // 调试功能
    //=============================================================================
    if (Utils.isOptionValid('test')) {
        window.ESCDebug = window.ESCDebug || {};
        window.ESCDebug.pixelCollision = {
            // 获取玩家碰撞框信息
            playerHitbox: function() {
                var hitbox = ESC.PixelCollision.getPlayerHitbox();
                console.log('Player hitbox:', hitbox);
                return hitbox;
            },

            // 获取事件碰撞框信息
            eventHitbox: function(eventId) {
                var event = $gameMap.event(eventId);
                if (!event) {
                    console.log('Event not found:', eventId);
                    return null;
                }
                var hitbox = ESC.PixelCollision.getEventHitbox(event);
                console.log('Event ' + eventId + ' hitbox:', hitbox);
                return hitbox;
            },

            // 检查与指定事件的碰撞
            checkCollision: function(eventId) {
                var event = $gameMap.event(eventId);
                if (!event) {
                    console.log('Event not found:', eventId);
                    return false;
                }
                var isColliding = ESC.PixelCollision.isPlayerCollidingWithEvent(event);
                console.log('Collision with event ' + eventId + ':', isColliding);
                return isColliding;
            },

            // 列出所有可触发的事件
            listTriggerableEvents: function() {
                if (!$gameMap) {
                    console.log('No map loaded');
                    return;
                }

                var events = $gameMap.events();
                console.log('=== Triggerable Events ===');

                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    var hitbox = ESC.PixelCollision.getEventHitbox(event);
                    var isColliding = ESC.PixelCollision.isPlayerCollidingWithEvent(event);

                    console.log('Event ' + event.eventId() + ':', {
                        name: event.event() ? event.event().name : 'unknown',
                        trigger: event._trigger,
                        hitbox: hitbox,
                        isColliding: isColliding
                    });
                }
            },

            // 清除缓存
            clearCache: function() {
                ESC.PixelCollision.clearCache();
                console.log('[PixelCollision] Cache cleared');
            },

            // 设置调试模式
            setDebug: function(enabled) {
                ESC.PixelCollisionConfig.enableDebug = enabled;
                console.log('[PixelCollision] Debug mode:', enabled);
            },

            // 获取配置
            config: function() {
                console.log('PixelCollision Config:', ESC.PixelCollisionConfig);
                return ESC.PixelCollisionConfig;
            }
        };
    }

    console.log('ESC_PixelCollision loaded successfully');
    console.log('[PixelCollision] Config: triggerDistance=' + ESC.PixelCollisionConfig.triggerDistance +
        ', playerHitboxScale=' + ESC.PixelCollisionConfig.playerHitboxScale +
        ', eventHitboxScale=' + ESC.PixelCollisionConfig.eventHitboxScale);
})();
