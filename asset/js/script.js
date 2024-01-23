document.addEventListener("DOMContentLoaded", function () {
    const wrapper = document.querySelector(".wrapper");
    const carousel = document.getElementById("carousel");
    const iframeContainer = document.querySelector('.play_game_container iframe');
    const arrowBtns = document.querySelectorAll(".wrapper i");

    let isDragging = false, isAutoPlay = true, startX, startScrollLeft, timeoutId;
    let cardPerView = 8;

    const initializeCardSlider = (data) => {
        data.forEach(game => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.style.backgroundImage = `url('${game.image}')`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';

            const linkContainer = document.createElement('div');
            linkContainer.classList.add('link-container'); // Added a class for styling
            linkContainer.style.textAlign = 'center';

            const title = document.createElement('h2');
            title.classList.add('text-center');
            title.textContent = game.title;

            // Add description element
            const description = document.createElement('p');
            description.style.background = 'transparent';
            description.textContent = game.description; // Add a description property to your JSON data

            const link = document.createElement('a');
            link.style.textDecoration = 'none';
            link.style.textAlign = 'center';
            link.style.color = '#fff';
            link.href = game.link;

            linkContainer.appendChild(title);
            linkContainer.appendChild(description); // Append description element
            card.appendChild(linkContainer);
            carousel.appendChild(card);

            card.addEventListener('click', () => {
                iframeContainer.src = game.link;
            });
        });

        // Insert copies of the last few cards to the beginning of carousel for infinite scrolling
        [...carousel.children].slice(-cardPerView).reverse().forEach(card => {
            carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
        });

        // Insert copies of the first few cards to the end of carousel for infinite scrolling
        [...carousel.children].slice(0, cardPerView).forEach(card => {
            carousel.insertAdjacentHTML("beforeend", card.outerHTML);
        });

        // Scroll the carousel to the appropriate position to hide the first few duplicate cards on Firefox
        carousel.classList.add("no-transition");
        carousel.scrollLeft = carousel.offsetWidth;
        carousel.classList.remove("no-transition");
    };

    // Fetch JSON data
    fetch('./games.json')
        .then(response => response.json())
        .then(data => {
            initializeCardSlider(data); // Call the initialization function with the fetched data
            autoPlay(); // Start autoplay after initializing the cards
        })
        .catch(error => console.error('Error fetching data:', error));

    arrowBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            carousel.scrollLeft += btn.id == "left" ? -carousel.offsetWidth : carousel.offsetWidth;
        });
    });

    const dragStart = (e) => {
        isDragging = true;
        carousel.classList.add("dragging");
        startX = e.pageX;
        startScrollLeft = carousel.scrollLeft;
    };

    const dragging = (e) => {
        if (!isDragging) return;
        carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
    };

    const dragStop = () => {
        isDragging = false;
        carousel.classList.remove("dragging");
    };

    const infiniteScroll = () => {
        if (carousel.scrollLeft === 0) {
            carousel.classList.add("no-transition");
            carousel.scrollLeft = carousel.scrollWidth - (2 * carousel.offsetWidth);
            carousel.classList.remove("no-transition");
        } else if (Math.ceil(carousel.scrollLeft) === carousel.scrollWidth - carousel.offsetWidth) {
            carousel.classList.add("no-transition");
            carousel.scrollLeft = carousel.offsetWidth;
            carousel.classList.remove("no-transition");
        }

        clearTimeout(timeoutId);
        if (!wrapper.matches(":hover")) autoPlay();
    };

    const autoPlay = () => {
        if (window.innerWidth < 800 || !isAutoPlay) return;
        timeoutId = setTimeout(() => carousel.scrollLeft += carousel.offsetWidth, 1500);
    };

    carousel.addEventListener("mousedown", dragStart);
    carousel.addEventListener("mousemove", dragging);
    document.addEventListener("mouseup", dragStop);
    carousel.addEventListener("scroll", infiniteScroll);
    wrapper.addEventListener("mouseenter", () => clearTimeout(timeoutId));
    wrapper.addEventListener("mouseleave", autoPlay);
});
