'use strict';

function MiniDeck(slides, progressBar) {
    this.slides = [].slice.call(slides); // convert NodeList to Array
    this.slides.forEach(function (slide) {
        slide.classList.add('md-slide');
        slide.innerHTML = `<div class="md-wrapper">${slide.innerHTML}</div>`;
    });

    // listen for DOM events
    document.addEventListener('keydown', this._onKeyDown.bind(this));
    window.addEventListener('hashchange', this._onHashChange.bind(this));

    Object.defineProperties(this, {
        currentSlide: {
            get: function () { return this.slides[this.currentIndex]; }
        },
        currentStep: {
            get: function () {
                return this.slides[this.currentIndex]
                    .steps[this.currentStepIndex];
            }
        }
    });

    // reset progress bar, if available
    if (progressBar) {
        this.progressBar = progressBar;
        this.progressBar.max = this.slides.length;
        this.progressBar.value = 0;
        this.progressBar.classList.add('md-progress');
    }

    this.currentStepIndex = -1;
    this.currentIndex = -1;
    this.showSlide(this._getIndexFromHash() || this.currentIndex);
}

MiniDeck.KEYCODES = {
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    SPACE: 32
};

//
// navigation between slides
//

// NOTE: slides are indexed from 0 to length
MiniDeck.prototype.showSlide = function (index) {
    // clamp index so it stays within bounds
    index = Math.min(Math.max(0, index), this.slides.length - 1);

    // exit if we are not really changing the slide
    // NOTE: this happens when we update the hash from this very function
    if (index === this.currentIndex) { return; }

    this._disableIframes();

    this.currentIndex = index;
    this.currentStepIndex = -1;
    window.location.hash = `#${this.currentIndex + 1}`;

    // remove the 'current' class marker from any other slide
    this.slides.forEach(function (slide) {
        slide.classList.remove('md-current');
    });

    // restore current slide
    this.currentSlide.classList.add('md-current');
    this.currentSlide.steps = this._getStepsForSlide(this.currentSlide);
    this.currentSlide.steps.forEach(function (step) {
        step.classList.remove('md-step-current', 'md-step-active');
    });
    this._enableIframesForSlide(this.currentIndex);

    // update progress bar
    if (this.progressBar) {
        this.progressBar.value = this.currentIndex + 1;
    }
};

MiniDeck.prototype.showNextSlide = function () {
    if (this.currentIndex + 1 < this.slides.length) {
        this.showSlide(this.currentIndex + 1);
    }
};

MiniDeck.prototype.showPreviousSlide = function () {
    if (this.currentIndex > 0) {
        this.showSlide(this.currentIndex - 1);
    }
};

MiniDeck.prototype._onHashChange = function (evt) {
    evt.preventDefault();
    this.showSlide(this._getIndexFromHash());
};

MiniDeck.prototype._getIndexFromHash = function () {
    let hash = parseInt(window.location.hash.substr(1), 10);
    return hash ? hash - 1 : null;
};


//
// navigation between slides' steps
//

MiniDeck.prototype.advanceStep = function () {
    if (this.currentStepIndex + 1 < this.currentSlide.steps.length) {
        // remove .current from the previous step, if it exists
        if (this.currentStepIndex >= 0) {
            this.currentStep.classList.remove('md-step-current');
        }
        // update the current step and its properties
        this.currentStepIndex += 1;
        this.currentStep.classList.add('md-step-current', 'md-step-active');
    }
    else { // all steps are done, go to the next slide
        this.showNextSlide();
    }
};

MiniDeck.prototype.goBackStep = function () {
    if (this.currentStepIndex >= 0) {
        this.currentStep.classList.remove('md-step-active', 'md-step-current');
        // update the (new) current step
        this.currentStepIndex -= 1;
        this.currentStep.classList.add('md-step-current');
    }
};

// returns the steps within the current slide
MiniDeck.prototype._getStepsForSlide = function (slide) {
    return [].slice.call(slide.querySelectorAll('.md-step'));
};

//
// iframe handling
// NOTE: this is to avoid having all iframes partying hard at the same time
//

MiniDeck.prototype._disableIframes = function () {
    // for disabling iframes, we remove their SRC attribute and store it
    // somewhere else so we can load them later
    // TODO: find a away to actually WIPE OUT third-party iframes content
    // without getting rid of the iframe element itself
    this.slides.forEach(function (slide) {
        let iframes = slide.querySelectorAll('iframe');
        for (let i = 0; i < iframes.length; i++) {
            let iframe = iframes[i];
            if (iframe.src) {
                iframe.dataset.src = iframe.src;
                iframe.removeAttribute('src');
                iframe.contentWindow.location.reload();
            }
        }
    });
};


MiniDeck.prototype._enableIframesForSlide = function (index) {
    let iframes = this.slides[index].querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
        let iframe = iframes[i];
        iframe.src = iframe.dataset.src;
    }
};


//
// events binding
//

MiniDeck.prototype._onKeyDown = function (evt) {
    // guard against modifier keys
    if (evt.metaKey || evt.shiftKey || evt.ctrlKey || evt.altKey) { return; }

    switch(evt.keyCode) {
        case MiniDeck.KEYCODES.LEFT:
            evt.preventDefault();
            this.showPreviousSlide();
            break;
        case MiniDeck.KEYCODES.RIGHT:
            evt.preventDefault();
            this.showNextSlide();
            break;
        case MiniDeck.KEYCODES.SPACE:
        case MiniDeck.KEYCODES.DOWN:
            evt.preventDefault();
            this.advanceStep();
            break;
        case MiniDeck.KEYCODES.UP:
            evt.preventDefault();
            this.goBackStep();
            break;
    }
};
