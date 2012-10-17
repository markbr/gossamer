/**
 * Ben Farrell
 * 'The ADSR Envelope with Audiolib.js'
 * www.benfarrell.com
 */

audioLib.generators('Note', function (sampleRate, notation, octave){
    // extend Oscillator
    for ( var prop in audioLib.generators.Oscillator.prototype) {
        this[prop] = audioLib.generators.Oscillator.prototype[prop];
    }

	var	that = this;

    if (octave) {
        notation += octave;
    }

    that.frequency = Note.getFrequencyForNotation(notation);
	that.waveTable	= new Float32Array(1);
	that.sampleRate = sampleRate;
	that.waveShapes	= that.waveShapes.slice(0);
    that.releasePhase = false;
    that.released = false;

    /**
     * override get mix
     */
    that.getMix = function(){
        // if there's no envelope, then just return the normal sound
        if (!this._envelope) {
            return this[this.waveShape]();
        }

        var buffer = new Float32Array(1);
        this._envelope.append(buffer, 1);

        // state #5 is a timed release, so enter the release phase if here
        if (this._envelope.state === 5) {
            this.releasePhase = true;
        }

        // if in the release phase, release key when state cycles back to 0
        if (this.releasePhase && this._envelope.state === 0 && this.released === false) {
            this.released = true;
            return 0;
        }

        // if released, don't return any buffer
        if (this.released == true) {
            return 0;
        } else {
        	return this[this.waveShape]() * buffer[0];
        }
    }
}, {
    /**
     * release key - trigger the release phase if not done
     */
    releaseKey: function() {
        if (!this.released) {
            this.releasePhase = true;

            if (this._envelope) {
                this._envelope.triggerGate(false);
            } else {
                this.released = true;
            }
        }
    },

    /**
     * set envelope
     *
     * @param envelope
     */
    setEnvelope: function(value) {
        this._envelope = value;
        if (value) {
            this._envelope.triggerGate(true);
        }
    },

    /**
     * get envelope
     *
     * @return envelope
     */
    getEnvelope: function(value) {
        return this._envelope;
    }
});
