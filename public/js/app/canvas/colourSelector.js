const COLOUR_NUM = 64;
// number of pixels to be scipped on iteration
const SCAN_QUALITY = 5;

function extractFromSwatch(swatch, label = null) {
  var colour = swatch.getHex();
  var pop = swatch.getPopulation();
  if (!label) {
    label = colour;
  }
  var colourInfo = { colour: colour, population: pop, name: label };
  return colourInfo;
}

function selectFromProminent(prominentColours) {
  var maxVibrant = { population: 0 };
  var maxMuted = { population: 0 };
  var selectedColours = [];
  for (var index in prominentColours) {
    var colour = prominentColours[index];
    if (colour.name.toLowerCase().includes("vibrant")) {
      if (colour.population > maxVibrant.population) {
        maxVibrant = colour;
        // TODO: make a copy instead - use once the logic is final
        // maxVibrant = Object.assign({}, colour);
      }
    } else {
      if (colour.population > maxMuted.population) {
        maxMuted = colour;
        // TODO: make a copy instead - use once the logic is final
        // maxMuted = Object.assign({}, colour);
      }
    }
  }
  if (maxMuted.population > maxVibrant.population) {
    maxMuted.name = "Main";
    maxVibrant.name = "Secondary";
  } else {
    maxVibrant.name = "Main";
    maxMuted.name = "Secondary";
  }
  selectedColours.push(maxMuted);
  selectedColours.push(maxVibrant);
  // TODO: for now work only with changed labels - to verify the logic
  return prominentColours;
}

function getColours(img, getAll, quality, colourNum) {
  var vibrant = new Vibrant(img, colourNum, quality);
  var swatches = vibrant.swatches();

  var prominentColours = [];
  for (var swatch in swatches) {
    if (swatches.hasOwnProperty(swatch) && swatches[swatch]) {
      var colourInfo = extractFromSwatch(swatches[swatch], swatch);
      prominentColours.push(colourInfo);
    }
  }
  var colours = {};
  colours.prominent = selectFromProminent(prominentColours);
  if (getAll) {
    var fullPalette = [];
    var fullSwatchPalette = vibrant._swatches.slice();
    for (var swatch in fullSwatchPalette) {
      var colourInfo = extractFromSwatch(fullSwatchPalette[swatch]);
      fullPalette.push(colourInfo);
    }
    colours.all = fullPalette;
  }
  return colours;
}

export default {
  getProminentColours: function(
    img,
    quality = SCAN_QUALITY,
    colourNum = COLOUR_NUM
  ) {
    return getColours(img, false, quality, colourNum);
  },
  getAllColours: function(img, quality = SCAN_QUALITY, colourNum = COLOUR_NUM) {
    return getColours(img, true, quality, colourNum);
  },
  getPaletteMap(colourList) {
    var fullPaletteObj = {};
    for (var index in colourList) {
      fullPaletteObj[index] = colourList[index].colour;
    }
    return fullPaletteObj;
  }
};
