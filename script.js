class ImageSlider {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 11;
        this.isAnimating = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
        
        this.init();
    }
    
    init() {
        this.slides = document.querySelector('.slides');
        this.indicators = document.querySelectorAll('.indicator');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentSlideElement = document.getElementById('currentSlide');
        this.totalSlidesElement = document.getElementById('totalSlides');
        
        this.setupEventListeners();
        this.preloadImages();
        this.updateCounter();
    }
    
    setupEventListeners() {
        // 버튼 이벤트
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // 인디케이터 이벤트
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // 터치 이벤트
        this.slides.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.slides.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.slides.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // 마우스 휠 이벤트 (데스크톱용)
        this.slides.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        // 리사이즈 이벤트
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.slides.style.transition = 'none';
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        this.touchEndX = e.touches[0].clientX;
        this.touchEndY = e.touches[0].clientY;
        
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = Math.abs(this.touchEndY - this.touchStartY);
        
        // 수직 스크롤 방지
        if (Math.abs(deltaX) > deltaY) {
            const currentTransform = this.currentSlide * -9.09;
            const dragPercentage = (deltaX / window.innerWidth) * 9.09;
            const newTransform = currentTransform + dragPercentage;
            
            this.slides.style.transform = `translateX(${newTransform}%)`;
        }
    }
    
    handleTouchEnd(e) {
        this.slides.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)';
        
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = Math.abs(this.touchEndY - this.touchStartY);
        
        // 수평 스와이프인 경우에만 처리
        if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > this.minSwipeDistance) {
            if (deltaX > 0) {
                this.previousSlide();
            } else {
                this.nextSlide();
            }
        } else {
            // 스와이프가 충분하지 않으면 원래 위치로 복귀
            this.updateSlidePosition();
        }
        
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
    }
    
    handleKeydown(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSlide();
                break;
            case ' ':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides - 1);
                break;
        }
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        if (this.isAnimating) return;
        
        if (e.deltaY > 0) {
            this.nextSlide();
        } else {
            this.previousSlide();
        }
    }
    
    handleResize() {
        this.updateSlidePosition();
    }
    
    nextSlide() {
        if (this.isAnimating) return;
        
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlide();
    }
    
    previousSlide() {
        if (this.isAnimating) return;
        
        this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.updateSlide();
    }
    
    goToSlide(index) {
        if (this.isAnimating || index === this.currentSlide) return;
        
        this.currentSlide = index;
        this.updateSlide();
    }
    
    updateSlide() {
        this.isAnimating = true;
        
        this.updateSlidePosition();
        this.updateIndicators();
        this.updateCounter();
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    }
    
    updateSlidePosition() {
        const translateX = this.currentSlide * -9.09;
        this.slides.style.transform = `translateX(${translateX}%)`;
    }
    
    updateIndicators() {
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }
    
    updateCounter() {
        this.currentSlideElement.textContent = this.currentSlide + 1;
        this.totalSlidesElement.textContent = this.totalSlides;
    }
    
    preloadImages() {
        const images = document.querySelectorAll('.slide img');
        images.forEach((img, index) => {
            const imageObj = new Image();
            imageObj.onload = () => {
                img.classList.add('loaded');
            };
            imageObj.onerror = () => {
                // 이미지 로딩 실패시 플레이스홀더 표시
                img.src = this.createPlaceholder(400, 300, `이미지 ${index + 1}`);
                img.classList.add('loaded');
            };
            imageObj.src = img.src;
        });
    }
    
    createPlaceholder(width, height, text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        
        // 배경
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, width, height);
        
        // 텍스트
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, width / 2, height / 2);
        
        return canvas.toDataURL();
    }
    
    // 자동 슬라이드 기능 (옵션)
    startAutoSlide(interval = 3000) {
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, interval);
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// 페이지 로드 완료 후 슬라이더 초기화
document.addEventListener('DOMContentLoaded', () => {
    const slider = new ImageSlider();
    
    // 자동 슬라이드 시작 (옵션 - 주석 해제하여 사용)
    // slider.startAutoSlide(4000);
    
    // 포커스 잃을 때 자동 슬라이드 중지, 포커스 얻을 때 재시작
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            slider.stopAutoSlide();
        } else {
            // slider.startAutoSlide(4000);
        }
    });
});

// 에러 처리 및 로깅
window.addEventListener('error', (e) => {
    console.error('이미지 슬라이더 에러:', e.error);
});

// 모바일 뷰포트 높이 조정
function setMobileViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', setMobileViewportHeight);
window.addEventListener('orientationchange', setMobileViewportHeight);
setMobileViewportHeight();