//=============================================================================
// ESC_Physics.js - 逃离千禧年 物理/重力系统
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 物理系统 - 横版平台跳跃移动
@author 2000sEscape Team
@version 2.0.0
@base ESC_Core

@help
横版平台跳跃物理系统：
- 左右方向键：水平移动
- 上方向键/空格键：跳跃
- 自动重力下落
- 站立在墙壁格子的上边缘
- 支持3帧行走动画（RPG Maker默认规则）

地面检测逻辑：
- 不可通行的格子 = 墙壁
- 玩家脚底在墙壁格子的上边缘 = 站在地面上
- 玩家站在墙壁上方，脚底刚好在墙壁的上边缘

坐标系统：
- pixelY = 玩家顶部的像素坐标
- footPixelY = pixelY + tileHeight = 玩家脚底的像素坐标
- 当 footPixelY = ty * tileHeight 时，脚底在格子ty的上边缘
- 如果格子ty是墙壁，玩家就站在地面上

操作说明：
- ←→：左右移动
- ↓：下蹲（按住下蹲，松开站立）
- ↑ 或 空格/Z：跳跃
- 玩家会受重力影响自动下落
- 玩家会站在墙壁的上边缘
- 下蹲时无法移动或跳跃

行走动画：
- 使用RPG Maker默认的3帧行走模式
- 动画顺序：1(中) -> 0(左脚) -> 1(中) -> 2(右脚) -> 1(中)...
- 停止时自动回到中间帧（站立姿势）

跳跃动画：
- 跳跃时切换到角色精灵的第4行（向上方向，direction 8）
- 循环播放3帧动画：0 -> 1 -> 2 -> 0...
- 向右跳跃：正常显示第4行动画
- 向左跳跃：水平翻转显示第4行动画
- 落地后恢复跳跃前的朝向

下蹲动画：
- 下蹲时切换到角色精灵的第1行（向下方向，direction 2）
- 循环播放3帧动画：0 -> 1 -> 2 -> 0...
- 朝向保持按下蹲开始时的朝向
- 松开下蹲键后恢复站立

调试命令（测试模式）：
- ESCDebug.physics.status()    - 查看物理状态
- ESCDebug.physics.diagnose()  - 详细诊断
- ESCDebug.physics.reinit()    - 重新初始化物理

脚本调用：
- ESC.Physics.setEnabled(true/false)  - 启用/禁用物理
- $gamePlayer.jumpPhysics()           - 强制跳跃
- ESC.PhysicsConfig.gravity = 0.8     - 设置重力
- ESC.PhysicsConfig.jumpPower = 10    - 设置跳跃力度
- ESC.PhysicsConfig.moveSpeed = 4     - 设置移动速度
- ESC.PhysicsConfig.walkAnimationSpeed = 10  - 设置行走动画速度
- ESC.PhysicsConfig.crouchAnimationSpeed = 10  - 设置下蹲动画速度

@param gravity
@text 重力加速度(像素/帧²)
@type number
@default 0.5
@min 0.1
@max 2
@decimals 1

@param jumpPower
@text 跳跃力度(像素/帧)
@type number
@default 8
@min 1
@max 20
@decimals 0

@param maxFallSpeed
@text 最大下落速度(像素/帧)
@type number
@default 10
@min 1
@max 30
@decimals 0

@param moveSpeed
@text 水平移动速度(像素/帧)
@type number
@default 3
@min 1
@max 8
@decimals 0

@param walkAnimationSpeed
@text 行走动画速度(帧数间隔)
@type number
@default 12
@min 4
@max 30
@decimals 0
@help 数值越小动画越快，默认12帧切换一次

@param jumpAnimationSpeed
@text 跳跃动画速度(帧数间隔)
@type number
@default 8
@min 4
@max 30
@decimals 0
@help 数值越小动画越快，默认8帧切换一次

@param crouchAnimationSpeed
@text 下蹲动画速度(帧数间隔)
@type number
@default 12
@min 4
@max 30
@decimals 0
@help 数值越小动画越快，默认12帧切换一次

@param enableDebug
@text 启用调试信息
@type boolean
@default false
*/

