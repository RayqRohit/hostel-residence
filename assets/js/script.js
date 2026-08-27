document.addEventListener("DOMContentLoaded", function() {
    const roomCards = document.querySelectorAll('.hostel-residence-room-card');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const initialCardsToShow = 6;

    // Helper to get the column wrapper of a card
    function getCardCol(card) {
        return card.closest('.col-lg-4');
    }

    // Initially hide cards beyond the initial limit
    roomCards.forEach((card, index) => {
        const col = getCardCol(card);
        if (col) {
            if (index >= initialCardsToShow) {
                col.style.display = 'none';
            }
        }
    });

    // Check if we need to hide the button initially
    if (roomCards.length <= initialCardsToShow) {
        if(loadMoreBtn) {
            const container = document.getElementById('load-more-container');
            if (container) container.style.display = 'none';
        }
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Show all hidden cards
            roomCards.forEach((card, index) => {
                const col = getCardCol(card);
                if (col && index >= initialCardsToShow) {
                    col.style.display = 'block'; // Reset display to show
                }
            });
            
            // Hide the button after showing all
            const container = document.getElementById('load-more-container');
            if (container) {
                container.style.display = 'none';
            } else {
                this.style.display = 'none';
            }
        });
    }

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
});
