/**
 * Ben Farrell
 * 'The ADSR Envelope with Audiolib.js'
 * www.benfarrell.com
 */

function KeyboardController() {

    var that = this;

    /** buffer object */
    that.buffer = null;

    /** keys pressed list */
    that._keysPressed = [];

    /** keys ids pressed list */
    that._keyIDsPressed = [];

    /** keys released list */
    that._keysReleased = [];

    /** keys ids released list */
    that._keyIDsReleased = [];

    /**
     * press a key by generator reference
     * @param generator
     * @param id to assign to generator
     */
    that.pressKey = function (generator, id) {
        this._keysPressed.push(generator);
        this._keyIDsPressed.push(id);
    }

    /**
     * press a key by array of generator references
     * @param generator array
     * @param block keys from being pressed that are the same frequency as existing keys
     */
    that.pressKeys = function (generators, id, ignoreIfIDExists) {
        for ( var gen in generators) {
            this.pressKey(generators[gen], id, ignoreIfIDExists);
        }
    }

    /**
     * release a key by generator reference
     * @param generator
     */
    that.releaseKeyByRef = function (generator) {
        var indx = this._keysPressed.indexOf(generator);
        this._keysPressed[indx].releaseKey();
        this._keysPressed.splice(indx, 1);
        this._keyIDsPressed.splice(indx, 1);
    }

    /**
     * release a key by array of generator references
     * @param generator array
     */
    that.releaseKeysByRef = function (generators) {
        for ( var gen in generators) {
            this.releaseKeyByRef(generators[gen]);
        }
    }

    /**
     * release a key by id reference (possibly multiple with the same ID)
     * @param id - could be note, frequency, whatever
     */
    that.releaseKeyByID = function (id) {
        var indx = this._keyIDsPressed.indexOf(id);
        while (indx != -1) {
            this._keysReleased.push(this._keysPressed[indx]);
            this._keyIDsReleased.push(this._keyIDsReleased[indx]);
            this._keysPressed[indx].releaseKey();
            this._keysPressed.splice(indx, 1);
            this._keyIDsPressed.splice(indx, 1);
            indx = this._keyIDsPressed.indexOf(id);
        }
    }

    /**
     * release a key by id references
     * @param array of ids
     */
    that.releaseKeysByIDs = function (ids) {
        for ( var id in ids ) {
            this.releaseKeyByID(ids[id]);
        }
    }

    /**
     * pull the generators from the controller
     *
     * @return list of generators
     */
    that.pull = function() {
        // check through all our released keys and see if the release phase is over
        // if so we can remove it from the mix
        var l = this._keysReleased.length;
        for (var c = l-1; c >=0; c--) {
            if (this._keysReleased[c].released === true) {
                this._keysReleased.splice(c, 1);
                this._keyIDsReleased.splice(c, 1);
            }
        }
        // concatenate the pressed and released keys and return
        if (this._keysPressed.length > 0) {
            //console.log(this._keysPressed[0].adsr.state);
            //console.log(document.getElementById("log"));
           // document.getElementById("log").text= "hi";//this._keysPressed[0].adsr.state;
        }
        return this._keysPressed.concat(this._keysReleased);
    }
}