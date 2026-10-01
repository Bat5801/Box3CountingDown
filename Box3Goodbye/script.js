// ===== 加载进度管理 =====
(function () {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('loader-percentage');
    const statusText = document.getElementById('loader-text');

    // 如果没有加载屏幕元素，直接返回
    if (!loadingScreen) return;

    let loadedCount = 0;
    const totalItems = { font: false, audio: false, images: false };
    const totalCategories = 3;

    function updateProgress(message) {
        const percent = Math.min(Math.round((loadedCount / totalCategories) * 100), 100);
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressText) progressText.textContent = percent + '%';
        if (statusText && message) statusText.textContent = message;
    }

    function checkAllLoaded(startTime) {
        if (loadedCount >= totalCategories) {
            const elapsed = Date.now() - startTime;
            const minDisplay = 800;

            if (statusText) statusText.textContent = '加载完成!';
            if (progressBar) progressBar.style.width = '100%';
            if (progressText) progressText.textContent = '100%';

            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    // 加载完成后尝试自动播放音乐
                    const bgMusic = document.getElementById('bgMusic');
                    const musicControl = document.getElementById('musicControl');
                    if (bgMusic && musicControl) {
                        bgMusic.play().then(() => {
                            musicControl.textContent = '❚❚';
                        }).catch(error => {
                            console.log('无法自动播放音乐:', error);
                            musicControl.textContent = '▶';
                        });
                    }
                }, 800);
            }, Math.max(0, minDisplay - elapsed));
        }
    }

    const startTime = Date.now();
    updateProgress('正在加载资源...');

    // 1. 字体加载
    if (document.fonts) {
        document.fonts.ready.then(() => {
            totalItems.font = true;
            loadedCount++;
            updateProgress('字体加载完成...');
            checkAllLoaded(startTime);
        }).catch(() => {
            totalItems.font = true;
            loadedCount++;
            updateProgress('字体加载完成...');
            checkAllLoaded(startTime);
        });
    } else {
        totalItems.font = true;
        loadedCount++;
        updateProgress('字体加载完成...');
        checkAllLoaded(startTime);
    }

    // 2. 音频加载
    const bgMusic = document.getElementById('bgMusic');
    function onAudioReady() {
        if (!totalItems.audio) {
            totalItems.audio = true;
            loadedCount++;
            updateProgress('音频加载完成...');
            checkAllLoaded(startTime);
        }
    }
    if (bgMusic) {
        if (bgMusic.readyState >= 3) {
            onAudioReady();
        } else {
            bgMusic.addEventListener('canplaythrough', onAudioReady);
            bgMusic.addEventListener('error', onAudioReady);
        }
    } else {
        onAudioReady();
    }

    // 3. 图片加载
    const images = document.querySelectorAll('img:not([aria-hidden])');
    let loadedImages = 0;
    const totalImgs = images.length;

    function onImageLoaded() {
        loadedImages++;
        updateProgress('正在加载图片...');
        if (loadedImages >= totalImgs) {
            totalItems.images = true;
            loadedCount++;
            updateProgress('图片加载完成...');
            checkAllLoaded(startTime);
        }
    }

    if (totalImgs === 0) {
        totalItems.images = true;
        loadedCount++;
        updateProgress('图片加载完成...');
        checkAllLoaded(startTime);
    } else {
        images.forEach(img => {
            if (img.complete) {
                onImageLoaded();
            } else {
                img.addEventListener('load', onImageLoaded);
                img.addEventListener('error', onImageLoaded);
            }
        });
    }
})();

// 双阶段倒计时功能
// 记录关服倒计时标题的原始文本（用于时钟回调后的状态恢复）
const shutdownTitleDefault = (function () {
    const el = document.getElementById('shutdown-countdown');
    return el ? el.querySelector('h3').textContent : null;
})();

