//? Global Selectors and Varaiables
const colorDivs  = document.querySelectorAll('.color');
const colorHexes = document.querySelectorAll('.color h2');
const sliders = document.querySelectorAll('input[type="range"]');
const generateBtn  = document.querySelector('.generate');
const copyPopup = document.querySelector('.copy-container');
const adjustBtn = document.querySelectorAll('.adjust-btn');
const sliderContainer = document.querySelectorAll('.sliders');
const closeSlidersBtn = document.querySelectorAll('.close-sliders');
const lockBtn = document.querySelectorAll('.lock-btn');
let initialColors;

//* For Local Storage
let savedPalettes = [];

//? Event Listeners
generateBtn.addEventListener('click', randomColors);

sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
});

colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateTextUI(index);
    });
});

colorHexes.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex);
    });
});

copyPopup.addEventListener('transitionend', () => {
    const popup = copyPopup.children[0];
    copyPopup.classList.remove('active');
    popup.classList.remove('active');
});

adjustBtn.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        openSliders(index);
    });
});

closeSlidersBtn.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        closeSliders(index);
    });
});

lockBtn.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
        toggleLockBtn(e, index)
    });
});

//? Functions
function generateHexes() {
    const colorHex = chroma.random();
    return colorHex;
};

function randomColors() {
    initialColors = [];
    colorDivs.forEach((div, index) => {
        const randomColor = generateHexes();
        const hexText = div.children[0];

        //* Add it to the array
        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            return
        } else {
            initialColors.push(randomColor.hex());   
        };
    
        //* Add the colors to the bg
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;

        //* Check Contrast
        checkContrast(randomColor, hexText);

        //*Colorize the sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color, hue, brightness, saturation);
    });
    //* Check Contrast for Adjust & Lock btn
    adjustBtn.forEach((btn, index) => {
        checkContrast(initialColors[index], btn);
        checkContrast(initialColors[index], lockBtn[index]);
    });
    //* Reset Inputs
    resetInputs();
};

function checkContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = 'black';
    } else {
        text.style.color = 'white';
    }
};

function colorizeSliders(color, hue, brightness, saturation) {
    //* Scale Saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    //* Scale Brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, 'white']);

    //* Add the sliders color
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
};

function hslControls(e) {
    const index = 
    e.target.getAttribute('data-hue') ||
    e.target.getAttribute('data-bright') ||
    e.target.getAttribute('data-sat');
    // 
    const sliders = e.target.parentElement.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    //
    const bgColor = initialColors[index];
    // 
    const color = chroma(bgColor)
    .set('hsl.h', hue.value)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value);
    // 
    colorDivs[index].style.backgroundColor = color;

    //* Changes the color whenever you move the sliders
    colorizeSliders(color, hue, brightness, saturation);
};

function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const hexText = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    hexText.innerText = color.hex();

    //* Check Contrast
    checkContrast(color, hexText);
    for(icon of icons) {
        checkContrast(color, icon);
    };
};

function resetInputs() {
    const sliders  = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if (slider.name === 'hue') {
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        };

        if (slider.name === 'saturation') {
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
        };

        if (slider.name === 'brightness') {
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[1];
            slider.value = Math.floor(brightValue * 100) / 100;
        };
    });
};

function copyToClipboard(hex) {
    const element = document.createElement('textarea');
    element.value = hex.innerText;
    document.body.appendChild(element);
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);

    //* For the transition
    const popup = copyPopup.children[0];
    copyPopup.classList.add('active');
    popup.classList.add('active');
}

function openSliders(index) {
    sliderContainer[index].classList.toggle('active');
};

function closeSliders(index) {
    sliderContainer[index].classList.remove('active');
};

function toggleLockBtn(e, index) {
    const lockSVG = e.target.children[0];
    const activeDiv = colorDivs[index];
    activeDiv.classList.toggle('locked');
    // 
    if (lockSVG.classList.contains('fa-lock-open')) {
        e.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
        e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    };
};

