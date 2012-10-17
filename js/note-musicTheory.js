Note = {
    /* incremental tones as sharp notation */
    sharpNotations: ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"],

    /* incremental tones as flat notation */
    flatNotations: ["A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab"],

    /* odd notations */
    oddNotations: ["B#", "Cb", "E#", "Fb"],

    /* corrected notations */
    correctedNotations: ["C", "C", "F", "F"],

    /**
     * turn a notation into a frequency
     * @param notation
     * @return frequency
     */
    getFrequencyForNotation: function(nt) {
        var octave = 4;

        // does notation include the octave?
        if ( !isNaN( parseInt(nt.charAt(nt.length -1)) )) {
            octave = parseInt(nt.charAt(nt.length -1));
            nt = nt.substr(0, nt.length-1);
        }

        // correct any flat/sharps that resolve to a natural
        if (this.oddNotations.indexOf(nt) != -1) {
            nt = this.correctedNotations[this.oddNotations.indexOf(nt)];
        }

        var freq;
        var indx = this.sharpNotations.indexOf(nt);

        if (indx == -1) {
            indx = this.flatNotations.indexOf(nt);
        }

        if (indx != -1) {
            indx += (octave-4) * this.sharpNotations.length;
            freq = 440 * (Math.pow(2, indx/12));
        }
        return freq;
    },

    /**
     * get notes in a specific key signature
     *
     * @param key (root note)
     * @param if major key signature
     * @param octave to use (optional)
     * @return keys in key signature
     */
    notesInKeySignature: function(key, major, octave) {
        var notesToIndex;
        var notesInKey = [];
        var startPos;

        // correct any flat/sharps that resolve to a natural
        if (this.oddNotations.indexOf(key) != -1) {
            key = this.correctedNotations[this.oddNotations.indexOf(key)];
        }

        // find the correct note and notation
        if (this.sharpNotations.indexOf(key) != -1) {
            notesToIndex = this.sharpNotations.slice();
            startPos = this.sharpNotations.indexOf(key);
        } else {
            notesToIndex = this.flatNotations.slice();
            startPos = this.flatNotations.indexOf(key);
        }

        // double the array length
        var len = notesToIndex.length;
        for ( var c = 0; c < len; c++ ) {
            if (octave) {
                notesToIndex.push(notesToIndex[c] + (octave+1));
            } else {
                notesToIndex.push(notesToIndex[c]);
            }
        }

        // add octave notation to the first half of the array
        if (octave) {
            for (var c = 0; c < this.flatNotations.length; c++) {
                notesToIndex[c] += octave;
            }
        }
        // chop off the front of the array to start at the root key in the key signature
        notesToIndex.splice(0, startPos);

        // build the key signature
        if (major) {
                // MAJOR From root: whole step, whole step, half step, whole step, whole step, whole step, half step
                notesInKey.push( notesToIndex[0] );
                notesInKey.push( notesToIndex[2] );
                notesInKey.push( notesToIndex[4] );
                notesInKey.push( notesToIndex[5] );
                notesInKey.push( notesToIndex[7] );
                notesInKey.push( notesToIndex[9] );
                notesInKey.push( notesToIndex[11] );
        } else {
                // MINOR From root: whole step, half step, whole step, whole step, half step, whole step, whole step
                notesInKey.push( notesToIndex[0] );
                notesInKey.push( notesToIndex[2] );
                notesInKey.push( notesToIndex[3] );
                notesInKey.push( notesToIndex[5] );
                notesInKey.push( notesToIndex[7] );
                notesInKey.push( notesToIndex[8] );
                notesInKey.push( notesToIndex[10] );
        }
        return notesInKey;
    }
};