function updateCountdowns() {
    const now = new Date();
    // 日期均显式指定北京时间（UTC+8）偏移，确保不受用户本地时区设置影响
    const zombieEndDate = new Date('2026-07-30T00:00:00+08:00');
    // 关服时间：北京时间 2026年10月8日 上午10:30
    const shutdownDate = new Date('2026-10-08T10:30:00+08:00');

    const zombieCountdown = document.getElementById('zombie-countdown');
    const shutdownCountdown = document.getElementById('shutdown-countdown');

    if (!zombieCountdown || !shutdownCountdown) return;

    if (now < zombieEndDate) {
        zombieCountdown.style.display = 'block';
        shutdownCountdown.style.display = 'none';

        const timeLeft = zombieEndDate - now;
        const daysElement = document.getElementById('zombie-days');
        const hoursElement = document.getElementById('zombie-hours');
        const minutesElement = document.getElementById('zombie-minutes');
        const secondsElement = document.getElementById('zombie-seconds');

        if (daysElement && hoursElement && minutesElement && secondsElement) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            daysElement.textContent = days.toString().padStart(3, '0');
            hoursElement.textContent = hours.toString().padStart(2, '0');
            minutesElement.textContent = minutes.toString().padStart(2, '0');
            secondsElement.textContent = seconds.toString().padStart(2, '0');
        }
    } else {
        zombieCountdown.style.display = 'none';
        shutdownCountdown.style.display = 'block';

        const timeLeft = shutdownDate - now;
        const countdownTitle = shutdownCountdown ? shutdownCountdown.querySelector('h3') : null;
        const countdownDisplay = shutdownCountdown ? shutdownCountdown.querySelector('.countdown-display') : null;
        // "关服前"标题：到达关服时间后自动隐藏，关服前保持显示（其余内容保留）
        const farewellHeading = document.getElementById('farewell-heading');
        if (farewellHeading) farewellHeading.style.display = timeLeft <= 0 ? 'none' : '';

        const daysElement = document.getElementById('shutdown-days');
        const hoursElement = document.getElementById('shutdown-hours');
        const minutesElement = document.getElementById('shutdown-minutes');
        const secondsElement = document.getElementById('shutdown-seconds');

        if (timeLeft <= 0) {
            if (countdownTitle && countdownDisplay) {
                countdownTitle.textContent = '神岛已关闭';
                countdownTitle.style.fontSize = '2.5em';
                countdownTitle.style.fontWeight = 'bold';
                countdownDisplay.style.display = 'none';
            }
        } else {
            // 关服前：确保标题与倒计时正常显示（防止时钟被回调后残留"已关闭"状态）
            if (countdownTitle && countdownDisplay && shutdownTitleDefault) {
                countdownTitle.textContent = shutdownTitleDefault;
                countdownTitle.style.fontSize = '';
                countdownTitle.style.fontWeight = '';
                countdownDisplay.style.display = '';
            }
            if (daysElement && hoursElement && minutesElement && secondsElement) {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                daysElement.textContent = days.toString().padStart(3, '0');
                hoursElement.textContent = hours.toString().padStart(2, '0');
                minutesElement.textContent = minutes.toString().padStart(2, '0');
                secondsElement.textContent = seconds.toString().padStart(2, '0');
            }
        }
    }
}




// 像素粒子效果
function createPixelParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: #666666;
        pointer-events: none;
        z-index: 999;
        animation: pixelFloat 2s ease-out forwards;
    `;

    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 2000);
}

// 添加像素浮动动画
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes pixelFloat {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-50px) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyle);

// 鼠标点击生成像素粒子
document.addEventListener('click', (e) => {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createPixelParticle(
                e.clientX + (Math.random() - 0.5) * 20,
                e.clientY + (Math.random() - 0.5) * 20
            );
        }, i * 50);
    }
});

// 落叶效果
function createLeaves() {
    const container = document.getElementById('leafContainer');
    if (!container) return;

    const leafCount = 15;
    for (let i = 0; i < leafCount; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'falling-leaf';
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.animationDuration = (8 + Math.random() * 10) + 's';
        leaf.style.animationDelay = Math.random() * 12 + 's';
        leaf.style.width = (8 + Math.random() * 8) + 'px';
        leaf.style.height = leaf.style.width;
        leaf.style.opacity = 0.3 + Math.random() * 0.4;
        container.appendChild(leaf);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化双阶段倒计时
    updateCountdowns();
    setInterval(updateCountdowns, 1000);

    // 初始化落叶
    createLeaves();

    // 添加欢迎动画
    const container = document.querySelector('.pixel-container');
    container.style.animation = 'pixelFadeIn 1s ease-out';

    // 音乐控制按钮点击事件
    const musicControl = document.getElementById('musicControl');
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic && musicControl) {
        musicControl.addEventListener('click', function () {
            if (bgMusic.paused) {
                bgMusic.play();
                musicControl.textContent = '❚❚';
            } else {
                bgMusic.pause();
                musicControl.textContent = '▶';
            }
        });
    }


});

// 添加提示动画
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes pixelNotification {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        10% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        90% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(notificationStyle);

// 添加淡入动画
const fadeInStyle = document.createElement('style');
fadeInStyle.textContent = `
    @keyframes pixelFadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(fadeInStyle);