//? Implement Save, Library & Local Storage
const saveContainer = document.querySelector('.save-container');
const saveBtn = document.querySelector('.save');
const submitSaveBtn = document.querySelector('.submit-save');
const saveInput = document.querySelector('.save-input');
const closeSaveBtn  = document.querySelector('.close-save');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');
const clearLibraryBtn = document.querySelector('.clear-library');
const paletteContainer  = document.querySelector('.palette-container');

//? Event Listeners
saveBtn.addEventListener('click', openSave);
closeSaveBtn.addEventListener('click', closeSave);
submitSaveBtn.addEventListener('click', submitSave);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary)
clearLibraryBtn.addEventListener('click', clearLibrary);

//? Functions
function openSave(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
};

function closeSave(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active'); 
};

function submitSave(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    // 
    const name = saveInput.value;
    const colors = [];
    colorHexes.forEach(hex => {
        colors.push(hex.innerText);
    });
    let paletteNo;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if (paletteObjects) {
        paletteNo = paletteObjects.length;
    } else {
        paletteNo = savedPalettes.length;
    }
    //* Generating the object
    const paletteObj = {name, colors, no: paletteNo};
    savedPalettes.push(paletteObj);
    saveToLocal(paletteObj);
    saveInput.value = '';
    //* Create the palette in the library
    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    // 
    const paletteName = document.createElement('h4');
    paletteName.innerText = paletteObj.name;
    // 
    const smallPreview = document.createElement('div');
    smallPreview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        smallPreview.appendChild(smallDiv);
    });
    // 
    const selectLibrary = document.createElement('buttton');
    selectLibrary.classList.add('pick-palette-btn');
    selectLibrary.classList.add(paletteObj.no);
    selectLibrary.innerText = 'Select';
    // 
    // const deleteLibrary = document.createElement('button');
    // deleteLibrary.classList.add('delete-palette-btn');
    // deleteLibrary.classList.add(paletteObj.no);
    // deleteLibrary.innerText = 'Delete';

    //* Event Listeners for buttons
    selectLibrary.addEventListener('click', (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkContrast(color, text);
            updateTextUI(index);
        });
        resetInputs();
    });

    //* Append the childrens
    palette.appendChild(paletteName);
    palette.appendChild(smallPreview);
    palette.appendChild(selectLibrary);
    // palette.appendChild(deleteLibrary);
    paletteContainer.appendChild(palette);

};

function saveToLocal(paletteObj) {
    let localPalettes;
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    };

    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
};

function openLibrary(e) {
    const popup =  libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
};

function closeLibrary(e) {
    const popup =  libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
};

function clearLibrary(e) {
    while (paletteContainer.firstChild) {
        paletteContainer.removeChild(paletteContainer.firstChild);
    };
    localStorage.clear();
};

function getLocal() {
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        savedPalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj => {
            //* Create the palette in the library
            const palette = document.createElement('div');
            palette.classList.add('custom-palette');
            // 
            const paletteName = document.createElement('h4');
            paletteName.innerText = paletteObj.name;
            // 
            const smallPreview = document.createElement('div');
            smallPreview.classList.add('small-preview');
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = smallColor;
                smallPreview.appendChild(smallDiv);
            });
            // 
            const selectLibrary = document.createElement('buttton');
            selectLibrary.classList.add('pick-palette-btn');
            selectLibrary.classList.add(paletteObj.no);
            selectLibrary.innerText = 'Select';
            // 
            // const deleteLibrary = document.createElement('button');
            // deleteLibrary.classList.add('delete-palette-btn');
            // deleteLibrary.classList.add(paletteObj.no);
            // deleteLibrary.innerText = 'Delete';

            //* Event Listeners for buttons
            selectLibrary.addEventListener('click', (e) => {
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                paletteObjects[paletteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkContrast(color, text);
                    updateTextUI(index);
                });
                resetInputs();
            });

            //* Append the childrens
            palette.appendChild(paletteName);
            palette.appendChild(smallPreview);
            palette.appendChild(selectLibrary);
            // palette.appendChild(deleteLibrary);
            paletteContainer.appendChild(palette);
        });
    };
};
getLocal();
randomColors();