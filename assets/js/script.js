document.addEventListener('DOMContentLoaded', function() {
    const roomCards = document.querySelectorAll('.hostel-residence-room-card');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreContainer = document.getElementById('load-more-container');
    const initialCardsToShow = window.innerWidth <= 992 ? 8 : 9;
    let currentLimit = initialCardsToShow;
    let currentMatchedCards = Array.from(roomCards);

    function updateVisibleRooms() {
        let visibleCount = 0;
        
        // Hide all first
        roomCards.forEach(card => {
            const col = card.closest('.col-lg-4');
            if (col) col.style.display = 'none';
        });

        // Show matched up to limit
        currentMatchedCards.forEach((card, index) => {
            const col = card.closest('.col-lg-4');
            if (col && index < currentLimit) {
                col.style.display = 'block';
                visibleCount++;
            }
        });

        // Update Load More button
        if (loadMoreBtn && loadMoreContainer) {
            const remaining = currentMatchedCards.length - visibleCount;
            if (remaining > 0) {
                loadMoreContainer.style.display = 'block';
                loadMoreBtn.innerText = `Show ${Math.min(24, remaining)} more of ${currentMatchedCards.length} rooms`;
            } else {
                loadMoreContainer.style.display = 'none';
            }
        }
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            currentLimit += 24;
            updateVisibleRooms();
        });
    }

    // --- Slider Logic ---
    const slider = document.querySelector('.hostel-residence-budget-slider');
    if (slider) {
        const track = slider.querySelector('.slider-track');
        const range = slider.querySelector('.slider-range');
        const leftHandle = slider.querySelector('.slider-handle.left');
        const rightHandle = slider.querySelector('.slider-handle.right');

        const values = [75000, 100000, 125000, 150000, 175000, 200000, 350000];
        const maxIndex = values.length - 1;
        let leftPercent = 0;
        let rightPercent = 100;

        function getPriceFromPercent(percent) {
            let p = percent / 100;
            let indexFloat = p * maxIndex;
            let lowerIndex = Math.floor(indexFloat);
            let upperIndex = Math.ceil(indexFloat);
            
            if (lowerIndex === upperIndex) {
                return values[lowerIndex];
            }
            
            let fraction = indexFloat - lowerIndex;
            return values[lowerIndex] + fraction * (values[upperIndex] - values[lowerIndex]);
        }

        function updateSliderDOM() {
            leftHandle.style.left = leftPercent + '%';
            rightHandle.style.left = rightPercent + '%';

            range.style.left = leftPercent + '%';
            range.style.right = (100 - rightPercent) + '%';
            
            filterRooms();
        }

        function parsePrice(text) {
            return parseInt(text.replace(/[^0-9]/g, ''), 10);
        }
        const filterRadios = document.querySelectorAll('input[type="radio"][name="hostel_for"], input[type="radio"][name="cooling"], input[type="radio"][name="washroom"], input[type="radio"][name="sharing"]');
        
        filterRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                filterRooms();
            });
        });

        const clearFiltersBtn = document.querySelector('.hostel-residence-clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Uncheck all radios
                filterRadios.forEach(radio => radio.checked = false);
                
                // Uncheck booking checkbox
                const bookingCheckbox = document.getElementById('open-for-booking-checkbox');
                if (bookingCheckbox) bookingCheckbox.checked = false;
                
                // Reset slider
                leftPercent = 0;
                rightPercent = 100;
                updateSliderDOM(); // This will also call filterRooms()
            });
        }

        function filterRooms() {
            const minPrice = getPriceFromPercent(leftPercent);
            const maxPrice = getPriceFromPercent(rightPercent);

            // Get selected radio values
            const selectedHostelFor = document.querySelector('input[name="hostel_for"]:checked')?.value;
            const selectedCooling = document.querySelector('input[name="cooling"]:checked')?.value;
            const selectedWashroom = document.querySelector('input[name="washroom"]:checked')?.value;
            const selectedSharing = document.querySelector('input[name="sharing"]:checked')?.value;

            currentMatchedCards = [];
            roomCards.forEach(card => {
                const priceEl = card.querySelector('.hostel-residence-room-price strong');
                if (!priceEl) return;
                
                const price = parsePrice(priceEl.textContent);
                if (price < minPrice || price > maxPrice) return;

                // Check radio filters
                if (selectedHostelFor && (!card.dataset.hostelFor || !card.dataset.hostelFor.includes(selectedHostelFor))) return;
                if (selectedCooling && card.dataset.cooling !== selectedCooling) return;
                if (selectedWashroom && card.dataset.washroom !== selectedWashroom) return;
                if (selectedSharing && card.dataset.sharing !== selectedSharing) return;

                currentMatchedCards.push(card);
            });
            
            currentLimit = initialCardsToShow; // reset limit when filter changes
            updateVisibleRooms();
        }


        let isDragging = false;
        let currentHandle = null;

        function handleDown(e, handle) {
            if (e.cancelable) e.preventDefault();
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
            let percent = ((clientX - rect.left) / rect.width) * 100;
            percent = Math.max(0, Math.min(100, percent));

            if (currentHandle === leftHandle) {
                if (percent <= rightPercent) {
                    leftPercent = percent;
                } else {
                    leftPercent = rightPercent;
                }
            } else if (currentHandle === rightHandle) {
                if (percent >= leftPercent) {
                    rightPercent = percent;
                } else {
                    rightPercent = leftPercent;
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

        // Dynamic Histogram Logic
        const bars = slider.parentElement.querySelectorAll('.hostel-residence-bar');
        if (bars.length === 6) {
            let counts = [0, 0, 0, 0, 0, 0];
            
            roomCards.forEach(card => {
                const priceEl = card.querySelector('.hostel-residence-room-price strong');
                if (priceEl) {
                    const price = parsePrice(priceEl.textContent);
                    if (price >= 75000 && price < 100000) counts[0]++;
                    else if (price >= 100000 && price < 125000) counts[1]++;
                    else if (price >= 125000 && price < 150000) counts[2]++;
                    else if (price >= 150000 && price < 175000) counts[3]++;
                    else if (price >= 175000 && price < 200000) counts[4]++;
                    else if (price >= 200000 && price <= 350000) counts[5]++;
                }
            });

            const maxCount = Math.max(...counts, 1);
            bars.forEach((bar, index) => {
                const heightPercent = (counts[index] / maxCount) * 100;
                bar.style.height = Math.max(heightPercent, 5) + '%'; // Minimum 5% height
            });
        }

        updateSliderDOM();
    } else {
        updateVisibleRooms();
    }
});


    // Initialize Slick Slider
    if (window.jQuery && $('.hostel-residence-amenities-slider').length) {
        var $slider = $('.hostel-residence-amenities-slider');
        var $progressBar = $('.hostel-residence-slider-progress-bar');
        
        $slider.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
            var calc = ( (nextSlide) / (slick.slideCount - slick.options.slidesToShow) ) * 100;
            if(calc > 100) calc = 100;
            if(calc < 0) calc = 0;
            if (slick.options.slidesToShow >= slick.slideCount) calc = 100;
            $progressBar.css('width', calc + '%');
        });

        $slider.slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            arrows: true,
            prevArrow: $('.hostel-residence-slider-prev'),
            nextArrow: $('.hostel-residence-slider-next'),
            dots: false,
            infinite: false,
            responsive: [
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
        
        // Initial progress bar width
        var slickObj = $slider.slick('getSlick');
        if(slickObj.slideCount <= slickObj.options.slidesToShow) {
            $progressBar.css('width', '100%');
        } else {
            $progressBar.css('width', (1 / (slickObj.slideCount - slickObj.options.slidesToShow + 1)) * 100 + '%');
        }
    }

    // Initialize Security Slider
    if (window.jQuery && $('.hostel-residence-security-slider').length) {
        var $securitySlider = $('.hostel-residence-security-slider');
        var $securityProgressBar = $('.hostel-security-slider-progress-bar');
        
        $securitySlider.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
            var calc = ( (nextSlide) / (slick.slideCount - slick.options.slidesToShow) ) * 100;
            if(calc > 100) calc = 100;
            if(calc < 0) calc = 0;
            if (slick.options.slidesToShow >= slick.slideCount) calc = 100;
            $securityProgressBar.css('width', calc + '%');
        });

        $securitySlider.slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            arrows: true,
            prevArrow: $('.hostel-residence-security-slider-prev'),
            nextArrow: $('.hostel-residence-security-slider-next'),
            dots: false,
            infinite: false,
            responsive: [
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 2
                    }
                },
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
        
        // Initial progress bar width
        var securitySlickObj = $securitySlider.slick('getSlick');
        if(securitySlickObj.slideCount <= securitySlickObj.options.slidesToShow) {
            $securityProgressBar.css('width', '100%');
        } else {
            $securityProgressBar.css('width', (1 / (securitySlickObj.slideCount - securitySlickObj.options.slidesToShow + 1)) * 100 + '%');
        }
    }
