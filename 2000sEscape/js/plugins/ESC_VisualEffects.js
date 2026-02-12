//=============================================================================
// ESC_VisualEffects.js - 逃离千禧年 怪核视觉效果系统
//=============================================================================

/*:
@target MZ
@plugindesc [ESC] 怪核视觉效果 - 滤镜、色调、VHS效果、氛围营造
@author 2000sEscape Team
@version 1.1.0

@help
怪核/池核风格视觉效果系统，包括：
- VHS扫描线效果
- 噪点/颗粒效果
- 暗角效果
- 色差效果
- 闪烁/抖动效果
- CRT屏幕凸起效果（使用WebGL着色器实现真正的桶形畸变）

插件命令：
- ESC_VisualEffects setEffect effect value
- ESC_VisualEffects toggleEffect effect enabled
- ESC_VisualEffects applySceneEffect scene

@param enableVHS
@text 启用VHS效果
@default true
@type boolean

@param enableNoise
@text 启用噪点效果
@default true
@type boolean

@param enableVignette
@text 启用暗角效果
@default true
@type boolean

@param enableChroma
@text 启用色差效果
@default false
@type boolean

@param noiseIntensity
@text 噪点强度
@default 0.08
@type number
@min 0
@max 1
@decimals 2

@param vignetteIntensity
@text 暗角强度
@default 0.4
@type number
@min 0
@max 1
@decimals 2

@param scanlineOpacity
@text 扫描线透明度
@default 0.2
@type number
@min 0
@max 1
@decimals 2

@param enableCRTCurvature
@text 启用CRT屏幕凸起效果
@default true
@type boolean

@param crtCurvature
@text CRT凸起强度
@default 0.25
@type number
@min 0
@max 1
@decimals 2

@param flickerIntensity
@text 闪烁强度(默认关闭，仅在危险场景启用)
@default 0
@type number
@min 0
@max 1
@decimals 2
*/

