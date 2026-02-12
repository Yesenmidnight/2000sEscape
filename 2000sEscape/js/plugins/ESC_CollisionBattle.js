//=============================================================================
// ESC_CollisionBattle.js - 逃离千禧年 即时碰撞战斗系统
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 即时碰撞战斗系统 - 塞尔达风格的实时战斗
@author 2000sEscape Team
@version 1.0.0
@orderAfter ESC_Core

@help
即时碰撞战斗系统，支持：
- 玩家即时攻击（按键触发）
- 碰撞伤害（接触敌人受伤）
- 敌人AI（巡逻、追击、攻击）
- 击退效果和无敌帧

按键说明：
- 确定键/空格：攻击
- 攻击方向为玩家面朝方向

@param playerDamage
@text 玩家基础伤害
@default 10
@type number

@param enemyContactDamage
@text 敌人接触伤害
@default 5
@type number

@param knockbackSpeed
@text 击退速度
@default 0.15
@type number

@param showDamagePopup
@text 显示伤害数字
@default true
@type boolean
*/

(() => {
    'use strict';

    const pluginName = 'ESC_CollisionBattle';
    const params = PluginManager.parameters(pluginName);

    //=============================================================================
    // 配置
    //=============================================================================
    const Config = {
        playerBaseDamage: Number(params.playerDamage) || 10,
        enemyContactDamage: Number(params.enemyContactDamage) || 5,
        knockbackSpeed: Number(params.knockbackSpeed) || 0.15,
        showDamagePopup: params.showDamagePopup === 'true',
        attackCooldown: ESC.Config.attackCooldown,
        invincibleFrames: ESC.Config.invincibleFrames,
        attackRange: ESC.Config.attackRange
    };

    //=============================================================================
    // 玩家战斗扩展
    //=============================================================================
    // 存储玩家战斗状态
    const _Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _Game_Player_initMembers.call(this);
        this._attackCooldown = 0;
        this._isAttacking = false;
        this._attackFrame = 0;
        this._invincibleCount = 0;
        this._isKnockback = false;
        this._knockbackDx = 0;
        this._knockbackDy = 0;
    };

    // 玩家攻击
    Game_Player.prototype.performAttack = function() {
        if (this._attackCooldown > 0 || this._isKnockback) return false;

        this._isAttacking = true;
        this._attackFrame = 15; // 攻击动画帧
        this._attackCooldown = Config.attackCooldown;

        // 播放攻击动画/音效
        if (ESC.Audio) {
            ESC.Audio.playAttack();
        }

        // 检测攻击范围内的敌人
        this.checkAttackHits();

        return true;
    };

    // 检测攻击命中
    Game_Player.prototype.checkAttackHits = function() {
        const px = this.x;
        const py = this.y;
        const dir = this.direction();

        // 获取所有事件（敌人）
        $gameMap.events().forEach(event => {
            if (!event._isESCEnemy) return;

            const dist = ESC.Utils.distance(px, py, event.x, event.y);
            if (dist <= Config.attackRange) {
                // 检查是否在攻击扇形范围内
                if (ESC.Utils.isInFanRange(px, py, dir, event.x, event.y, Config.attackRange)) {
                    this.dealDamageToEnemy(event);
                }
            }
        });
    };

    // 对敌人造成伤害
    Game_Player.prototype.dealDamageToEnemy = function(enemy) {
        const damage = Config.playerBaseDamage + this.getWeaponBonus();

        // 应用伤害
        enemy.takeDamage(damage, this.direction());

        // 显示伤害数字
        if (Config.showDamagePopup) {
            this.showDamagePopup(enemy.x, enemy.y, damage, false);
        }
    };

    // 获取武器伤害加成
    Game_Player.prototype.getWeaponBonus = function() {
        // 从装备中获取武器加成
        const actor = $gameParty.leader();
        if (!actor) return 0;

        const weapon = actor.equips()[0];
        if (!weapon) return 0;

        return weapon.params[2] || 0; // 攻击力参数
    };

    // 显示伤害数字
    Game_Player.prototype.showDamagePopup = function(x, y, damage, isPlayer) {
        // 使用浮动文字显示伤害
        const mapX = $gameMap.adjustX(x);
        const mapY = $gameMap.adjustY(y);

        // 创建伤害数字图片
        const sprite = new Sprite_DamagePopup();
        sprite.setup(x, y, damage, isPlayer);
        SceneManager._scene._spriteset.addChild(sprite);
    };

    // 玩家受到伤害
    Game_Player.prototype.takeDamage = function(damage, fromDirection) {
        if (this._invincibleCount > 0 || this._isKnockback) return;

        const actor = $gameParty.leader();
        if (!actor) return;

        // 应用防御减伤
        const defense = actor.param(3); // 防御力
        const finalDamage = Math.max(1, damage - Math.floor(defense / 2));

        // 扣除HP
        actor._hp = Math.max(0, actor._hp - finalDamage);

        // 显示伤害
        if (Config.showDamagePopup) {
            this.showDamagePopup(this.x, this.y, finalDamage, true);
        }

        // 播放受伤音效
        if (ESC.Audio) {
            ESC.Audio.playDamage();
        }

        // 屏幕震动
        $gameScreen.startShake(5, 5, 10);

        // 设置无敌帧
        this._invincibleCount = Config.invincibleFrames;

        // 击退效果
        this.startKnockback(fromDirection);

        // 检查死亡
        if (actor._hp <= 0) {
            this.onPlayerDeath();
        }
    };

    // 开始击退
    Game_Player.prototype.startKnockback = function(fromDirection) {
        this._isKnockback = true;
        this._knockbackDx = 0;
        this._knockbackDy = 0;

        // 根据攻击来源方向确定击退方向
        switch(fromDirection) {
            case 2: this._knockbackDy = -Config.knockbackSpeed; break; // 从下方攻击，向上击退
            case 8: this._knockbackDy = Config.knockbackSpeed; break;  // 从上方攻击，向下击退
            case 4: this._knockbackDx = Config.knockbackSpeed; break;  // 从左方攻击，向右击退
            case 6: this._knockbackDx = -Config.knockbackSpeed; break; // 从右方攻击，向左击退
        }
    };

    // 玩家死亡处理
    Game_Player.prototype.onPlayerDeath = function() {
        // 掉落所有收集的物品
        ESC.GameState.resetCurrentLevel();

        // 游戏结束或重生
        $gameMessage.add('你在回忆中迷失了...');
        setTimeout(() => {
            SceneManager.goto(Scene_Gameover);
        }, 1000);
    };

    // 更新玩家战斗状态
    const _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function() {
        _Game_Player_update.call(this);

        // 更新攻击冷却
        if (this._attackCooldown > 0) {
            this._attackCooldown--;
        }

        // 更新攻击状态
        if (this._attackFrame > 0) {
            this._attackFrame--;
            if (this._attackFrame <= 0) {
                this._isAttacking = false;
            }
        }

        // 更新无敌帧
        if (this._invincibleCount > 0) {
            this._invincibleCount--;
        }

        // 更新击退状态
        if (this._isKnockback) {
            const newX = this.x + this._knockbackDx;
            const newY = this.y + this._knockbackDy;

            if (this.canPass(Math.round(this.x), Math.round(this.y), this.direction())) {
                this._x = newX;
                this._y = newY;
            }

            // 减速
            this._knockbackDx *= 0.9;
            this._knockbackDy *= 0.9;

            if (Math.abs(this._knockbackDx) < 0.01 && Math.abs(this._knockbackDy) < 0.01) {
                this._isKnockback = false;
            }
        }
    };

    // 检查玩家是否处于攻击状态
    Game_Player.prototype.isAttacking = function() {
        return this._isAttacking;
    };

    // 检查玩家是否无敌
    Game_Player.prototype.isInvincible = function() {
        return this._invincibleCount > 0;
    };

    //=============================================================================
    // 敌人系统
    //=============================================================================
    // 敌人状态
    const _Game_Event_initMembers = Game_Event.prototype.initMembers;
    Game_Event.prototype.initMembers = function() {
        _Game_Event_initMembers.call(this);
        this._isESCEnemy = false;
        this._enemyHp = 0;
        this._enemyMaxHp = 0;
        this._enemyDamage = 0;
        this._enemySpeed = 0;
        this._enemySightRange = 0;
        this._enemyState = 'idle'; // idle, patrol, chase, attack
        this._enemyPatrolPoints = [];
        this._enemyCurrentPatrolIndex = 0;
        this._enemyAttackCooldown = 0;
        this._enemyInvincible = 0;
        this._enemyKnockback = false;
        this._enemyKnockbackDx = 0;
        this._enemyKnockbackDy = 0;
        this._dropItemId = 0;
    };

    // 初始化敌人数据
    Game_Event.prototype.setupESCEnemy = function(data) {
        this._isESCEnemy = true;
        this._enemyHp = data.hp || 30;
        this._enemyMaxHp = data.hp || 30;
        this._enemyDamage = data.damage || 5;
        this._enemySpeed = data.speed || 0.03;
        this._enemySightRange = data.sightRange || 4;
        this._dropItemId = data.dropItemId || 0;
        this._enemyState = 'idle';

        // 从备注读取巡逻点
        if (data.patrolPoints) {
            this._enemyPatrolPoints = data.patrolPoints;
        }
    };

    // 敌人受到伤害
    Game_Event.prototype.takeDamage = function(damage, fromDirection) {
        if (this._enemyInvincible > 0) return;

        this._enemyHp -= damage;
        this._enemyInvincible = 30;

        // 播放受伤效果
        this.requestEffect('blink');

        // 击退
        this._enemyKnockback = true;
        switch(fromDirection) {
            case 2: this._enemyKnockbackDy = -0.2; break;
            case 8: this._enemyKnockbackDy = 0.2; break;
            case 4: this._enemyKnockbackDx = 0.2; break;
            case 6: this._enemyKnockbackDx = -0.2; break;
        }

        // 检查死亡
        if (this._enemyHp <= 0) {
            this.onEnemyDeath();
        }
    };

    // 敌人死亡
    Game_Event.prototype.onEnemyDeath = function() {
        // 增加击杀计数
        ESC.GameState.currentLevel.enemiesDefeated++;

        // 掉落物品
        if (this._dropItemId > 0) {
            // 在敌人位置生成物品
            this.spawnLootItem(this._dropItemId);
        }

        // 播放死亡效果
        this.requestEffect('collapse');

        // 移除敌人
        setTimeout(() => {
            $gameMap.eraseEvent(this.eventId());
        }, 500);
    };

    // 生成掉落物品
    Game_Event.prototype.spawnLootItem = function(itemId) {
        // 创建一个临时事件来表示掉落物品
        // 这需要与物品收集系统配合
        const lootData = {
            x: this.x,
            y: this.y,
            itemId: itemId
        };

        // 触发公共事件或自定义处理
        if (ESC.LootManager) {
            ESC.LootManager.spawnLoot(lootData);
        }
    };

    // 敌人AI更新
    const _Game_Event_update = Game_Event.prototype.update;
    Game_Event.prototype.update = function() {
        _Game_Event_update.call(this);

        if (!this._isESCEnemy) return;

        this.updateEnemyAI();
        this.updateEnemyKnockback();

        if (this._enemyInvincible > 0) {
            this._enemyInvincible--;
        }
        if (this._enemyAttackCooldown > 0) {
            this._enemyAttackCooldown--;
        }
    };

    // 更新敌人AI
    Game_Event.prototype.updateEnemyAI = function() {
        if (this._enemyKnockback) return;

        const player = $gamePlayer;
        const dist = ESC.Utils.distance(this.x, this.y, player.x, player.y);

        // 状态机
        switch(this._enemyState) {
            case 'idle':
                if (dist <= this._enemySightRange) {
                    this._enemyState = 'chase';
                } else if (this._enemyPatrolPoints.length > 0) {
                    this._enemyState = 'patrol';
                }
                break;

            case 'patrol':
                this.updatePatrol();
                if (dist <= this._enemySightRange) {
                    this._enemyState = 'chase';
                }
                break;

            case 'chase':
                if (dist > this._enemySightRange * 1.5) {
                    this._enemyState = 'idle';
                } else if (dist <= 1) {
                    this._enemyState = 'attack';
                } else {
                    this.moveTowardPlayer();
                }
                break;

            case 'attack':
                if (dist > 1.2) {
                    this._enemyState = 'chase';
                } else {
                    this.tryAttackPlayer();
                }
                break;
        }
    };

    // 巡逻行为
    Game_Event.prototype.updatePatrol = function() {
        if (this._enemyPatrolPoints.length === 0) return;

        const target = this._enemyPatrolPoints[this._enemyCurrentPatrolIndex];
        const dist = ESC.Utils.distance(this.x, this.y, target.x, target.y);

        if (dist < 0.5) {
            this._enemyCurrentPatrolIndex = (this._enemyCurrentPatrolIndex + 1) % this._enemyPatrolPoints.length;
            return;
        }

        // 向巡逻点移动
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dir = ESC.Utils.directionBetween(this.x, this.y, target.x, target.y);

        this.moveStraight(dir);
    };

    // 追踪玩家
    Game_Event.prototype.moveTowardPlayer = function() {
        const player = $gamePlayer;
        const dir = ESC.Utils.directionBetween(this.x, this.y, player.x, player.y);

        if (!this.isMovementSucceeded()) {
            // 如果直线移动失败，尝试绕路
            const alternatives = [dir, this.turnRight90(dir), this.turnLeft90(dir)];
            for (const altDir of alternatives) {
                this.setDirection(altDir);
                if (this.canPass(this.x, this.y, altDir)) {
                    this.moveStraight(altDir);
                    return;
                }
            }
        } else {
            this.moveStraight(dir);
        }
    };

    // 尝试攻击玩家
    Game_Event.prototype.tryAttackPlayer = function() {
        if (this._enemyAttackCooldown > 0) return;

        const player = $gamePlayer;
        const dist = ESC.Utils.distance(this.x, this.y, player.x, player.y);

        if (dist <= 1 && !player.isInvincible()) {
            player.takeDamage(this._enemyDamage, ESC.Utils.directionBetween(player.x, player.y, this.x, this.y));
            this._enemyAttackCooldown = 60;
        }
    };

    // 更新击退
    Game_Event.prototype.updateEnemyKnockback = function() {
        if (!this._enemyKnockback) return;

        this._x += this._enemyKnockbackDx;
        this._y += this._enemyKnockbackDy;

        this._enemyKnockbackDx *= 0.85;
        this._enemyKnockbackDy *= 0.85;

        if (Math.abs(this._enemyKnockbackDx) < 0.01 && Math.abs(this._enemyKnockbackDy) < 0.01) {
            this._enemyKnockback = false;
        }
    };

    //=============================================================================
    // 碰撞检测
    //=============================================================================
    const _Game_Player_checkEventTriggerHere = Game_Player.prototype.checkEventTriggerHere;
    Game_Player.prototype.checkEventTriggerHere = function(triggers) {
        _Game_Player_checkEventTriggerHere.call(this, triggers);

        // 检查敌人碰撞
        if (this.isInvincible()) return;

        $gameMap.eventsXy(this.x, this.y).forEach(event => {
            if (event._isESCEnemy && !this._isKnockback) {
                // 接触伤害
                this.takeDamage(Config.enemyContactDamage, ESC.Utils.directionBetween(this.x, this.y, event.x, event.y));
            }
        });
    };

    // 每帧检查碰撞
    const _Game_Player_moveStraight = Game_Player.prototype.moveStraight;
    Game_Player.prototype.moveStraight = function(d) {
        _Game_Player_moveStraight.call(this, d);

        // 检查移动后是否与敌人重叠
        if (!this.isInvincible()) {
            $gameMap.events().forEach(event => {
                if (event._isESCEnemy && event.x === this.x && event.y === this.y) {
                    this.takeDamage(Config.enemyContactDamage, d);
                }
            });
        }
    };

    //=============================================================================
    // 输入处理
    //=============================================================================
    const _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
    Scene_Map.prototype.updateMain = function() {
        _Scene_Map_updateMain.call(this);

        // 检测攻击输入
        if (Input.isTriggered(ESC.Config.attackKey)) {
            $gamePlayer.performAttack();
        }
    };

    //=============================================================================
    // 玩家精灵扩展 - 攻击动画
    //=============================================================================
    const _Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        _Sprite_Character_update.call(this);

        // 更新攻击动画
        if (this._character === $gamePlayer && $gamePlayer.isAttacking()) {
            // 攻击时的视觉效果
            this.scale.x = 1.1;
            this.scale.y = 1.1;
        } else if (this._character === $gamePlayer) {
            this.scale.x = 1;
            this.scale.y = 1;
        }

        // 无敌闪烁效果
        if (this._character === $gamePlayer && $gamePlayer.isInvincible()) {
            this.visible = Math.floor(Graphics.frameCount / 4) % 2 === 0;
        } else if (this._character && this._character._enemyInvincible > 0) {
            this.visible = Math.floor(Graphics.frameCount / 2) % 2 === 0;
        }
    };

    //=============================================================================
    // 伤害数字精灵
    //=============================================================================
    class Sprite_DamagePopup extends Sprite {
        setup(x, y, damage, isPlayer) {
            this._mapX = x;
            this._mapY = y;
            this._damage = damage;
            this._isPlayer = isPlayer;
            this._duration = 60;
            this._offsetY = 0;

            // 创建文本
            const bitmap = new Bitmap(64, 32);
            bitmap.fontFace = $gameSystem.mainFontFace();
            bitmap.fontSize = 24;
            bitmap.textColor = isPlayer ? '#ff6666' : '#ffff66';
            bitmap.drawText(damage.toString(), 0, 0, 64, 32, 'center');

            this.bitmap = bitmap;
            this.anchor.set(0.5, 1);
            this.z = 1000;
        }

        update() {
            super.update();
            this._duration--;
            this._offsetY -= 0.5;

            // 更新屏幕位置
            const tileWidth = $gameMap.tileWidth();
            const tileHeight = $gameMap.tileHeight();
            this.x = ($gameMap.adjustX(this._mapX) + 0.5) * tileWidth;
            this.y = ($gameMap.adjustY(this._mapY) + 1) * tileHeight + this._offsetY;

            // 淡出
            if (this._duration < 20) {
                this.opacity = (this._duration / 20) * 255;
            }

            if (this._duration <= 0) {
                this.parent.removeChild(this);
            }
        }
    }

    // 暴露给全局
    window.Sprite_DamagePopup = Sprite_DamagePopup;

    //=============================================================================
    // 从事件备注读取敌人配置
    //=============================================================================
    const _Game_Event_setupPage = Game_Event.prototype.setupPage;
    Game_Event.prototype.setupPage = function() {
        _Game_Event_setupPage.call(this);

        // 检查是否是敌人事件
        if (this.event() && this.event().note) {
            const note = this.event().note;

            if (note.includes('<ESCEnemy>')) {
                const hpMatch = note.match(/<enemyHP:\s*(\d+)>/i);
                const damageMatch = note.match(/<enemyDamage:\s*(\d+)>/i);
                const speedMatch = note.match(/<enemySpeed:\s*([\d.]+)>/i);
                const sightMatch = note.match(/<enemySight:\s*(\d+)>/i);
                const dropMatch = note.match(/<enemyDrop:\s*(\d+)>/i);

                this.setupESCEnemy({
                    hp: hpMatch ? parseInt(hpMatch[1]) : 30,
                    damage: damageMatch ? parseInt(damageMatch[1]) : 5,
                    speed: speedMatch ? parseFloat(speedMatch[1]) : 0.03,
                    sightRange: sightMatch ? parseInt(sightMatch[1]) : 4,
                    dropItemId: dropMatch ? parseInt(dropMatch[1]) : 0
                });
            }
        }
    };

    console.log('ESC_CollisionBattle loaded successfully');
})();