// FAQ Accordion Logic
const detailsElements = document.querySelectorAll('.hostel-residence-faq-details');

if (detailsElements.length > 0) {
    detailsElements.forEach((detail) => {
        const summary = detail.querySelector('.hostel-residence-faq-summary');
        if (summary) {
            summary.addEventListener('click', (e) => {
                e.preventDefault();
                if (detail.hasAttribute('open')) {
                    detail.classList.add('closing');
                    setTimeout(() => {
                        detail.removeAttribute('open');
                        detail.classList.remove('closing');
                    }, 300);
                } else {
                    // Close other open details
                    detailsElements.forEach((otherDetail) => {
                        if (otherDetail !== detail && otherDetail.hasAttribute('open')) {
                            otherDetail.classList.add('closing');
                            setTimeout(() => {
                                otherDetail.removeAttribute('open');
                                otherDetail.classList.remove('closing');
                            }, 300);
                        }
                    });
                    detail.setAttribute('open', '');
                }
            });
        }
    });
}

// FAQ View More Logic
const viewMoreBtn = document.getElementById('faq-view-more-btn');
const hiddenFaqs = document.querySelectorAll('.faq-hidden-item');

if (viewMoreBtn) {
    viewMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        let isHidden = false;
        hiddenFaqs.forEach((faq) => {
            if (faq.classList.contains('d-none')) {
                faq.classList.remove('d-none');
                isHidden = true;
            } else {
                faq.classList.add('d-none');
                faq.removeAttribute('open');
            }
        });
        if (isHidden) {
            viewMoreBtn.innerHTML = 'View less &uarr;';
        } else {
            viewMoreBtn.innerHTML = 'View more &darr;';
        }
    });
}