(function() {
    'use strict';

    var pluginName = 'ESC_VisualEffects';
    var params = PluginManager.parameters(pluginName);

    //=============================================================================
    // 配置
    //=============================================================================
    var Config = {
        enableVHS: params.enableVHS === 'true',
        enableNoise: params.enableNoise === 'true',
        enableVignette: params.enableVignette === 'true',
        enableChroma: params.enableChroma === 'true',
        enableCRTCurvature: params.enableCRTCurvature === 'true',
        noiseIntensity: parseFloat(params.noiseIntensity) || 0.08,
        vignetteIntensity: parseFloat(params.vignetteIntensity) || 0.4,
        scanlineOpacity: parseFloat(params.scanlineOpacity) || 0.2,
        crtCurvature: parseFloat(params.crtCurvature) || 0.25,
        flickerIntensity: parseFloat(params.flickerIntensity) || 0
    };

    //=============================================================================
    // CRT曲率滤镜 - 使用PixiJS Filter实现真正的桶形畸变
    //=============================================================================
    var CRTCurvatureFilter = null;

    // 初始化CRT滤镜
    function initCRTFilter() {
        if (CRTCurvatureFilter) return CRTCurvatureFilter;

        try {
            // PixiJS v5+ 滤镜着色器
            var fragmentShader = [
                'varying vec2 vTextureCoord;',
                'uniform sampler2D uSampler;',
                'uniform float curvature;',
                '',
                'void main(void) {',
                '    vec2 uv = vTextureCoord;',
                '',
                '    // 将UV坐标转换到-1到1范围，以中心为原点',
                '    vec2 centered = uv * 2.0 - 1.0;',
                '',
                '    // 计算到中心的距离',
                '    float dist = length(centered);',
                '',
                '    // 桶形畸变公式 - 距离越远，向边缘推得越远（凸起效果）',
                '    float distortion = 1.0 + dist * dist * curvature;',
                '',
                '    // 应用畸变 - 乘法使边缘向外扩张，产生凸起效果',
                '    centered = centered * distortion;',
                '',
                '    // 转换回0-1范围',
                '    vec2 curvedUV = centered * 0.5 + 0.5;',
                '',
                '    // 检查是否超出边界',
                '    if (curvedUV.x < 0.0 || curvedUV.x > 1.0 ||',
                '        curvedUV.y < 0.0 || curvedUV.y > 1.0) {',
                '        // 边界外显示黑色（模拟CRT边框）',
                '        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);',
                '        return;',
                '    }',
                '',
                '    // 采样弯曲后的UV坐标',
                '    gl_FragColor = texture2D(uSampler, curvedUV);',
                '}'
            ].join('\n');

            // 创建PixiJS滤镜
            CRTCurvatureFilter = new PIXI.Filter(null, fragmentShader, {
                curvature: Config.crtCurvature
            });

            console.log('[ESC] CRT Curvature Filter created, curvature=' + Config.crtCurvature);
            return CRTCurvatureFilter;

        } catch (e) {
            console.error('[ESC] Failed to create CRT Filter:', e);
            return null;
        }
    }

    //=============================================================================
    // CRT滤镜管理器
    //=============================================================================
    var CRTFilterManager = {
        _filter: null,

        // 获取或创建滤镜
        getFilter: function() {
            if (!this._filter) {
                this._filter = initCRTFilter();
            }
            return this._filter;
        },

        // 更新滤镜参数
        updateCurvature: function(value) {
            if (this._filter && this._filter.uniforms) {
                this._filter.uniforms.curvature = value;
            }
        },

        // 获取当前曲率值
        getCurvature: function() {
            return Config.enableCRTCurvature ? Config.crtCurvature : 0;
        },

        // 将屏幕坐标转换为CRT畸变后的坐标
        // 当CRT效果开启时，画面边缘向外凸起
        // 这个函数对鼠标坐标应用相同的畸变，使点击位置与视觉效果匹配
        transformPoint: function(screenX, screenY) {
            var curvature = this.getCurvature();
            if (curvature === 0) {
                return { x: screenX, y: screenY };
            }

            var width = Graphics.boxWidth || 816;
            var height = Graphics.boxHeight || 624;

            // 转换为0-1范围的UV坐标
            var uvX = screenX / width;
            var uvY = screenY / height;

            // 转换到-1到1范围，以中心为原点
            var centeredX = uvX * 2.0 - 1.0;
            var centeredY = uvY * 2.0 - 1.0;

            // 计算到中心的距离
            var dist = Math.sqrt(centeredX * centeredX + centeredY * centeredY);

            // 应用桶形畸变公式（与着色器相同）
            var distortion = 1.0 + dist * dist * curvature;
            centeredX = centeredX * distortion;
            centeredY = centeredY * distortion;

            // 转换回0-1范围
            var curvedUvX = centeredX * 0.5 + 0.5;
            var curvedUvY = centeredY * 0.5 + 0.5;

            // 转换回像素坐标
            return {
                x: curvedUvX * width,
                y: curvedUvY * height
            };
        },

        // 批量转换坐标（优化性能）
        transformTouchInput: function() {
            if (this.getCurvature() === 0) {
                return { x: TouchInput.x, y: TouchInput.y };
            }
            return this.transformPoint(TouchInput.x, TouchInput.y);
        }
    };

    //=============================================================================
    // 视觉效果管理器
    //=============================================================================
    var VisualEffects = {
        _effectsSprite: null,
        _noiseBitmap: null,
        _frameCount: 0,

        // 创建效果层
        createEffectsLayer: function() {
            this._effectsSprite = new Sprite_ESCEffects();
            return this._effectsSprite;
        },

        // 更新效果
        update: function() {
            this._frameCount++;
        },

        // 获取当前帧
        getFrameCount: function() {
            return this._frameCount;
        },

        // 设置效果强度
        setEffectIntensity: function(effect, value) {
            switch(effect) {
                case 'noise':
                    Config.noiseIntensity = value;
                    break;
                case 'vignette':
                    Config.vignetteIntensity = value;
                    break;
                case 'scanline':
                    Config.scanlineOpacity = value;
                    break;
                case 'flicker':
                    Config.flickerIntensity = value;
                    break;
                case 'crt':
                    Config.crtCurvature = value;
                    break;
            }
        },

        // 启用/禁用效果
        toggleEffect: function(effect, enabled) {
            switch(effect) {
                case 'vhs':
                    Config.enableVHS = enabled;
                    break;
                case 'noise':
                    Config.enableNoise = enabled;
                    break;
                case 'vignette':
                    Config.enableVignette = enabled;
                    break;
                case 'chroma':
                    Config.enableChroma = enabled;
                    break;
                case 'crt':
                    Config.enableCRTCurvature = enabled;
                    break;
            }
        }
    };

    // 暴露到全局ESC命名空间
    window.ESC = window.ESC || {};
    ESC.VisualEffects = VisualEffects;
    // 暴露CRT滤镜管理器，供其他场景使用
    ESC.CRTFilterManager = CRTFilterManager;
    // 保持向后兼容
    window.ESC_VisualEffects = VisualEffects;

    //=============================================================================
    // 效果精灵 - 使用正确的原型继承模式
    //=============================================================================
    function Sprite_ESCEffects() {
        this.initialize.apply(this, arguments);
    }

    Sprite_ESCEffects.prototype = Object.create(Sprite.prototype);
    Sprite_ESCEffects.prototype.constructor = Sprite_ESCEffects;

    Sprite_ESCEffects.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this._noisePhase = 0;
        this._flickerPhase = 0;
        this._chromaOffset = 0;
        this._glitchTimer = 0;
        this._glitchY = 0;
        this._glitchHeight = 0;
        this._debugFrameCount = 0; // 调试帧计数
        this.z = 1000; // 最顶层
        console.log('[ESC Debug] Sprite_ESCEffects initialized, z=' + this.z);
    };

    Sprite_ESCEffects.prototype.createBitmap = function() {
        // 使用 Graphics.boxWidth/boxHeight 更稳定
        var width = Graphics.boxWidth || Graphics.width || 816;
        var height = Graphics.boxHeight || Graphics.height || 624;

        // 确保尺寸有效
        width = Math.max(width, 816);
        height = Math.max(height, 624);

        console.log('ESC Visual Effects: Creating bitmap ' + width + 'x' + height);

        this.bitmap = new Bitmap(width, height);

        // 确保bitmap创建成功
        if (this.bitmap) {
            this._bitmapWidth = width;
            this._bitmapHeight = height;
        }
    };

    Sprite_ESCEffects.prototype.update = function() {
        Sprite.prototype.update.call(this);

        // 调试：每60帧输出一次状态
        this._debugFrameCount++;
        if (this._debugFrameCount % 60 === 1) {
            console.log('[ESC Debug] update() called, frame=' + this._debugFrameCount +
                ', bitmap=' + !!this.bitmap +
                ', visible=' + this.visible +
                ', parent=' + !!this.parent);
        }

        // 延迟创建 bitmap
        if (!this.bitmap) {
            this.createBitmap();
        }

        // 检查 bitmap 是否可用
        if (!this.bitmap) {
            if (this._debugFrameCount % 60 === 1) {
                console.log('[ESC Debug] No bitmap available');
            }
            return;
        }
        if (!this.bitmap._canvas) {
            if (this._debugFrameCount % 60 === 1) {
                console.log('[ESC Debug] No canvas available');
            }
            return;
        }
        if (!this.bitmap._context) {
            if (this._debugFrameCount % 60 === 1) {
                console.log('[ESC Debug] No context available');
            }
            return;
        }

        VisualEffects.update();
        this.redraw();
    };

    Sprite_ESCEffects.prototype.redraw = function() {
        var bitmap = this.bitmap;
        var ctx = bitmap._context;

        // 严格的安全检查
        if (!bitmap || !ctx || !bitmap._canvas) {
            if (this._debugFrameCount % 60 === 1) {
                console.log('[ESC Debug] redraw() skipped - safety check failed');
            }
            return;
        }

        var width = this._bitmapWidth || bitmap.width;
        var height = this._bitmapHeight || bitmap.height;

        // 调试：每60帧输出一次绘制信息
        if (this._debugFrameCount % 60 === 1) {
            console.log('[ESC Debug] redraw() - size=' + width + 'x' + height +
                ', VHS=' + Config.enableVHS +
                ', Noise=' + Config.enableNoise +
                ', Vignette=' + Config.enableVignette +
                ', scanlineOpacity=' + Config.scanlineOpacity +
                ', noiseIntensity=' + Config.noiseIntensity);
        }

        // 使用 canvas 直接清除
        ctx.clearRect(0, 0, width, height);

        // 噪点 - 先绘制，因为 putImageData 会覆盖其他内容
        if (Config.enableNoise) {
            this.drawNoise(ctx, width, height);
        }

        // VHS扫描线 - 在噪点之后绘制，这样不会被覆盖
        if (Config.enableVHS) {
            this.drawScanlines(ctx, width, height);
        }

        // 暗角
        if (Config.enableVignette) {
            this.drawVignette(ctx, width, height);
        }

        // CRT屏幕凸起效果
        if (Config.enableCRTCurvature) {
            this.drawCRTCurvature(ctx, width, height);
        }

        // 闪烁
        if (Config.flickerIntensity > 0) {
            this.applyFlicker(ctx, width, height);
        }

        // 色差
        if (Config.enableChroma) {
            this.applyChromaAberration(ctx, width, height);
        }

        // 标记bitmap为已修改（PIXI v5/v7兼容）
        // 使用 _dirty 标志而不是 _baseTexture.dirty() 方法
        if (bitmap._dirty !== undefined) {
            bitmap._dirty = true;
        }
        // 某些PixiJS版本需要手动更新纹理
        if (bitmap._baseTexture && typeof bitmap._baseTexture.update === 'function') {
            bitmap._baseTexture.update();
        }
    };

    Sprite_ESCEffects.prototype.drawScanlines = function(ctx, width, height) {
        var frame = VisualEffects.getFrameCount();

        // CRT扫描线 - 使用更细密的线条
        ctx.fillStyle = 'rgba(0, 0, 0, ' + Config.scanlineOpacity + ')';

        // 主要扫描线（每隔2像素）
        for (var y = 0; y < height; y += 2) {
            ctx.fillRect(0, y, width, 1);
        }

        // 滚动的扫描光束效果
        var beamY = (frame * 2) % (height + 100) - 50;
        var beamGradient = ctx.createLinearGradient(0, beamY - 30, 0, beamY + 30);
        beamGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        beamGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        beamGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = beamGradient;
        ctx.fillRect(0, beamY - 30, width, 60);

        // 随机的水平干扰带
        if (Math.random() < 0.01) {
            var glitchY = Math.floor(Math.random() * height);
            var glitchH = Math.floor(Math.random() * 10 + 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, glitchY, width, glitchH);
        }
    };

    Sprite_ESCEffects.prototype.drawNoise = function(ctx, width, height) {
        var frame = VisualEffects.getFrameCount();

        // 确保尺寸有效
        width = Math.floor(width);
        height = Math.floor(height);
        if (width <= 0 || height <= 0) return;

        // 创建全屏噪点图像数据
        var imageData = ctx.createImageData(width, height);
        var data = imageData.data;
        var noiseAlpha = Math.floor(Config.noiseIntensity * 100);

        // 生成动态噪点 - 每4个像素采样一次以提高性能
        var step = 2;
        for (var y = 0; y < height; y += step) {
            for (var x = 0; x < width; x += step) {
                // 基础噪点值
                var noise = Math.random();
                var gray = noise > 0.5 ? 255 : 0;

                // 添加一些中间色调让噪点更自然
                if (noise > 0.3 && noise < 0.7) {
                    gray = Math.floor(Math.random() * 128 + 64);
                }

                // 填充采样块
                for (var dy = 0; dy < step && y + dy < height; dy++) {
                    for (var dx = 0; dx < step && x + dx < width; dx++) {
                        var i = ((y + dy) * width + (x + dx)) * 4;
                        data[i] = gray;     // R
                        data[i + 1] = gray; // G
                        data[i + 2] = gray; // B
                        data[i + 3] = noiseAlpha; // A
                    }
                }
            }
        }

        // VHS水平追踪线效果 - 随机出现
        this._glitchTimer++;
        if (this._glitchTimer > 60 && Math.random() < 0.02) {
            this._glitchTimer = 0;
            this._glitchY = Math.floor(Math.random() * height);
            this._glitchHeight = Math.floor(Math.random() * 20 + 5);
        }

        // 绘制追踪线干扰
        if (this._glitchHeight > 0) {
            this._glitchHeight -= 2;
            var glitchY = this._glitchY;
            var glitchH = Math.min(this._glitchHeight, height - glitchY);

            for (var y = glitchY; y < glitchY + glitchH && y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var i = (y * width + x) * 4;
                    data[i] = Math.min(255, data[i] + 50);
                    data[i + 1] = Math.min(255, data[i + 1] + 50);
                    data[i + 2] = Math.min(255, data[i + 2] + 50);
                }
            }
        }

        // 偶尔的垂直同步线
        if (Math.random() < 0.005) {
            var vLineX = Math.floor(Math.random() * width);
            var vLineWidth = Math.floor(Math.random() * 3 + 1);
            for (var x = vLineX; x < vLineX + vLineWidth && x < width; x++) {
                for (var y = 0; y < height; y++) {
                    var i = (y * width + x) * 4;
                    data[i] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = 255;
                    data[i + 3] = 100;
                }
            }
        }

        // 使用更轻的混合模式
        ctx.globalAlpha = 0.3;
        ctx.putImageData(imageData, 0, 0);
        ctx.globalAlpha = 1;
    };

    Sprite_ESCEffects.prototype.drawVignette = function(ctx, width, height) {
        var centerX = width / 2;
        var centerY = height / 2;
        var radius = Math.max(width, height) * 0.7;

        var gradient = ctx.createRadialGradient(
            centerX, centerY, radius * 0.3,
            centerX, centerY, radius
        );

        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, ' + (Config.vignetteIntensity * 0.3) + ')');
        gradient.addColorStop(1, 'rgba(0, 0, 0, ' + Config.vignetteIntensity + ')');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    };

    Sprite_ESCEffects.prototype.drawCRTCurvature = function(ctx, width, height) {
        // ========================================
        // CRT屏幕装饰效果
        // 真正的桶形畸变由PixiJS Filter处理
        // 这里只绘制边框和圆角装饰
        // ========================================

        // 1. 四角圆角阴影 - CRT特有的圆角
        var cornerRadius = Math.min(width, height) * 0.05;
        var cornerOpacity = 0.3;

        // 左上角
        var tlGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, cornerRadius * 2);
        tlGradient.addColorStop(0, 'rgba(0, 0, 0, ' + cornerOpacity + ')');
        tlGradient.addColorStop(0.5, 'rgba(0, 0, 0, ' + (cornerOpacity * 0.3) + ')');
        tlGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = tlGradient;
        ctx.fillRect(0, 0, cornerRadius * 2, cornerRadius * 2);

        // 右上角
        var trGradient = ctx.createRadialGradient(width, 0, 0, width, 0, cornerRadius * 2);
        trGradient.addColorStop(0, 'rgba(0, 0, 0, ' + cornerOpacity + ')');
        trGradient.addColorStop(0.5, 'rgba(0, 0, 0, ' + (cornerOpacity * 0.3) + ')');
        trGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = trGradient;
        ctx.fillRect(width - cornerRadius * 2, 0, cornerRadius * 2, cornerRadius * 2);

        // 左下角
        var blGradient = ctx.createRadialGradient(0, height, 0, 0, height, cornerRadius * 2);
        blGradient.addColorStop(0, 'rgba(0, 0, 0, ' + cornerOpacity + ')');
        blGradient.addColorStop(0.5, 'rgba(0, 0, 0, ' + (cornerOpacity * 0.3) + ')');
        blGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = blGradient;
        ctx.fillRect(0, height - cornerRadius * 2, cornerRadius * 2, cornerRadius * 2);

        // 右下角
        var brGradient = ctx.createRadialGradient(width, height, 0, width, height, cornerRadius * 2);
        brGradient.addColorStop(0, 'rgba(0, 0, 0, ' + cornerOpacity + ')');
        brGradient.addColorStop(0.5, 'rgba(0, 0, 0, ' + (cornerOpacity * 0.3) + ')');
        brGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = brGradient;
        ctx.fillRect(width - cornerRadius * 2, height - cornerRadius * 2, cornerRadius * 2, cornerRadius * 2);

        // 2. 边缘高光 - 模拟玻璃反光
        // 顶部
        var topGlow = ctx.createLinearGradient(0, 0, 0, 30);
        topGlow.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        topGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, width, 30);

        // 左侧
        var leftGlow = ctx.createLinearGradient(0, 0, 20, 0);
        leftGlow.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        leftGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = leftGlow;
        ctx.fillRect(0, 0, 20, height);

        // 右侧
        var rightGlow = ctx.createLinearGradient(width - 20, 0, width, 0);
        rightGlow.addColorStop(0, 'rgba(255, 255, 255, 0)');
        rightGlow.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        ctx.fillStyle = rightGlow;
        ctx.fillRect(width - 20, 0, 20, height);
    };

    Sprite_ESCEffects.prototype.applyFlicker = function(ctx, width, height) {
        this._flickerPhase += 0.3;

        // 主要的微妙亮度波动
        var baseFlicker = Math.sin(this._flickerPhase) * 0.02 + 0.02;

        // 偶尔的强烈闪烁（模拟电源不稳定）
        var intenseFlicker = Math.random() < 0.02 ? Config.flickerIntensity * 2 : 0;

        // 偶尔的全屏闪烁
        var screenFlicker = Math.random() < 0.005 ? 0.1 : 0;

        var totalFlicker = baseFlicker + intenseFlicker + screenFlicker;

        if (totalFlicker > 0.01) {
            ctx.globalAlpha = Math.min(totalFlicker, 0.15);
            ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            ctx.fillRect(0, 0, width, height);
            ctx.globalAlpha = 1;
        }
    };

    Sprite_ESCEffects.prototype.applyChromaAberration = function(ctx, width, height) {
        this._chromaOffset = Math.sin(VisualEffects.getFrameCount() * 0.05) * 2;

        // 简化的色差效果 - 在边缘添加红/青色偏移
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.1;

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this._chromaOffset, 0, width, height);

        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-this._chromaOffset, 0, width, height);

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    };

    // 暴露到全局
    window.Sprite_ESCEffects = Sprite_ESCEffects;

    //=============================================================================
    // 通过 Spriteset_Map 添加效果层（更可靠的方式）
    //=============================================================================
    var _Spriteset_Map_createPictures = Spriteset_Map.prototype.createPictures;
    Spriteset_Map.prototype.createPictures = function() {
        _Spriteset_Map_createPictures.call(this);

        // 在图片层之后添加效果层
        try {
            this._escEffects = new Sprite_ESCEffects();
            this._effectsContainer = this._escEffects;
            this.addChild(this._escEffects);
            console.log('ESC Visual Effects layer created');
        } catch (e) {
            console.warn('ESC Visual Effects: Failed to create map effects layer', e);
        }
    };

    //=============================================================================
    // 全局CRT滤镜容器 - 解决场景切换闪烁问题
    //=============================================================================
    // 原理：创建一个固定的全局容器作为 Graphics._app.stage
    // 实际场景作为子元素添加到这个容器中
    // CRT滤镜应用到全局容器上，这样场景切换时滤镜不会丢失
    //=============================================================================

    var GlobalFilterContainer = {
        _rootContainer: null,    // 全局根容器
        _currentScene: null,     // 当前场景引用
        _initialized: false,

        // 初始化全局容器（只需调用一次）
        init: function() {
            if (this._initialized) return;

            try {
                // 检查 Graphics._app 是否可用
                if (!Graphics._app) {
                    console.warn('[ESC] Graphics._app not available yet');
                    return;
                }

                // 创建全局根容器
                this._rootContainer = new PIXI.Container();
                this._rootContainer.name = 'ESC_GlobalRootContainer';

                // 应用 CRT 滤镜到全局容器
                if (Config.enableCRTCurvature) {
                    var filter = CRTFilterManager.getFilter();
                    if (filter) {
                        this._rootContainer.filters = [filter];
                        console.log('[ESC] CRT Filter applied to global root container');
                    }
                }

                // 把全局容器设置为 stage
                Graphics._app.stage = this._rootContainer;

                this._initialized = true;
                console.log('[ESC] Global filter container initialized');
            } catch (e) {
                console.error('[ESC] Failed to initialize global filter container:', e);
            }
        },

        // 添加场景到全局容器
        addScene: function(scene) {
            if (!this._initialized || !this._rootContainer) {
                this.init();
            }

            if (this._rootContainer) {
                // 移除旧场景
                if (this._currentScene && this._rootContainer.children.indexOf(this._currentScene) >= 0) {
                    this._rootContainer.removeChild(this._currentScene);
                }

                // 添加新场景
                this._rootContainer.addChild(scene);
                this._currentScene = scene;
                console.log('[ESC] Scene added to global container: ' + scene.constructor.name);
            }
        },

        // 获取全局容器
        getContainer: function() {
            return this._rootContainer;
        },

        // 检查是否已初始化
        isInitialized: function() {
            return this._initialized;
        }
    };

    // 暴露到全局
    ESC.GlobalFilterContainer = GlobalFilterContainer;

    //=============================================================================
    // 覆盖 Graphics.setStage - 使用全局容器包装
    //=============================================================================
    var _ESC_Graphics_setStage = Graphics.setStage;
    Graphics.setStage = function(stage) {
        // 忽略 null/undefined 的场景（场景销毁时会传入 null）
        if (!stage) {
            return;
        }

        // 确保全局容器已初始化
        if (!GlobalFilterContainer.isInitialized()) {
            GlobalFilterContainer.init();
        }

        // 如果全局容器可用，把场景添加到它里面
        if (GlobalFilterContainer.isInitialized()) {
            GlobalFilterContainer.addScene(stage);
            // 注意：不需要调用原始的 setStage，因为我们已经把场景添加到全局容器了
            // 全局容器已经是 Graphics._app.stage
        } else {
            // 如果全局容器初始化失败，回退到原始行为
            _ESC_Graphics_setStage.call(this, stage);
        }
    };

    //=============================================================================
    // 场景创建时不再单独应用滤镜（已由全局容器处理）
    //=============================================================================
    var _ESC_VisualEffects_Scene_Map_create = Scene_Map.prototype.create;
    Scene_Map.prototype.create = function() {
        _ESC_VisualEffects_Scene_Map_create.call(this);
        // CRT滤镜现在由全局容器处理，不再需要单独应用到场景
        console.log('[ESC] Scene_Map created (CRT filter handled by global container)');
    };

    //=============================================================================
    // 地图色调效果
    //=============================================================================
    var _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);

        // 设置怪核色调
        try {
            this.applyDreamcoreTone();
        } catch (e) {
            console.warn('ESC Visual Effects: Failed to apply dreamcore tone', e);
        }
    };

    Scene_Map.prototype.applyDreamcoreTone = function() {
        // 低饱和度 + 轻微紫色偏移
        // R, G, B, Gray
        if ($gameScreen) {
            var tone = [0, -10, 10, -20];
            $gameScreen.startTint(tone, 60);
        }
    };

    //=============================================================================
    // UI风格 - 自定义窗口色调
    //=============================================================================
    var _Window_Base_initialize = Window_Base.prototype.initialize;
    Window_Base.prototype.initialize = function(rect) {
        _Window_Base_initialize.call(this, rect);

        // 应用怪核窗口风格
        this.applyDreamcoreStyle();
    };

    Window_Base.prototype.applyDreamcoreStyle = function() {
        // 半透明深紫灰背景
        this.backOpacity = 220;

        // 紫灰色调 - 与背包系统配色一致
        this.setTone(-10, -10, 10);
    };

    //=============================================================================
    // 标题画面效果
    //=============================================================================
    var _Scene_Title_create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function() {
        _Scene_Title_create.call(this);

        // 添加标题效果（扫描线、噪点等Canvas效果）
        try {
            this._escEffects = new Sprite_ESCEffects();
            this.addChild(this._escEffects);
            console.log('ESC Visual Effects: Title screen layer created');
        } catch (e) {
            console.warn('ESC Visual Effects: Failed to create effects layer', e);
        }

        // CRT滤镜现在由全局容器处理，不再需要单独应用到场景
        console.log('[ESC] Scene_Title created (CRT filter handled by global container)');

        // 应用标题色调（延迟执行，确保$gameScreen已初始化）
        if ($gameScreen) {
            $gameScreen.startTint([-10, -20, 10, -30], 0);
        }
    };

    //=============================================================================
    // 场景效果预设
    //=============================================================================
    var SceneEffects = {
        // 梦境大厅 - 更强的模糊和梦幻感
        applyDreamLobbyEffect: function() {
            Config.vignetteIntensity = 0.6;
            Config.flickerIntensity = 0.01;
            Config.noiseIntensity = 0.05;
            if ($gameScreen) {
                $gameScreen.startTint([10, -20, 20, -40], 60);
            }
        },

        // 关卡内 - 略带不安的效果
        applyLevelEffect: function() {
            Config.vignetteIntensity = 0.4;
            Config.flickerIntensity = 0;  // 正常关卡不闪烁
            Config.noiseIntensity = 0.08;
            if ($gameScreen) {
                $gameScreen.startTint([0, -10, 10, -20], 60);
            }
        },

        // 危险状态 - 更强的效果（闪烁仅在危险时出现）
        applyDangerEffect: function() {
            Config.vignetteIntensity = 0.7;
            Config.flickerIntensity = 0.03;  // 危险时轻微闪烁
            if ($gameScreen) {
                $gameScreen.startTint([20, -10, -10, -10], 30);
            }
        },

        // 撤离中 - 紧张效果
        applyExtractionEffect: function() {
            Config.flickerIntensity = 0.04;  // 撤离时轻微闪烁
            Config.scanlineOpacity = 0.25;
            if ($gameScreen) {
                $gameScreen.startTint([-10, 10, -10, -20], 30);
            }
        },

        // 恢复正常
        resetEffects: function() {
            Config.vignetteIntensity = 0.4;
            Config.flickerIntensity = 0;  // 默认关闭闪烁
            Config.scanlineOpacity = 0.2;
            Config.noiseIntensity = 0.08;
            if ($gameScreen) {
                $gameScreen.startTint([0, -10, 10, -20], 60);
            }
        }
    };

    ESC.SceneEffects = SceneEffects;
    // 保持向后兼容
    window.ESC_SceneEffects = SceneEffects;

    //=============================================================================
    // 注意：自动效果切换已禁用，请通过插件命令手动调用
    // SceneEffects.applyLevelEffect() 等方法在事件中调用
    //=============================================================================

    //=============================================================================
    // 插件命令
    //=============================================================================
    PluginManager.registerCommand(pluginName, 'setEffect', function(args) {
        var effect = args.effect;
        var value = parseFloat(args.value);
        VisualEffects.setEffectIntensity(effect, value);
    });

    PluginManager.registerCommand(pluginName, 'toggleEffect', function(args) {
        var effect = args.effect;
        var enabled = args.enabled === 'true';
        VisualEffects.toggleEffect(effect, enabled);
    });

    PluginManager.registerCommand(pluginName, 'applySceneEffect', function(args) {
        var scene = args.scene;
        switch(scene) {
            case 'dreamLobby':
                SceneEffects.applyDreamLobbyEffect();
                break;
            case 'level':
                SceneEffects.applyLevelEffect();
                break;
            case 'danger':
                SceneEffects.applyDangerEffect();
                break;
            case 'extraction':
                SceneEffects.applyExtractionEffect();
                break;
            case 'reset':
                SceneEffects.resetEffects();
                break;
        }
    });

    console.log('ESC_VisualEffects loaded successfully');
    console.log('[ESC Debug] Config: enableVHS=' + Config.enableVHS +
        ', enableNoise=' + Config.enableNoise +
        ', enableVignette=' + Config.enableVignette +
        ', enableCRTCurvature=' + Config.enableCRTCurvature +
        ', scanlineOpacity=' + Config.scanlineOpacity +
        ', crtCurvature=' + Config.crtCurvature +
        ', noiseIntensity=' + Config.noiseIntensity +
        ', vignetteIntensity=' + Config.vignetteIntensity);
})();
