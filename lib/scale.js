var knowledge = require('./knowledge');
var Interval = require('./interval');

var KNOWN_SCALES = [
  {id: 'major',
   name: 'Major',
   intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']},
  {id: 'minor',
   name: 'Minor',
   intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7']},
  {id: 'blues',
   name: 'Blues',
   intervals: ['P1', 'm3', 'P4', 'd5', 'P5', 'm7']},
  {id: 'chromatic',
   name: 'Chromatic',
   aliases: ['harmonicchromatic'],
   intervals: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'A4', 'P5', 'm6',
               'M6', 'm7', 'M7']},
  {id: 'doubleharmonic',
   name: 'Doubleharmonic',
   intervals: ['P1', 'm2', 'M3', 'P4', 'P5', 'm6', 'M7']},
  {id: 'harmonicminor',
   name: 'Harmonic Minor',
   intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'M7']},
  {id: 'majorpentatonic',
   name: 'Major Pentatonic',
   intervals: ['P1', 'M2', 'M3', 'P5', 'M6']},
  {id: 'melodicminor',
   name: 'Melodic Minor',
   intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'M7']},
  {id: 'minorpentatonic',
   name: 'Minor Pentatonic',
   intervals: ['P1', 'm3', 'P4', 'P5', 'm7']},
  {id: 'wholetone',
   name: 'Wholetone',
   intervals: ['P1', 'M2', 'M3', 'A4', 'A5', 'A6']},
  {id: 'flamenco',
   name: 'Flamenco',
   intervals: ['P1', 'm2', 'M3', 'P4', 'P5', 'm6', 'M7']},
  {id: 'ionian',
   name: 'Ionian',
   intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7']},
  {id: 'dorian',
   name: 'Dorian',
   intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'm7']},
  {id: 'phrygian',
   name: 'Phrygian',
   intervals: ['P1', 'm2', 'm3', 'P4', 'P5', 'm6', 'm7']},
  {id: 'lydian',
   name: 'Lydian',
   intervals: ['P1', 'M2', 'M3', 'A4', 'P5', 'M6', 'M7']},
  {id: 'mixolydian',
   name: 'Mixolydian',
   intervals: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'm7']},
  {id: 'aeolian',
   name: 'Aeolian',
   intervals: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7']},
  {id: 'locrian',
   name: 'Locrian',
   intervals: ['P1', 'm2', 'm3', 'P4', 'd5', 'm6', 'm7']}
];

function findScaleById(scaleName) {
  for (var i = 0, len = KNOWN_SCALES.length; i < len; i++) {
    if (KNOWN_SCALES[i].id === scaleName ||
        (KNOWN_SCALES[i].aliases &&
         KNOWN_SCALES[i].aliases.indexOf(scaleName) !== -1)) {
      return KNOWN_SCALES[i].intervals;
    }
  }
}

function findScaleNameByIntervals(intervals) {
  for (var i = 0, len = KNOWN_SCALES.length; i < len; i++) {
    if (KNOWN_SCALES[i].intervals.toString() === intervals.toString()) {
      return KNOWN_SCALES[i].id;
    }
  }
}

function Scale(tonic, scale) {
  if (!(this instanceof Scale)) return new Scale(tonic, scale);
  var scaleName;
  if (!('coord' in tonic)) {
    throw new Error('Invalid Tonic');
  }

  if (typeof scale === 'string') {
    scaleName = scale;
    scale = findScaleById(scale);
    if (!scale)
      throw new Error('Invalid Scale');
  } else {
    scaleName = findScaleNameByIntervals(scale);
  }

  this.name = scaleName;
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

module.exports = Scale;