// Hostel Booking Section logic
function updateBookingProgress(percentage) {
    var progressBar = document.getElementById('booking-timeline-progress');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }

    var tabs = document.querySelectorAll('#booking-tabs .nav-link');
    var activeIndex = 0;
    if (percentage === 33) activeIndex = 1;
    else if (percentage === 66) activeIndex = 2;
    else if (percentage === 100) activeIndex = 3;

    tabs.forEach(function(tab, index) {
        if (index < activeIndex) {
            tab.classList.add('completed');
            tab.classList.remove('active');
        } else if (index === activeIndex) {
            tab.classList.remove('completed');
            tab.classList.add('active');
        } else {
            tab.classList.remove('completed', 'active');
        }
    });

    var panes = document.querySelectorAll('.hostel-residence-booking-step-pane');
    panes.forEach(function(pane) {
        pane.classList.remove('show', 'active');
    });

    var activePanes = document.querySelectorAll('.hostel-residence-booking-step' + (activeIndex + 1) + '-pane');
    activePanes.forEach(function(pane) {
        pane.classList.add('active');
        setTimeout(function() {
            pane.classList.add('show');
        }, 30);
    });
}

function goToNextBookingStep(currentStepIndex) {
    // currentStepIndex is 0-indexed if we want, but the HTML passes 1, 2, 3
    var nextIndex = currentStepIndex + 1;
    var nextTabBtn = document.getElementById('booking-step' + nextIndex + '-tab');
    if (nextTabBtn) {
        var percentages = [0, 33, 66, 100];
        updateBookingProgress(percentages[currentStepIndex]);
    }
}