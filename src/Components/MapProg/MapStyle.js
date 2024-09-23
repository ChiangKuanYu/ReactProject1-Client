

export const countiesLayer = {
    id: 'countryLayer',
    type: 'fill',
    source: 'countryJson',
    paint:{
        'fill-outline-color': 'rgba(0,0,0,0)',
        'fill-color': 'rgba(0,0,0,0)'
    }
};

export const highlightLayer = {
    id: 'countryLayer2',
    type: 'fill',
    source: 'countryJson',
    paint: {
        'fill-outline-color': '#484896',
        'fill-color': '#6e599f',
        'fill-opacity': 0.75
    }
};

export const townsLayer = {
    id: 'townsLayer',
    type: 'fill',
    source: 'countryJson',
    paint:{
        'fill-outline-color': 'rgba(0,0,0,100)',
        'fill-color': 'rgba(0,0,0,0)'
    }
};

export const highlightTownsLayer = {
    id: 'townsLayer2',
    type: 'fill',
    source: 'countryJson',
    paint: {
        'fill-outline-color': '#484896',
        'fill-color': '#6e599f',
        'fill-opacity': 0.75
    }
}

export const pointLayer = {
    id: 'mountain',
    type: 'symbol',
    source: 'mountainJson',
}