(function() {
    'use strict';

    var pluginName = 'ESC_Physics';
    var params = PluginManager.parameters(pluginName);

    window.ESC = window.ESC || {};

    //=============================================================================
    // 配置
    //=============================================================================
    ESC.PhysicsConfig = {
        gravity: parseFloat(params.gravity) || 0.5,
        jumpPower: parseFloat(params.jumpPower) || 8,
        maxFallSpeed: parseFloat(params.maxFallSpeed) || 10,
        moveSpeed: parseFloat(params.moveSpeed) || 3,
        walkAnimationSpeed: parseInt(params.walkAnimationSpeed) || 12,
        jumpAnimationSpeed: parseInt(params.jumpAnimationSpeed) || 8,
        crouchAnimationSpeed: parseInt(params.crouchAnimationSpeed) || 12,
        // 临时启用调试以诊断问题
        enableDebug: params.enableDebug === 'true' || true
    };

    //=============================================================================
    // 物理管理器
    //=============================================================================
    ESC.Physics = {
        _enabled: true,  // 默认启用

        setEnabled: function(enabled) {
            this._enabled = enabled;
            if ($gamePlayer) {
                $gamePlayer._physicsEnabled = enabled;
            }
            if (ESC.PhysicsConfig.enableDebug) {
                console.log('[ESC Physics] ' + (enabled ? 'Enabled' : 'Disabled'));
            }
        },

        isEnabled: function() {
            return this._enabled;
        },

        // 检查格子是否是墙壁（不可通行）
        isSolidTile: function(tileX, tileY) {
            var map = $gameMap;
            if (!map) return true;

            // 边界检查
            if (tileX < 0 || tileX >= map.width() || tileY < 0 || tileY >= map.height()) {
                return true; // 地图外视为墙壁
            }

            // 检查通行性 - direction 2 (向下) 检查是否可以向下移动
            return !map.isPassable(tileX, tileY, 2);
        },

        // 检查格子是否是空气（可通行）
        isPassableTile: function(tileX, tileY) {
            return !this.isSolidTile(tileX, tileY);
        },

        // 检查玩家是否站在地面上
        // 地面定义：玩家脚底刚好在墙壁格子的上边缘
        // pixelY 是玩家顶部的像素坐标
        // 玩家高度 = tileHeight，脚底 = pixelY + tileHeight
        // 当脚底 = ty * tileHeight 时，脚底在格子ty的上边缘
        canStandAt: function(pixelX, pixelY) {
            var map = $gameMap;
            if (!map) return false;

            var tileWidth = map.tileWidth();
            var tileHeight = map.tileHeight();

            // 玩家脚底位置（脚底在玩家身体下方，刚好在分界线上）
            var footPixelY = pixelY + tileHeight;
            var footTileX = Math.floor((pixelX + tileWidth / 2) / tileWidth);

            // 关键：脚底在格子ty的上边缘时，Math.floor((ty * tileHeight) / tileHeight) = ty
            // 所以footTileY就是脚底下方紧邻的格子
            // 如果这个格子是墙壁，玩家就站在墙壁上方
            var footTileY = Math.floor(footPixelY / tileHeight);

            // 边界检查 - 如果脚底在地图底部边缘或以下
            if (footTileY >= map.height()) {
                return true; // 地图底部视为有地面
            }

            // 检查脚底紧邻的下方格子是否是墙壁
            // 如果是墙壁，玩家的脚底刚好在墙壁的上边缘，可以站立
            if (this.isSolidTile(footTileX, footTileY)) {
                return true;
            }

            return false;
        },

        // 检查玩家身体是否在墙壁内（用于水平碰撞检测）
        // 玩家身体从 pixelY 到 pixelY + tileHeight - 1（不包含脚底分界线）
        isInsideWall: function(pixelX, pixelY) {
            var map = $gameMap;
            if (!map) return true;

            var tileWidth = map.tileWidth();
            var tileHeight = map.tileHeight();

            // 检查玩家身体的几个关键点（不包含脚底，因为脚底刚好在分界线上）
            var checkPoints = [
                { x: pixelX + tileWidth / 2, y: pixelY + 4 },           // 顶部中心
                { x: pixelX + tileWidth / 2, y: pixelY + tileHeight / 2 }, // 中部中心
                { x: pixelX + tileWidth / 2, y: pixelY + tileHeight - 5 }  // 底部中心（略高于脚底）
            ];

            for (var i = 0; i < checkPoints.length; i++) {
                var tileX = Math.floor(checkPoints[i].x / tileWidth);
                var tileY = Math.floor(checkPoints[i].y / tileHeight);
                if (this.isSolidTile(tileX, tileY)) {
                    return true;
                }
            }

            return false;
        },

        // 检查水平移动是否碰撞
        // 玩家身体从 pixelY 到 pixelY + tileHeight - 1（不包含脚底分界线）
        checkHorizontalCollision: function(pixelX, pixelY, direction) {
            var map = $gameMap;
            if (!map) return false;

            var tileWidth = map.tileWidth();
            var tileHeight = map.tileHeight();

            // 检查玩家身体侧边的几个点（不包含脚底分界线）
            var checkPoints = [];
            if (direction > 0) { // 向右
                var rightX = pixelX + tileWidth - 1;
                checkPoints.push({x: rightX, y: pixelY + 4});
                checkPoints.push({x: rightX, y: pixelY + tileHeight / 2});
                checkPoints.push({x: rightX, y: pixelY + tileHeight - 5});
            } else { // 向左
                var leftX = pixelX;
                checkPoints.push({x: leftX, y: pixelY + 4});
                checkPoints.push({x: leftX, y: pixelY + tileHeight / 2});
                checkPoints.push({x: leftX, y: pixelY + tileHeight - 5});
            }

            for (var i = 0; i < checkPoints.length; i++) {
                var tileX = Math.floor(checkPoints[i].x / tileWidth);
                var tileY = Math.floor(checkPoints[i].y / tileHeight);
                if (this.isSolidTile(tileX, tileY)) {
                    return true; // 碰撞
                }
            }

            return false;
        },

        // 检查垂直向上移动是否碰撞（头顶撞天花板）
        // 玩家头顶在 pixelY 位置，检查头顶上方是否有墙壁
        checkCeilingCollision: function(pixelX, pixelY) {
            var map = $gameMap;
            if (!map) return false;

            var tileWidth = map.tileWidth();
            var tileHeight = map.tileHeight();

            // 玩家头顶上方1像素的位置
            var headTopY = pixelY - 1;

            // 检查头顶的几个点
            var checkPoints = [
                {x: pixelX + 4, y: headTopY},
                {x: pixelX + tileWidth / 2, y: headTopY},
                {x: pixelX + tileWidth - 5, y: headTopY}
            ];

            for (var i = 0; i < checkPoints.length; i++) {
                var tileX = Math.floor(checkPoints[i].x / tileWidth);
                var tileY = Math.floor(checkPoints[i].y / tileHeight);
                if (tileY < 0) continue; // 超出地图顶部
                if (this.isSolidTile(tileX, tileY)) {
                    return true; // 碰撞天花板
                }
            }

            return false;
        },

        // 找到地面位置（从当前位置向下找第一个可站立的格子）
        // 返回玩家应该站立的像素Y坐标（玩家顶部）
        // 玩家脚底刚好在墙壁格子的上边缘
        findGroundY: function(pixelX, pixelY) {
            var map = $gameMap;
            if (!map) return pixelY;

            var tileWidth = map.tileWidth();
            var tileHeight = map.tileHeight();

            // 当前格子坐标（玩家身体中心所在的格子）
            var currentTileX = Math.floor((pixelX + tileWidth / 2) / tileWidth);
            var bodyCenterTileY = Math.floor((pixelY + tileHeight / 2) / tileHeight);

            // 从玩家身体所在的格子开始向下搜索，找到第一个墙壁格子
            for (var ty = bodyCenterTileY; ty < map.height(); ty++) {
                if (this.isSolidTile(currentTileX, ty)) {
                    // 找到墙壁！玩家应该站在墙壁上方
                    // 墙壁上边缘 = ty * tileHeight
                    // 玩家脚底 = 墙壁上边缘
                    // 玩家顶部 = 墙壁上边缘 - tileHeight = (ty - 1) * tileHeight
                    var groundPixelY = (ty - 1) * tileHeight;
                    // 确保不会返回负值
                    if (groundPixelY < 0) {
                        // 玩家在地图最顶部，墙壁在第一行
                        // 这种情况下玩家应该站在 y = 0
                        return 0;
                    }
                    return groundPixelY;
                }
            }

            // 如果没找到墙壁，返回地图底部
            return (map.height() - 2) * tileHeight;
        },

        // 在两个Y位置之间查找地面
        // 检查玩家下落时脚底是否会碰到墙壁的上边缘
        // 返回地面Y坐标（玩家顶部），如果没有找到返回null
        findGroundBetween: function(pixelX, fromPixelY, toPixelY) {
            var map = $gameMap;
            if (!map) return null;

            var tileWidth = map.tileWidth();
            var tileHeight = map.tileHeight();

            var tileX = Math.floor((pixelX + tileWidth / 2) / tileWidth);

            // 玩家脚底的旧位置和新位置
            var fromFootY = fromPixelY + tileHeight;
            var toFootY = toPixelY + tileHeight;

            // 计算脚底所在的格子范围
            // 关键：当 footPixelY = ty * tileHeight 时，脚底在格子ty的上边缘
            // Math.floor((ty * tileHeight) / tileHeight) = ty
            var fromTileY = Math.floor(fromFootY / tileHeight);
            var toTileY = Math.floor(toFootY / tileHeight);

            // 如果没有跨格子，检查是否需要着陆
            if (fromTileY === toTileY) {
                // 在同一个格子内移动，检查这个格子是否是墙壁
                // 如果是墙壁且脚底已经到达或超过这个格子的上边缘，应该着陆
                if (this.isSolidTile(tileX, toTileY)) {
                    var tileTopY = toTileY * tileHeight;
                    // 检查脚底是否已经到达墙壁的上边缘
                    if (toFootY >= tileTopY) {
                        var groundPixelY = tileTopY - tileHeight;
                        if (groundPixelY >= 0 && groundPixelY >= fromPixelY) {
                            return groundPixelY;
                        }
                    }
                }
                return null;
            }

            // 跨格子移动，检查穿过的每个格子
            for (var ty = fromTileY; ty <= toTileY && ty < map.height(); ty++) {
                if (this.isSolidTile(tileX, ty)) {
                    // 找到墙壁！
                    // 墙壁上边缘 = ty * tileHeight
                    // 玩家脚底应该在墙壁上边缘，所以玩家顶部 = ty * tileHeight - tileHeight
                    var tileTopY = ty * tileHeight;
                    var groundPixelY = tileTopY - tileHeight;

                    // 确保地面位置在移动范围内且有效
                    if (groundPixelY >= 0 && groundPixelY >= fromPixelY) {
                        return groundPixelY;
                    }
                }
            }

            return null;
        },

        // 检查玩家是否从地面走下（脚下不再是地面）
        checkWalkedOffGround: function(pixelX, pixelY) {
            var map = $gameMap;
            if (!map) return true;

            var tileWidth = map.tileWidth();
            var tileHeight = map.tileHeight();

            // 玩家脚底位置（与canStandAt一致）
            var footPixelY = pixelY + tileHeight;
            var footTileX = Math.floor((pixelX + tileWidth / 2) / tileWidth);
            var footTileY = Math.floor(footPixelY / tileHeight);

            // 如果在地图底部
            if (footTileY >= map.height()) {
                return false; // 仍在地面
            }

            // 检查脚底所在的格子是否还是墙壁
            return !this.isSolidTile(footTileX, footTileY);
        }
    };

    //=============================================================================
    // Game_Player 扩展 - 完全重写移动逻辑
    //=============================================================================
    var _ESC_Physics_Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _ESC_Physics_Game_Player_initMembers.call(this);

        // 物理属性（像素单位）
        this._pixelX = 0;           // 像素X坐标
        this._pixelY = 0;           // 像素Y坐标
        this._velocityX = 0;        // X速度（像素/帧）
        this._velocityY = 0;        // Y速度（像素/帧）
        this._isGrounded = true;    // 是否在地面上
        this._isJumping = false;    // 是否在跳跃中
        this._physicsEnabled = true;
        this._moveDirection = 0;    // 移动方向 -1=左, 0=无, 1=右
        this._facingRight = true;   // 朝向
        this._physicsInitialized = false; // 物理系统是否已初始化

        // 行走动画属性（RPG Maker默认3帧动画）
        this._walkPattern = 1;      // 当前动画帧 (0=左脚, 1=中, 2=右脚)
        this._walkAnimationCount = 0; // 动画计数器
        this._walkAnimationSpeed = 12; // 动画速度（会在首次update时从配置读取）
        this._isMoving = false;     // 是否正在移动（用于动画）
        this._stepToggle = false;   // 步伐切换标记（用于左右脚交替）

        // 跳跃动画属性
        this._preJumpDirection = 6; // 跳跃前的朝向（默认朝右）
        this._jumpPattern = 0;      // 跳跃动画帧 (0, 1, 2循环)
        this._jumpAnimationCount = 0; // 跳跃动画计数器
        this._jumpAnimationSpeed = 8; // 跳跃动画速度（帧数间隔）
        this._jumpFacingRight = true; // 跳跃时的水平朝向（true=向右，false=向左）

        // 下蹲动画属性
        this._isCrouching = false;    // 是否在下蹲
        this._crouchPattern = 0;      // 下蹲动画帧 (0, 1, 2循环)
        this._crouchAnimationCount = 0; // 下蹲动画计数器
        this._crouchAnimationSpeed = 12; // 下蹲动画速度（帧数间隔）
        this._crouchFacingRight = true; // 下蹲时的水平朝向
    };

    Game_Player.prototype.isPhysicsEnabled = function() {
        return this._physicsEnabled && ESC.Physics.isEnabled();
    };

    Game_Player.prototype.isGrounded = function() {
        return this._isGrounded;
    };

    Game_Player.prototype.isJumping = function() {
        return this._isJumping;
    };

    Game_Player.prototype.isCrouching = function() {
        return this._isCrouching;
    };

    // 更新行走动画（RPG Maker默认3帧模式：1 -> 0 -> 1 -> 2 -> 1）
    Game_Player.prototype.updateWalkAnimation = function() {
        // 着地检测：从空中落到地面时恢复非跳跃状态
        // 注意：这个检测必须在 !this._isGrounded 检查之外，否则落地时不会执行
        if (this._isGrounded && this._isJumping) {
            if (ESC.PhysicsConfig.enableDebug) {
                console.log('[ESC Physics] Landing detected! Restoring to standing pose');
            }
            this._isJumping = false;
            this._jumpPattern = 0;
            this._jumpAnimationCount = 0;
            // 恢复站立帧
            this._walkPattern = 1;
            this._walkAnimationCount = 0;
            // 恢复地面行走的精灵行（direction 6 = 右侧行，配合scale.x翻转使用）
            this.setDirection(6);
            // 立即同步到RPG Maker的动画系统，确保显示站立帧
            this._pattern = this._walkPattern;
        }

        // 在空中（跳跃/下落）时使用第4行（向上方向）的3帧动画
        if (!this._isGrounded) {
            // 下蹲状态下落时取消下蹲
            if (this._isCrouching) {
                this._isCrouching = false;
                this._crouchPattern = 0;
                this._crouchAnimationCount = 0;
            }
            // 设置朝向为上（direction 8 = row 3）
            this.setDirection(8);

            // 跳跃动画：循环播放3帧
            this._jumpAnimationCount++;
            if (this._jumpAnimationCount >= this._jumpAnimationSpeed) {
                this._jumpAnimationCount = 0;
                this._jumpPattern = (this._jumpPattern + 1) % 3; // 0 -> 1 -> 2 -> 0...
            }

            // 同步到RPG Maker的动画系统
            this._pattern = this._jumpPattern;
            return;
        }

        // 下蹲动画：使用精灵图最顶上一排（direction 2 = down = row 0）
        // 下蹲动画播放：帧2 -> 帧3 -> 帧1（用户记号），然后固定在帧1
        // 代码索引：1 -> 2 -> 0，然后固定在0
        if (this._isCrouching) {
            // 设置朝向为下（direction 2 = row 0，精灵图最顶上一排）
            this.setDirection(2);

            // 下蹲动画：播放 1 -> 2 -> 0，然后固定在0
            this._crouchAnimationCount++;
            if (this._crouchAnimationCount >= this._crouchAnimationSpeed) {
                this._crouchAnimationCount = 0;
                // 动画序列：1 -> 2 -> 0，固定在0
                if (this._crouchPattern === 1) {
                    this._crouchPattern = 2;  // 帧2 -> 帧3
                } else if (this._crouchPattern === 2) {
                    this._crouchPattern = 0;  // 帧3 -> 帧1，固定
                }
                // 如果已经是0，保持不动
            }

            // 同步到RPG Maker的动画系统
            this._pattern = this._crouchPattern;
            return;
        }

        if (this._isMoving) {
            // 移动中：递增动画计数器
            this._walkAnimationCount++;

            // 达到动画速度阈值时切换帧
            if (this._walkAnimationCount >= this._walkAnimationSpeed) {
                this._walkAnimationCount = 0;
                this.advanceWalkPattern();
            }
        } else {
            // 停止移动：重置到中间帧（站立姿势）
            if (this._walkPattern !== 1) {
                this._walkPattern = 1;
                this._walkAnimationCount = 0;
            }
        }

        // 同步到RPG Maker的动画系统
        this._pattern = this._walkPattern;
    };

    // 推进行走动画帧（按照RPG Maker的顺序：1 -> 0 -> 1 -> 2 -> 1）
    Game_Player.prototype.advanceWalkPattern = function() {
        // RPG Maker的行走帧顺序
        // 帧0 = 左脚向前
        // 帧1 = 双脚并拢（站立/中间）
        // 帧2 = 右脚向前
        // 动画顺序：1(中) -> 0(左) -> 1(中) -> 2(右) -> 1(中)...
        switch (this._walkPattern) {
            case 1: // 中 -> 左脚或右脚（交替）
                this._stepToggle = !this._stepToggle;
                this._walkPattern = this._stepToggle ? 0 : 2;
                break;
            case 0: // 左脚 -> 中
            case 2: // 右脚 -> 中
                this._walkPattern = 1;
                break;
        }
    };

    // 跳跃
    Game_Player.prototype.jumpPhysics = function() {
        if (ESC.PhysicsConfig.enableDebug) {
            console.log('[ESC Physics] Jump attempt: isGrounded=' + this._isGrounded + ', physicsEnabled=' + this._physicsEnabled);
        }

        if (this._isGrounded && this._physicsEnabled) {
            // 保存跳跃前的朝向
            this._preJumpDirection = this.direction();
            // 保存水平朝向（用于跳跃动画的水平翻转）
            this._jumpFacingRight = this._facingRight;

            this._velocityY = -ESC.PhysicsConfig.jumpPower;
            this._isGrounded = false;
            this._isJumping = true;

            // 重置跳跃动画
            this._jumpPattern = 0;
            this._jumpAnimationCount = 0;

            if (ESC.PhysicsConfig.enableDebug) {
                console.log('[ESC Physics] Jump! velocityY=' + this._velocityY + ', preJumpDir=' + this._preJumpDirection + ', facingRight=' + this._jumpFacingRight);
            }
            return true;
        }
        return false;
    };

    //=============================================================================
    // 完全重写 update - 使用自定义物理移动
    //=============================================================================
    var _ESC_Physics_Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function() {
        if (this.isPhysicsEnabled()) {
            this.updatePhysicsMovement();
        } else {
            _ESC_Physics_Game_Player_update.call(this);
        }
    };

    Game_Player.prototype.updatePhysicsMovement = function() {
        var map = $gameMap;
        if (!map) return;

        var tileWidth = map.tileWidth();
        var tileHeight = map.tileHeight();

        // 初始化像素位置（首次运行时从格子坐标转换）
        if (!this._physicsInitialized) {
            this._physicsInitialized = true;
            this._pixelX = this._x * tileWidth;
            this._pixelY = this._y * tileHeight;

            // 初始化时检查是否在地面上，找到正确的地面位置
            var groundY = ESC.Physics.findGroundY(this._pixelX, this._pixelY);
            if (groundY !== null && groundY !== undefined) {
                this._pixelY = groundY;
            }

            // 检查地面状态
            this._isGrounded = ESC.Physics.canStandAt(this._pixelX, this._pixelY);

            // 如果不在地面上，给一个小的下落速度开始物理模拟
            if (!this._isGrounded) {
                this._velocityY = 0.1;
            }

            // 初始化动画速度（从配置读取）
            this._walkAnimationSpeed = ESC.PhysicsConfig.walkAnimationSpeed;
            this._jumpAnimationSpeed = ESC.PhysicsConfig.jumpAnimationSpeed;
            this._crouchAnimationSpeed = ESC.PhysicsConfig.crouchAnimationSpeed;

            if (ESC.PhysicsConfig.enableDebug) {
                console.log('[ESC Physics] Initialized at pixelX=' + this._pixelX + ', pixelY=' + this._pixelY + ', isGrounded=' + this._isGrounded);
            }
        }

        // 检测格子坐标是否被外部修改（如事件传送），同步像素坐标
        var expectedPixelX = this._x * tileWidth;
        var expectedPixelY = this._y * tileHeight;
        var diffX = Math.abs(expectedPixelX - this._pixelX);
        var diffY = Math.abs(expectedPixelY - this._pixelY);

        // 如果差异超过半个格子，说明坐标被外部修改
        if (diffX > tileWidth / 2 || diffY > tileHeight / 2) {
            this._pixelX = expectedPixelX;
            this._pixelY = expectedPixelY;
            this._realX = this._x;
            this._realY = this._y;

            // 重新检查地面状态
            var newGroundY = ESC.Physics.findGroundY(this._pixelX, this._pixelY);
            if (newGroundY !== null && newGroundY !== undefined) {
                this._pixelY = newGroundY;
            }
            this._isGrounded = ESC.Physics.canStandAt(this._pixelX, this._pixelY);
            this._velocityY = 0;

            if (ESC.PhysicsConfig.enableDebug) {
                console.log('[ESC Physics] Position synced from external change: x=' + this._x + ', y=' + this._y + ', pixelX=' + this._pixelX + ', pixelY=' + this._pixelY);
            }
        }

        // ========== 处理输入 ==========
        this._moveDirection = 0;

        // 调试：显示输入状态（每60帧输出一次）
        if (ESC.PhysicsConfig.enableDebug && Graphics.frameCount % 60 === 0) {
            console.log('[ESC Physics] State: canMove=' + this.canMove() + ', isGrounded=' + this._isGrounded + ', isCrouching=' + this._isCrouching + ', downPressed=' + Input.isPressed('down'));
        }

        if (this.canMove()) {
            // 下蹲检测 - 按住"下"键时下蹲，松开站立（仅在地面时）
            if (this._isGrounded) {
                if (Input.isPressed('down')) {
                    // 按住下键 → 下蹲
                    if (!this._isCrouching) {
                        // 刚开始下蹲
                        this._isCrouching = true;
                        this._crouchPattern = 1;  // 从帧2开始（用户记号），动画序列：2→3→1，固定在1
                        this._crouchAnimationCount = 0;
                        // 保存下蹲时的朝向
                        this._crouchFacingRight = this._facingRight;
                        if (ESC.PhysicsConfig.enableDebug) {
                            console.log('[ESC Physics] Started crouching, facingRight=' + this._crouchFacingRight);
                        }
                    }
                } else {
                    // 松开下键 → 站立
                    if (this._isCrouching) {
                        this._isCrouching = false;
                        this._crouchPattern = 0;
                        this._crouchAnimationCount = 0;
                        // 恢复下蹲前的朝向（需要反转，因为下蹲显示逻辑与正常显示逻辑相反）
                        this._facingRight = !this._crouchFacingRight;
                        if (ESC.PhysicsConfig.enableDebug) {
                            console.log('[ESC Physics] Stopped crouching, facingRight=' + this._facingRight);
                        }
                    }
                }
            }

            // 下蹲时禁止移动
            if (!this._isCrouching) {
                // 水平移动
                if (Input.isPressed('left')) {
                    this._moveDirection = -1;
                    this._facingRight = false;
                } else if (Input.isPressed('right')) {
                    this._moveDirection = 1;
                    this._facingRight = true;
                }
            }

            // F键触发事件（ActionButton 触发器）
            if (Input.isTriggered('interact')) {
                this.checkEventTriggerThere([0]);
            }

            // PageUp键跳跃（下蹲时不能跳跃）
            if (Input.isTriggered('pageup') && this._isGrounded && !this._isCrouching) {
                this.jumpPhysics();
            }

            // 上键跳跃（下蹲时不能跳跃）
            if (Input.isTriggered('up') && this._isGrounded && !this._isCrouching) {
                this.jumpPhysics();
            }
        }

        // ========== 应用水平移动 ==========
        var wasMoving = this._isMoving;
        this._isMoving = false;

        if (this._moveDirection !== 0) {
            var newPixelX = this._pixelX + this._moveDirection * ESC.PhysicsConfig.moveSpeed;

            // 检查水平碰撞
            if (!ESC.Physics.checkHorizontalCollision(newPixelX, this._pixelY, this._moveDirection)) {
                this._pixelX = newPixelX;
                this._isMoving = true; // 成功移动了
            }

            // 更新角色朝向 - 统一使用direction 6（右侧行），通过scale.x翻转控制左右
            // 这样可以避免同时使用不同方向的sprite行和scale翻转导致的"双重翻转"问题
            this.setDirection(6);
        }

        // ========== 应用重力 ==========
        if (!this._isGrounded) {
            this._velocityY += ESC.PhysicsConfig.gravity;

            // 限制最大下落速度
            if (this._velocityY > ESC.PhysicsConfig.maxFallSpeed) {
                this._velocityY = ESC.PhysicsConfig.maxFallSpeed;
            }
        }

        // ========== 应用垂直移动 ==========
        var newPixelY = this._pixelY + this._velocityY;

        // 检查向上碰撞（跳跃时）
        if (this._velocityY < 0) {
            if (ESC.Physics.checkCeilingCollision(this._pixelX, newPixelY)) {
                newPixelY = this._pixelY; // 撞到天花板，停止上升
                this._velocityY = 0;
                this._isJumping = false;

                if (ESC.PhysicsConfig.enableDebug) {
                    console.log('[ESC Physics] Hit ceiling');
                }
            }
        }

        // 检查向下碰撞（下落时）
        if (this._velocityY > 0) {
            // 检查是否即将落到地面上
            // 从当前位置到新位置之间检查是否有地面
            var groundY = ESC.Physics.findGroundBetween(this._pixelX, this._pixelY, newPixelY);
            if (groundY !== null) {
                newPixelY = groundY;
                this._velocityY = 0;
                this._isGrounded = true;
                // 注意：不在这里设置 _isJumping = false
                // 让 updateWalkAnimation 中的着地检测来处理动画恢复

                if (ESC.PhysicsConfig.enableDebug) {
                    console.log('[ESC Physics] Landed at pixelY=' + groundY + ', isJumping=' + this._isJumping);
                }
            }
        }

        // 检查是否从平台走下
        if (this._isGrounded && this._velocityY === 0) {
            if (ESC.Physics.checkWalkedOffGround(this._pixelX, this._pixelY)) {
                this._isGrounded = false;
                this._velocityY = 0.1; // 小的初始下落速度

                if (ESC.PhysicsConfig.enableDebug) {
                    console.log('[ESC Physics] Walked off platform');
                }
            }
        }

        // ========== 更新行走动画 ==========
        // 注意：必须在物理检测（落地检测）之后调用，这样着地检测才能正确工作
        this.updateWalkAnimation();

        // ========== 更新位置 ==========
        this._pixelY = newPixelY;

        // 边界检查
        var maxPixelX = (map.width() - 1) * map.tileWidth();
        var maxPixelY = (map.height() - 1) * map.tileHeight();

        this._pixelX = Math.max(0, Math.min(this._pixelX, maxPixelX));
        this._pixelY = Math.max(0, Math.min(this._pixelY, maxPixelY));

        // 同步到RPG Maker的格子坐标系统
        this._x = this._pixelX / map.tileWidth();
        this._y = this._pixelY / map.tileHeight();
        this._realX = this._x;
        this._realY = this._y;

        // 更新屏幕坐标（考虑地图滚动偏移）
        var tileWidth = map.tileWidth();
        var tileHeight = map.tileHeight();
        var displayX = $gameMap.displayX();
        var displayY = $gameMap.displayY();

        // 屏幕坐标 = 像素坐标 - 地图显示偏移(像素)
        this._screenX = this._pixelX - displayX * tileWidth;
        this._screenY = this._pixelY - displayY * tileHeight + tileHeight; // +tileHeight 因为角色原点在底部

        // 更新精灵位置
        if (this._sprite) {
            this._sprite.x = this._screenX;
            this._sprite.y = this._screenY;
        }

        // ========== 摄像机跟随 ==========
        this.updateCameraFollow();
    };

    // 摄像机跟随逻辑 - 玩家接近边缘时才开始滚动
    Game_Player.prototype.updateCameraFollow = function() {
        var map = $gameMap;
        if (!map) return;

        var tileWidth = map.tileWidth();
        var screenWidth = Graphics.boxWidth;
        var mapWidth = map.width();
        var screenTileX = map.screenTileX();

        // 调试信息（每60帧输出一次）
        if (ESC.PhysicsConfig.enableDebug && Graphics.frameCount % 60 === 0) {
            console.log('[ESC Camera] mapWidth=' + mapWidth + ', screenTileX=' + screenTileX.toFixed(1) +
                ', pixelX=' + Math.floor(this._pixelX) + ', screenX=' + Math.floor(this._screenX) +
                ', displayX=' + map.displayX().toFixed(2));
        }

        // 如果地图比屏幕小，不需要滚动
        if (mapWidth <= screenTileX) return;

        // 边缘阈值（像素）- 玩家距离边缘这么近时开始滚动
        var edgeThreshold = 100;

        // 玩家在屏幕上的像素位置
        var screenX = this._screenX;

        // 计算地图最大可滚动位置（格子）
        var maxDisplayX = mapWidth - screenTileX;

        // 水平滚动 - 右边缘
        if (screenX > screenWidth - edgeThreshold) {
            var targetDisplayX = this._realX - (screenWidth - edgeThreshold) / tileWidth;
            targetDisplayX = Math.max(0, Math.min(targetDisplayX, maxDisplayX));

            if (ESC.PhysicsConfig.enableDebug) {
                console.log('[ESC Camera] Scroll RIGHT! screenX=' + Math.floor(screenX) +
                    ', targetDisplayX=' + targetDisplayX.toFixed(2));
            }

            map._displayX = targetDisplayX;
            map._parallaxX = targetDisplayX;
        }
        // 水平滚动 - 左边缘
        else if (screenX < edgeThreshold) {
            var targetDisplayX = this._realX - edgeThreshold / tileWidth;
            targetDisplayX = Math.max(0, Math.min(targetDisplayX, maxDisplayX));

            if (ESC.PhysicsConfig.enableDebug) {
                console.log('[ESC Camera] Scroll LEFT! screenX=' + Math.floor(screenX) +
                    ', targetDisplayX=' + targetDisplayX.toFixed(2));
            }

            map._displayX = targetDisplayX;
            map._parallaxX = targetDisplayX;
        }
    };

    //=============================================================================
    // 禁用原版移动方法
    //=============================================================================
    Game_Player.prototype.moveStraight = function(d) {
        if (this.isPhysicsEnabled()) {
            return; // 物理模式下禁用原版移动
        }
        // 调用父类方法（通过原型链）
        Game_Character.prototype.moveStraight.call(this, d);
    };

    Game_Player.prototype.moveDiagonally = function(horz, vert) {
        if (this.isPhysicsEnabled()) {
            return;
        }
        Game_Character.prototype.moveDiagonally.call(this, horz, vert);
    };

    Game_Player.prototype.jump = function(horz, vert) {
        if (this.isPhysicsEnabled()) {
            return; // 使用我们自己的跳跃
        }
        Game_Character.prototype.jump.call(this, horz, vert);
    };

    //=============================================================================
    // 脚本控制方法 - 可在事件脚本中调用
    //=============================================================================

    /**
     * 强制下蹲
     * 用法: $gamePlayer.forceCrouch()
     */
    Game_Player.prototype.forceCrouch = function() {
        if (!this.isPhysicsEnabled()) return;

        this._isCrouching = true;
        this._crouchPattern = 1;
        this._crouchAnimationCount = 0;
        this._crouchFacingRight = this._facingRight;
        this._moveDirection = 0; // 下蹲时停止移动

        if (ESC.PhysicsConfig.enableDebug) {
            console.log('[ESC Physics] Force crouch, facingRight=' + this._crouchFacingRight);
        }
    };

    /**
     * 强制起身
     * 用法: $gamePlayer.forceStand()
     */
    Game_Player.prototype.forceStand = function() {
        if (!this.isPhysicsEnabled()) return;

        if (this._isCrouching) {
            this._isCrouching = false;
            this._crouchPattern = 0;
            this._crouchAnimationCount = 0;
            // 反转朝向以保持视觉一致（下蹲显示逻辑与正常显示逻辑相反）
            this._facingRight = !this._crouchFacingRight;

            if (ESC.PhysicsConfig.enableDebug) {
                console.log('[ESC Physics] Force stand, facingRight=' + this._facingRight);
            }
        }
    };

    /**
     * 强制跳跃
     * @param {number} power - 跳跃力度（可选，默认12）
     * 用法: $gamePlayer.forceJump()      // 普通跳跃
     *       $gamePlayer.forceJump(16)    // 大跳
     *       $gamePlayer.forceJump(8)     // 小跳
     */
    Game_Player.prototype.forceJump = function(power) {
        if (!this.isPhysicsEnabled()) return;

        power = power || 12; // 默认跳跃力度

        this._velocityY = -power;
        this._isGrounded = false;
        this._isJumping = true;
        this._jumpCount = 1;
        this._jumpFacingRight = this._facingRight;

        // 如果正在下蹲，先起身
        if (this._isCrouching) {
            this._isCrouching = false;
            this._crouchPattern = 0;
        }

        if (ESC.PhysicsConfig.enableDebug) {
            console.log('[ESC Physics] Force jump, power=' + power + ', facingRight=' + this._jumpFacingRight);
        }
    };

    /**
     * 设置移动方向
     * @param {number} direction - 方向 (-1=左, 0=停止, 1=右)
     * 用法: $gamePlayer.forceMove(-1)  // 向左移动
     *       $gamePlayer.forceMove(1)   // 向右移动
     *       $gamePlayer.forceMove(0)   // 停止
     */
    Game_Player.prototype.forceMove = function(direction) {
        if (!this.isPhysicsEnabled()) return;

        this._moveDirection = direction;

        if (direction === 1) {
            this._facingRight = true;
        } else if (direction === -1) {
            this._facingRight = false;
        }

        if (ESC.PhysicsConfig.enableDebug) {
            console.log('[ESC Physics] Force move, direction=' + direction);
        }
    };

    /**
     * 设置朝向
     * @param {boolean} facingRight - true=朝右, false=朝左
     * 用法: $gamePlayer.setFacing(true)   // 朝右
     *       $gamePlayer.setFacing(false)  // 朝左
     */
    Game_Player.prototype.setFacing = function(facingRight) {
        this._facingRight = facingRight;

        if (ESC.PhysicsConfig.enableDebug) {
            console.log('[ESC Physics] Set facing, facingRight=' + facingRight);
        }
    };

    //=============================================================================
    // 更新角色精灵位置
    //=============================================================================
    var _ESC_Physics_Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
    Spriteset_Map.prototype.createCharacters = function() {
        _ESC_Physics_Spriteset_Map_createCharacters.call(this);

        // 找到玩家精灵并保存引用
        if ($gamePlayer && this._characterSprites) {
            for (var i = 0; i < this._characterSprites.length; i++) {
                var sprite = this._characterSprites[i];
                if (sprite && sprite._character === $gamePlayer) {
                    $gamePlayer._sprite = sprite;
                    break;
                }
            }
        }
    };

    //=============================================================================
    // 角色精灵更新 - 使用像素坐标
    //=============================================================================
    var _ESC_Physics_Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function() {
        // 如果是玩家且物理启用，使用像素坐标
        if (this._character === $gamePlayer && $gamePlayer.isPhysicsEnabled()) {
            this.x = $gamePlayer._screenX || this._character.screenX();
            this.y = $gamePlayer._screenY || this._character.screenY();
            this.z = this._character.screenZ();

            // 跳跃动画水平翻转处理
            // 当玩家在空中且面向左时，水平翻转精灵
            if (!$gamePlayer._isGrounded && $gamePlayer._isJumping) {
                if (!$gamePlayer._jumpFacingRight) {
                    this.scale.x = -1;
                } else {
                    this.scale.x = 1;
                }
            } else if ($gamePlayer._isCrouching) {
                // 下蹲时使用下蹲朝向（逻辑与正常行走相反，因为精灵默认朝左）
                if ($gamePlayer._crouchFacingRight) {
                    this.scale.x = -1;  // 朝右时翻转
                } else {
                    this.scale.x = 1;   // 朝左时不翻转
                }
            } else {
                // 正常站立/行走时使用正常朝向
                if ($gamePlayer._facingRight) {
                    this.scale.x = 1;
                } else {
                    this.scale.x = -1;
                }
            }
        } else {
            _ESC_Physics_Sprite_Character_updatePosition.call(this);
        }
    };

    //=============================================================================
    // 相机跟随 - 使用像素坐标
    //=============================================================================
    var _ESC_Physics_Game_Player_screenX = Game_Player.prototype.screenX;
    Game_Player.prototype.screenX = function() {
        if (this.isPhysicsEnabled() && this._pixelX !== undefined) {
            var map = $gameMap;
            if (!map) return this._pixelX || 0;
            var tileWidth = map.tileWidth();
            var displayX = map.displayX();
            return this._pixelX - displayX * tileWidth;
        }
        return _ESC_Physics_Game_Player_screenX.call(this);
    };

    var _ESC_Physics_Game_Player_screenY = Game_Player.prototype.screenY;
    Game_Player.prototype.screenY = function() {
        if (this.isPhysicsEnabled() && this._pixelY !== undefined) {
            var map = $gameMap;
            if (!map) return this._pixelY || 0;
            var tileHeight = map.tileHeight();
            var displayY = map.displayY();
            // +tileHeight 因为角色原点在底部中心
            return this._pixelY - displayY * tileHeight + tileHeight;
        }
        return _ESC_Physics_Game_Player_screenY.call(this);
    };

    //=============================================================================
    // 调试功能
    //=============================================================================
    if (Utils.isOptionValid('test')) {
        window.ESCDebug = window.ESCDebug || {};
        window.ESCDebug.physics = {
            status: function() {
                if (!$gamePlayer) return 'No player';
                var map = $gameMap;
                var tileHeight = map ? map.tileHeight() : 48;
                var footPixelY = $gamePlayer._pixelY + tileHeight;
                var footTileY = Math.floor(footPixelY / tileHeight);
                var tileX = Math.floor(($gamePlayer._pixelX + (map ? map.tileWidth() : 48) / 2) / (map ? map.tileWidth() : 48));

                return {
                    pixelX: $gamePlayer._pixelX,
                    pixelY: $gamePlayer._pixelY,
                    velocityX: $gamePlayer._velocityX,
                    velocityY: $gamePlayer._velocityY,
                    isGrounded: $gamePlayer._isGrounded,
                    isJumping: $gamePlayer._isJumping,
                    isMoving: $gamePlayer._isMoving,
                    isCrouching: $gamePlayer._isCrouching,
                    facingRight: $gamePlayer._facingRight,
                    physicsEnabled: $gamePlayer._physicsEnabled,
                    // 动画状态
                    walkPattern: $gamePlayer._walkPattern,
                    walkAnimationCount: $gamePlayer._walkAnimationCount,
                    jumpPattern: $gamePlayer._jumpPattern,
                    jumpAnimationCount: $gamePlayer._jumpAnimationCount,
                    crouchPattern: $gamePlayer._crouchPattern,
                    crouchAnimationCount: $gamePlayer._crouchAnimationCount,
                    crouchFacingRight: $gamePlayer._crouchFacingRight,
                    preJumpDirection: $gamePlayer._preJumpDirection,
                    jumpFacingRight: $gamePlayer._jumpFacingRight,
                    currentDirection: $gamePlayer.direction(),
                    // 坐标信息
                    tileX: $gamePlayer._x,
                    tileY: $gamePlayer._y,
                    footPixelY: footPixelY,
                    footTileY: footTileY,
                    tileBelowIsWall: map ? ESC.Physics.isSolidTile(tileX, footTileY) : 'no map',
                    canStandAt: ESC.Physics.canStandAt($gamePlayer._pixelX, $gamePlayer._pixelY),
                    config: {
                        gravity: ESC.PhysicsConfig.gravity,
                        jumpPower: ESC.PhysicsConfig.jumpPower,
                        maxFallSpeed: ESC.PhysicsConfig.maxFallSpeed,
                        moveSpeed: ESC.PhysicsConfig.moveSpeed,
                        walkAnimationSpeed: ESC.PhysicsConfig.walkAnimationSpeed,
                        jumpAnimationSpeed: ESC.PhysicsConfig.jumpAnimationSpeed,
                        crouchAnimationSpeed: ESC.PhysicsConfig.crouchAnimationSpeed
                    }
                };
            },
            // 详细诊断
            diagnose: function() {
                if (!$gamePlayer || !$gameMap) {
                    console.log('No player or map');
                    return;
                }
                var map = $gameMap;
                var tileWidth = map.tileWidth();
                var tileHeight = map.tileHeight();
                var px = $gamePlayer._pixelX;
                var py = $gamePlayer._pixelY;

                console.log('=== Physics Diagnose ===');
                console.log('Player pixelX=' + px + ', pixelY=' + py);
                console.log('Player tileX=' + (px / tileWidth) + ', tileY=' + (py / tileHeight));

                var footPixelY = py + tileHeight;
                var footTileX = Math.floor((px + tileWidth / 2) / tileWidth);
                var footTileY = Math.floor(footPixelY / tileHeight);

                console.log('Foot pixelY=' + footPixelY + ', should be at tile ' + footTileY + ' top edge');
                console.log('Tile ' + footTileY + ' top edge = ' + (footTileY * tileHeight));
                console.log('Tile (' + footTileX + ',' + footTileY + ') is wall: ' + ESC.Physics.isSolidTile(footTileX, footTileY));
                console.log('canStandAt: ' + ESC.Physics.canStandAt(px, py));
                console.log('isGrounded: ' + $gamePlayer._isGrounded);

                // 显示周围格子的状态
                console.log('Nearby tiles (X=' + footTileX + '):');
                for (var ty = Math.max(0, footTileY - 2); ty <= Math.min(map.height() - 1, footTileY + 2); ty++) {
                    var isWall = ESC.Physics.isSolidTile(footTileX, ty);
                    console.log('  Y=' + ty + ' (pixel ' + (ty * tileHeight) + '-' + ((ty+1)*tileHeight) + '): ' + (isWall ? 'WALL' : 'passable'));
                }
            },
            enable: function() {
                ESC.Physics.setEnabled(true);
            },
            disable: function() {
                ESC.Physics.setEnabled(false);
            },
            setGravity: function(value) {
                ESC.PhysicsConfig.gravity = value;
                console.log('[ESC Physics] Gravity set to ' + value);
            },
            setJumpPower: function(value) {
                ESC.PhysicsConfig.jumpPower = value;
                console.log('[ESC Physics] Jump power set to ' + value);
            },
            setMoveSpeed: function(value) {
                ESC.PhysicsConfig.moveSpeed = value;
                console.log('[ESC Physics] Move speed set to ' + value);
            },
            setAnimationSpeed: function(value) {
                ESC.PhysicsConfig.walkAnimationSpeed = value;
                if ($gamePlayer) {
                    $gamePlayer._walkAnimationSpeed = value;
                }
                console.log('[ESC Physics] Walk animation speed set to ' + value);
            },
            setJumpAnimationSpeed: function(value) {
                ESC.PhysicsConfig.jumpAnimationSpeed = value;
                if ($gamePlayer) {
                    $gamePlayer._jumpAnimationSpeed = value;
                }
                console.log('[ESC Physics] Jump animation speed set to ' + value);
            },
            jump: function() {
                if ($gamePlayer) {
                    $gamePlayer.jumpPhysics();
                }
            },
            // 检查某个格子是否是墙壁
            checkTile: function(tileX, tileY) {
                console.log('Tile (' + tileX + ',' + tileY + '): wall=' + ESC.Physics.isSolidTile(tileX, tileY) + ', passable=' + ESC.Physics.isPassableTile(tileX, tileY));
            },
            // 检查地面
            checkGround: function(pixelX, pixelY) {
                console.log('Position (' + pixelX + ',' + pixelY + '): canStand=' + ESC.Physics.canStandAt(pixelX, pixelY));
            },
            // 传送玩家到指定位置
            teleport: function(pixelX, pixelY) {
                if ($gamePlayer) {
                    $gamePlayer._pixelX = pixelX;
                    $gamePlayer._pixelY = pixelY;
                    $gamePlayer._velocityY = 0;
                    $gamePlayer._isGrounded = false;
                    $gamePlayer._physicsInitialized = true;
                    console.log('[ESC Physics] Teleported to (' + pixelX + ',' + pixelY + ')');
                }
            },
            // 强制重新初始化物理系统
            reinit: function() {
                if ($gamePlayer) {
                    $gamePlayer._physicsInitialized = false;
                    console.log('[ESC Physics] Will reinitialize on next update');
                }
            }
        };
    }

    console.log('ESC_Physics loaded successfully (Platform mode with 3-frame walking and jump animation)');
    console.log('[ESC Physics] Config: gravity=' + ESC.PhysicsConfig.gravity +
        ', jumpPower=' + ESC.PhysicsConfig.jumpPower +
        ', moveSpeed=' + ESC.PhysicsConfig.moveSpeed +
        ', maxFallSpeed=' + ESC.PhysicsConfig.maxFallSpeed +
        ', walkAnimationSpeed=' + ESC.PhysicsConfig.walkAnimationSpeed +
        ', jumpAnimationSpeed=' + ESC.PhysicsConfig.jumpAnimationSpeed);

    // 添加 F 键映射用于触发事件
    Input.keyMapper[70] = 'interact';  // F键
    console.log('[ESC Physics] F key mapped to "interact" for event triggering');
})();
