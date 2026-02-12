//=============================================================================
// ESC_FixedParallax.js - 逃离千禧年 固定远景
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 固定远景 - 让远景图作为地图背景而非视差效果
@author 2000sEscape Team
@version 1.2.0

@help
将远景图(Parallax)改为固定模式，使其成为地图的一部分。
玩家移动时，远景图会与地图同步移动，而不是产生视差滚动效果。

适用于：
- 将精心设计的背景图作为地图的一部分显示
- 避免远景与地图分离造成的视觉问题

注意：此插件会覆盖地图设置中的"远景循环"选项，
所有远景图都会按固定方式显示。
*/

(function() {
    'use strict';

    var enableDebug = true;
    var parallaxOxCallCount = 0;
    var updateParallaxCallCount = 0;

    //=============================================================================
    // 修改 Game_Map 的远景坐标计算
    // 让远景与地图完全同步
    //=============================================================================

    // 保存原始方法
    var _Game_Map_parallaxOx = Game_Map.prototype.parallaxOx;
    var _Game_Map_parallaxOy = Game_Map.prototype.parallaxOy;

    // 重写远景X坐标计算 - 与地图同步
    Game_Map.prototype.parallaxOx = function() {
        parallaxOxCallCount++;

        // 每60帧输出一次调试信息
        if (parallaxOxCallCount % 60 === 0) {
            console.log('[ESC Parallax] parallaxOx called #' + parallaxOxCallCount +
                ' _parallaxName=' + this._parallaxName + ', displayX=' + this._displayX.toFixed(2));
        }

        // 如果有远景图，让它与地图显示位置完全同步
        if (this._parallaxName) {
            var ox = this._displayX * this.tileWidth();
            return ox;
        }
        return _Game_Map_parallaxOx.call(this);
    };

    // 重写远景Y坐标计算 - 与地图同步
    Game_Map.prototype.parallaxOy = function() {
        // 如果有远景图，让它与地图显示位置完全同步
        if (this._parallaxName) {
            return this._displayY * this.tileHeight();
        }
        return _Game_Map_parallaxOy.call(this);
    };

    //=============================================================================
    // 重写 Spriteset_Map 的远景更新
    // 直接设置 origin 而不进行取模运算
    //=============================================================================

    var _Spriteset_Map_updateParallax = Spriteset_Map.prototype.updateParallax;

    Spriteset_Map.prototype.updateParallax = function() {
        updateParallaxCallCount++;

        // 每60帧输出一次调试信息
        if (updateParallaxCallCount % 60 === 0) {
            console.log('[ESC Parallax] updateParallax called #' + updateParallaxCallCount);
            console.log('[ESC Parallax]   this._parallaxName=' + this._parallaxName);
            console.log('[ESC Parallax]   $gameMap.parallaxName()=' + ($gameMap ? $gameMap.parallaxName() : 'no map'));
            console.log('[ESC Parallax]   this._parallax.bitmap=' + (this._parallax && this._parallax.bitmap ? 'exists' : 'null'));
        }

        // 调用原始方法加载远景图
        if (this._parallaxName !== $gameMap.parallaxName()) {
            this._parallaxName = $gameMap.parallaxName();
            this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName);
            console.log('[ESC Parallax] Loading parallax: ' + this._parallaxName);
        }

        // 如果有远景图，直接设置位置（不取模）
        if (this._parallax.bitmap) {
            var bitmapReady = this._parallax.bitmap.isReady();
            if (bitmapReady) {
                var ox = $gameMap.parallaxOx();
                var oy = $gameMap.parallaxOy();
                this._parallax.origin.x = ox;
                this._parallax.origin.y = oy;

                if (updateParallaxCallCount % 60 === 0) {
                    console.log('[ESC Parallax] Set origin: ox=' + Math.floor(ox) + ', oy=' + Math.floor(oy));
                }
            }
        }
    };

    // 添加全局调试函数
    window.ESCDebug = window.ESCDebug || {};
    window.ESCDebug.parallax = {
        status: function() {
            console.log('=== ESC Parallax Debug ===');
            console.log('Call counts: parallaxOx=' + parallaxOxCallCount + ', updateParallax=' + updateParallaxCallCount);
            console.log('$gameMap._parallaxName:', $gameMap ? $gameMap._parallaxName : 'no map');
            console.log('$gameMap.parallaxName():', $gameMap ? $gameMap.parallaxName() : 'no map');
            console.log('$gameMap._displayX:', $gameMap ? $gameMap._displayX : 'no map');
            console.log('$gameMap._parallaxX:', $gameMap ? $gameMap._parallaxX : 'no map');
            if ($gameMap) {
                console.log('parallaxOx():', $gameMap.parallaxOx());
                console.log('parallaxOy():', $gameMap.parallaxOy());
            }
        },
        enableDebug: function() {
            enableDebug = true;
            console.log('[ESC Parallax] Debug enabled');
        },
        disableDebug: function() {
            enableDebug = false;
            console.log('[ESC Parallax] Debug disabled');
        }
    };

    console.log('ESC_FixedParallax loaded - Parallax is now fixed to map');
    console.log('[ESC Parallax] Use ESCDebug.parallax.status() to check parallax state');

    // 验证覆盖是否成功
    setTimeout(function() {
        console.log('[ESC Parallax] Verification:');
        console.log('[ESC Parallax]   parallaxOx override active: ' +
            (Game_Map.prototype.parallaxOx.toString().indexOf('parallaxOxCallCount') !== -1 ? 'YES' : 'NO'));
        console.log('[ESC Parallax]   updateParallax override active: ' +
            (Spriteset_Map.prototype.updateParallax.toString().indexOf('updateParallaxCallCount') !== -1 ? 'YES' : 'NO'));
    }, 1000);
})();
