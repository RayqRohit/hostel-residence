document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.hostel-residence-budget-slider');
    if (!slider) return;

    const track = slider.querySelector('.slider-track');
    const range = slider.querySelector('.slider-range');
    const leftHandle = slider.querySelector('.slider-handle.left');
    const rightHandle = slider.querySelector('.slider-handle.right');
    const roomCards = document.querySelectorAll('.hostel-residence-room-card');

    const values = [75000, 100000, 125000, 150000, 175000, 200000, 350000];
    const maxIndex = values.length - 1;
    let leftIndex = 0;
    let rightIndex = maxIndex;

    function updateSliderDOM() {
        const leftPercent = (leftIndex / maxIndex) * 100;
        const rightPercent = (rightIndex / maxIndex) * 100;

        leftHandle.style.left = leftPercent + '%';
        rightHandle.style.left = rightPercent + '%';

        range.style.left = leftPercent + '%';
        range.style.right = (100 - rightPercent) + '%';
        
        filterRooms();
    }

    function parsePrice(text) {
        return parseInt(text.replace(/[^0-9]/g, ''), 10);
    }

    function filterRooms() {
        const minPrice = values[leftIndex];
        const maxPrice = values[rightIndex];

        roomCards.forEach(card => {
            const priceEl = card.querySelector('.hostel-residence-room-price strong');
            if (priceEl) {
                const price = parsePrice(priceEl.textContent);
                const col = card.closest('.col-lg-4');
                if (col) {
                    if (price >= minPrice && price <= maxPrice) {
                        col.style.display = 'block';
                    } else {
                        col.style.display = 'none';
                    }
                }
            }
        });
    }

    let isDragging = false;
    let currentHandle = null;

    function handleDown(e, handle) {
        isDragging = true;
        currentHandle = handle;
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleUp);
    }

    function handleMove(e) {
        if (!isDragging || !currentHandle) return;
        e.preventDefault();

        const rect = track.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));

        const closestIndex = Math.round(percent * maxIndex);

        if (currentHandle === leftHandle) {
            if (closestIndex <= rightIndex) {
                leftIndex = closestIndex;
            }
        } else if (currentHandle === rightHandle) {
            if (closestIndex >= leftIndex) {
                rightIndex = closestIndex;
            }
        }
        updateSliderDOM();
    }

    function handleUp() {
        isDragging = false;
        currentHandle = null;
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleUp);
    }

    leftHandle.addEventListener('mousedown', (e) => handleDown(e, leftHandle));
    leftHandle.addEventListener('touchstart', (e) => handleDown(e, leftHandle));

    rightHandle.addEventListener('mousedown', (e) => handleDown(e, rightHandle));
    rightHandle.addEventListener('touchstart', (e) => handleDown(e, rightHandle));

    updateSliderDOM();
});
