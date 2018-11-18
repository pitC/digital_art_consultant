import ColourTypes from "./ColourTypes.js";

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

function sortByPop(colA, colB) {
  if (parseInt(colA.population) > parseInt(colB.population)) {
    return -1;
  } else if (parseInt(colA.population) < parseInt(colB.population)) {
    return 1;
  } else return 0;
}

function processFullPalette(fullPalette, prominentColours) {
  fullPalette.sort(sortByPop);
  for (var index in fullPalette) {
    var colour = fullPalette[index];
    for (var prom in prominentColours) {
      if (prominentColours[prom].colour === colour.colour) {
        colour.name = prominentColours[prom].name;
      }
    }
  }
  return fullPalette;
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
  // TODO: remove this debug data
  // TODO: for now work only with changed labels - to verify the logic
  // if (maxMuted.population > maxVibrant.population) {

  //   maxMuted.name += " (M)";
  //   maxVibrant.name += " (S)";
  // } else {
  //   maxVibrant.name += " (M)";
  //   maxMuted.name += " (S)";
  // }
  // return prominentColours;
  maxMuted.name = ColourTypes.SECONDARY;
  maxVibrant.name = ColourTypes.CONTRAST;
  selectedColours.push(maxMuted);
  selectedColours.push(maxVibrant);
  return selectedColours;
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

    colours.all = processFullPalette(fullPalette, prominentColours);
  }

  var mainColour = colours.all[0];
  mainColour.name = ColourTypes.MAIN;
  colours.prominent.push(mainColour);

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
  // change list of swatches to map of colours with indes as a key - format required by nearestColour package
  getPaletteMap(colourList) {
    var fullPaletteObj = {};
    for (var index in colourList) {
      fullPaletteObj[index] = colourList[index].colour;
    }
    return fullPaletteObj;
  }
};
