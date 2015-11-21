var knowledge = require('./knowledge');
var Interval = require('./interval');

var KNOWN_SCALES = [
  {name: 'major',
   label: 'Major',
   intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']},
  {name: 'minor',
   label: 'Minor',
   intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7']},
  {name: 'blues',
   label: 'Blues',
   intervals: ['P1', 'm3', 'P4', 'd5', 'P5', 'm7']},
  {name: 'chromatic',
   label: 'Chromatic',
   aliases: ['harmonicchromatic'],
   intervals: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6',
               'M6', 'm7', 'M7']},
  {name: 'doubleharmonic',
   label: 'Double Harmonic',
   intervals: ['P1', 'm2', 'M3', 'P4', 'P5', 'm6', 'M7']},
  {name: 'harmonicminor',
   label: 'Harmonic Minor',
   intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'M7']},
  {name: 'majorpentatonic',
   label: 'Major Pentatonic',
   intervals: ['P1', 'M2', 'M3', 'P5', 'M6']},
  {name: 'melodicminor',
   label: 'Melodic Minor',
   intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'M7']},
  {name: 'minorpentatonic',
   label: 'Minor Pentatonic',
   intervals: ['P1', 'm3', 'P4', 'P5', 'm7']},
  {name: 'wholetone',
   label: 'Wholetone',
   intervals: ['P1', 'M2', 'M3', 'A4', 'A5', 'A6']},
  {name: 'flamenco',
   label: 'Flamenco',
   intervals: ['P1', 'm2', 'M3', 'P4', 'P5', 'm6', 'M7']},
  {name: 'ionian',
   label: 'Ionian',
   intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']},
  {name: 'dorian',
   label: 'Dorian',
   intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'm7']},
  {name: 'phrygian',
   label: 'Phrygian',
   intervals: ['P1', 'm2', 'm3', 'P4', 'P5', 'm6', 'm7']},
  {name: 'lydian',
   label: 'Lydian',
   intervals: ['P1', 'M2', 'M3', 'A4', 'P5', 'M6', 'M7']},
  {name: 'mixolydian',
   label: 'Mixolydian',
   intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'm7']},
  {name: 'aeolian',
   label: 'Aeolian',
   intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7']},
  {name: 'locrian',
   label: 'Locrian',
   intervals: ['P1', 'm2', 'm3', 'P4', 'd5', 'm6', 'm7']}
];

function findScaleByName(scaleName) {
  for (var i = 0, len = KNOWN_SCALES.length; i < len; i++) {
    if (KNOWN_SCALES[i].name === scaleName ||
        (KNOWN_SCALES[i].aliases &&
         KNOWN_SCALES[i].aliases.indexOf(scaleName) !== -1)) {
      return KNOWN_SCALES[i];
    }
  }
}

function findScaleByIntervals(intervals) {
  for (var i = 0, len = KNOWN_SCALES.length; i < len; i++) {
    if (KNOWN_SCALES[i].intervals.toString() === intervals.toString()) {
      return KNOWN_SCALES[i];
    }
  }
}

function Scale(tonic, scale) {
  if (!(this instanceof Scale)) return new Scale(tonic, scale);
  var scaleName, scaleLabel, scaleInfo;
  if (!('coord' in tonic)) {
    throw new Error('Invalid Tonic');
  }

  if (typeof scale === 'string') {
    scaleName = scale;
    scaleInfo = findScaleByName(scale);
    if (!scaleInfo)
      throw new Error('Invalid Scale');
    scale = scaleInfo.intervals;
  } else {
    scaleInfo = findScaleByIntervals(scale);
    scaleName = scaleInfo.name;
  }
  scaleLabel = scaleInfo.label;

  this.name = scaleName;
  this.label = scaleLabel;
  this.tonic = tonic;
  this.scale = scale;
}

Scale.prototype = {
  notes: function() {
    var notes = [];

    for (var i = 0, length = this.scale.length; i < length; i++) {
      notes.push(this.tonic.interval(this.scale[i]));
    }

    return notes;
  },

  simple: function() {
    return this.notes().map(function(n) { return n.toString(true); });
  },

  type: function() {
    var length = this.scale.length - 2;
    if (length < 8) {
      return ['di', 'tri', 'tetra', 'penta', 'hexa', 'hepta', 'octa'][length] +
        'tonic';
    }
  },

  get: function(i) {
    i = (typeof i === 'string' && i in knowledge.stepNumber) ? knowledge.stepNumber[i] : i;

    return this.tonic.interval(this.scale[i - 1]);
  },

  solfege: function(index, showOctaves) {
    if (index)
      return this.get(index).solfege(this, showOctaves);

    return this.notes().map(function(n) {
      return n.solfege(this, showOctaves);
    });
  },

  interval: function(interval) {
    interval = (typeof interval === 'string') ?
      Interval.toCoord(interval) : interval;
    return new Scale(this.tonic.interval(interval), this.scale);
  },

  transpose: function(interval) {
    var scale = this.interval(interval);
    this.scale = scale.scale;
    this.tonic = scale.tonic;

    return this;
  }
};
Scale.KNOWN_SCALES = KNOWN_SCALES;

module.exports = Scale;
