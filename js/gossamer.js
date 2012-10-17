var	
	osc1,osc2, 
	lfo1,noise,
	dev1, sampleRate, fx, j, adsr, currentNote,currentNote2, noteOnName, noteOffName;
var pressed = [];
var released = [];
var attack;
var decay;
var sustain;
var release;
var velocity = 127;
var time, feedback, lfospeed, vol, cutOff;
var channels 	= 2,
	delayTime 		= 0,
	delayFeedback	= 0,
	chorusDelay = 0,
	depth = 0,
	chFreq = 0,
	compressorLeft,
	compressorRight,	
	bitCrusher,
	distortion,
	hpFilter,
	lpFilter,
	delay,
	reverb,
	chorus;
var fxOn = false;

function fillBuffer(buffer, channelCount)
{
	var	l = buffer.length, env,
		smpl1,smpl2,smpl3, left,right,
		i, n, out, out2, out3, out4;
	for (i=0; i<l; i+=channelCount)
	{
		adsr.generate();
		lfo1.generate();//LFO generated
		lfo1.frequency = lfospeed;
		//noise.generateBuffer(buffer.length / channelCount);
		noise.generate();
		//osc1.fm = lfo1.getMix() * 0.01;
				//osc1.fm = lfo1.getMix() * 0.07;

		osc1.generate();
		smpl1 = left = right = 0;
		smpl1 += smpl1 += osc1.getMix();
		smpl2	= osc1.getMix();		
		smpl2 = smpl2 * adsr.getMix();
		
		// DISTORTION
		distortion.pushSample(smpl1);
		smpl1 += distortion.getMix();
			
		// BIT CRUSHER
		bitCrusher.pushSample(smpl1);
		smpl1 = bitCrusher.getMix();
		
		// CHORUS
		chorus.pushSample(smpl1);
		smpl1 = smpl1 + chorus.getMix();	
		
		// HIGH PASS FILTER
		hpFilter.pushSample(smpl1);
		smpl1 = hpFilter.getMix(1);
			
		// LOW PASS FILTER
		lpFilter.pushSample(smpl1);
		smpl1 = lpFilter.getMix(0);
		
			
		// DELAY
		delay.pushSample(smpl1);
		smpl1 = smpl1 + delay.getMix();
			
		// REVERB
		reverb.pushSample(smpl1, 0);
		reverb.pushSample(smpl1, 1);
		left = reverb.getMix(0);
		right = reverb.getMix(1);

		// COMPRESSOR
		left = compressorLeft.pushSample(left);			
		right = compressorRight.pushSample(right);			
		
		//smpl1 += left += right;
		//smpl1 = osc1.getMix() * adsr.getMix();
		smpl3 = left + right;
		smpl3 = smpl3 * adsr.getMix();
		
		//VELOCITY
		//smpl3 = smpl3*velocity;
		
		
		if (fxOn==true){
			for (n=0; n<channelCount; n++)
			{
				//varialble containing oscillator value and FX added to the buffer. 
				buffer[i + n] = fx.pushSample(smpl2 * vol) ;
				//buffer[i + n] = smpl2 * vol;
			}
		}
			else if (fxOn==false){
			for (n=0; n<channelCount; n++)
			{
				//varialble containing oscillator value and FX added to the buffer. 
				//buffer[i + n] = fx.pushSample(smpl1 * vol) ;
				buffer[i + n] = smpl3 * vol;
			}
		}
	}
}





window.addEventListener('load', function() 
{
    var frequencies = {};
    var noteNames = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
    var a4 = 440;
    
   // const initialMidi = 69; //Note A4 has midinumber 69
    const low = -69; //equals Midi NoteNumber 0 ~ 8 Hz
    const hi = 58;  //equals Midi NoteNumber 127 ~ 12500 Hz
    //const tempLow = 415.3;
    //const tempHi = 466.16;
    
    function shiftIndex(index,range,shift)
    {
        shift = (index + shift) >= range ? shift - range : shift;
        return (index + shift);
    }
        
    //for(var i = 0;i <= 127; i++)    
    for(var i = low;i < hi; i++)
    {
        var frequency = Math.round((Math.pow(2,i/12) * a4) * 100) / 100;
        var octave = Math.floor(((i-3)/12) + 5); //octaves are calculated from note C and A440 is in octave 4 and the lowest note is in octave -1 (midinumber 0)
		//console.log("octave "+octave);
        var noteIndex = i%12;
        //console.log("noteIndex :" + noteIndex);
        noteIndex = noteIndex < 0 ? noteIndex + 12 : noteIndex;
			console.log("noteIndex :" + noteIndex);	
        var shiftedIndex = shiftIndex(noteIndex,12,9);
        var noteName = noteNames[shiftedIndex] + "" + octave;
        frequencies[noteName] = frequency;
    }			   

	
	//CREATE THE ENVELOPE
	dev1			= audioLib.AudioDevice(fillBuffer, 2);
	sampleRate		= dev1.sampleRate;
	//CREATE THE ENVELOPE
	adsr =  audioLib.ADSREnvelope(sampleRate, attack, decay, sustain, release);
	//CREATE THE OSCILLATORS
	lfo1			= new audioLib.Oscillator(sampleRate);//, 2);
	lfo1.frequency = lfospeed;
	lfo1.waveShape = 'triangle';
	osc1			= new audioLib.Oscillator(sampleRate, null);
	noise 			= new audioLib.Noise(sampleRate, 'brown');
	currentNote = 0;
	toggleEnvelope("on");
	
	//CREATE THE EFFECTS
	delay = new audioLib.Delay(sampleRate, delayTime, delayFeedback);
	chorus= new audioLib.Chorus(sampleRate, chorusDelay, depth, chFreq);
	compressorLeft = new audioLib.Compressor(sampleRate, 3, 0.5);
	compressorRight = new audioLib.Compressor(sampleRate, 3, 0.5);
	reverb = new audioLib.Reverb(sampleRate, channels);
	bitCrusher = new audioLib.BitCrusher(sampleRate, 8);
	distortion = new audioLib.Distortion(sampleRate, 0.0, 0.0);
	hpFilter = new audioLib.IIRFilter(sampleRate, 10);
	lpFilter = new audioLib.IIRFilter(sampleRate, 5000);
	console.log(lpFilter.cutoff);

	distortion.gain = 0.0;
	distortion.master = 0.0;

    midiBridge.init({
        connectAllInputs : true,
        ready : function(msg) {
            boxInfo.innerHTML = "";
        },
        error : function(msg) {
            console.log(msg);
        },
        data : function(midiEvent) 
        {
        
            if(midiEvent.status == midiBridge.NOTE_ON)
            {
            		//if(currentNote != 0){
            			//evnOn();
            			noteOnName = midiEvent.noteName;
            			pressed.unshift(noteOnName);
            			console.log(noteOnName +" on");
            			console.log(pressed);
            			adsr.triggerGate(true);
            			//osc1 = new audioLib.Oscillator(sampleRate, 110);
            			osc1 = new audioLib.Oscillator(sampleRate, frequencies[noteOnName]);
						//osc1 = new audioLib.generators.Note(sampleRate, noteOnName);
    					osc1.waveShape = document.getElementById("waveform").value;
                    	console.log(osc1.mix);
                    	osc1.mix = osc1.mix * midiEvent.data2 / 127;
                    	currentNote = noteOnName; 
                    	velocity = midiEvent.data2 / 127;
						//add to array then compare midiNoteoff with the members of the array. 
						//if its a match feed a release. 
						//noise 			= new audioLib.Noise(sampleRate, 'brown');
						                	
            }
       	if(midiEvent.status == midiBridge.NOTE_OFF)
        	{			
        		    	noteOffName = midiEvent.noteName;
        		    	console.log(noteOffName + " off");
        		    if(pressed[0] === noteOffName)
        		    {
        		  		adsr.triggerGate(false);
        		  		//osc1 = new audioLib.Oscillator(sampleRate, 0);        		  		
        		  	}
        		  	else{
        		  		console.log("not the same");
        		  	}
        	}
        	
        	if(midiEvent.status == midiBridge.CONTROL_CHANGE){
        
						lfospeed = midiEvent.data2 / 7; 
        	}
        }
    });    

},false);



/**
* fx stuff**************
*
*/
function onFxChangeM(){
		lfospeed = document.getElementById("lfospeed").value;
		

}
function onFxChangeMVOl(){
		voltemp = document.getElementById("vol").value;
		vol = voltemp/10;
		console.log(vol);

}

function changeDelayTime(){
		delayTime = document.getElementById("dtime").value;
		delay.time = delayTime;
		console.log(delay.time);
}
function changeDelayFeedback(){
		delayFeedbackTemp = document.getElementById("dfeed").value;
		delay.feedback = delayFeedbackTemp/10
		console.log(delay.feedback);

}

function reverbDry(){
		dry = document.getElementById("dry").value;
		reverb.dry = dry/10;
}


function reverbWet(){
		wet = document.getElementById("wet").value;
		reverb.wet = wet/10;

}

function reverbSize(){
		size = document.getElementById("size").value;
		reverb.roomSize = wet/10;
		console.log(reverb.roomSize);
		reverb = new audioLib.Reverb(sampleRate, channels, reverb.wet, reverb.dry, size, reverb.damping);
		console.log(reverb.wet);
		console.log(reverb.dry);
	
}

function reverbDamp(){
		damp = document.getElementById("damp").value;
		reverb.damping = damp/10;
		console.log(reverb.damping);
		reverb = new audioLib.Reverb(sampleRate, channels, reverb.wet, reverb.dry, reverb.roomSize, damp);

}

function bitCrush(){
		crush = document.getElementById("crush").value;
		bitCrusher = audioLib.BitCrusher(sampleRate, crush);
		
}

function distGain(){
		gain = document.getElementById("gain").value;
		distortion.gain = gain;
}


function distMaster(){
		master = document.getElementById("master").value;
		distortion.master = master;
}

function hpCutOff(){
		hp = document.getElementById("hp").value;
		lpFilter.cutoff = hp;
}

function lpCutOff(){
		lp = document.getElementById("lp").value;
		lpFilter.cutoff = lp;
}

function chorusDelayTime(){
		chorusDelay = document.getElementById("chdelay").value;
		chorus.delayTime = chorusDelay;
}

function chorusDepth(){
		depth = document.getElementById("depth").value;
		chorus.depth = depth;
}

function chorusFreq(){
		chFreq = document.getElementById("freq").value;
		chorus.freq = chFreq;
}


function toggleEnvelope(value) {
  /*  if (document.getElementById("envelope").value == "on" || value=="off") {
        document.getElementById("envelope").value = "off";
        document.getElementById("envelopeLabel").style.visibility = 'visible';
        document.getElementById("adsr").style.visibility = 'visible';
    } else {
        document.getElementById("envelope").value = "on";
        document.getElementById("envelopeLabel").style.visibility = 'visible';
        document.getElementById("adsr").style.visibility = 'visible';
        onEnvelopeChange();
    }*/
}


function onEnvelopeChange() {

    attackTemp = document.getElementById("attackTime").value;
    adsr.attack = attackTemp;
    decayTemp = document.getElementById("decayTime").value;
    adsr.decay = decayTemp;
    sustainTemp = document.getElementById("sustainTime").value;
    adsr.sustain = sustainTemp;
    releaseTemp = document.getElementById("releaseTime").value;
    adsr.release = releaseTemp;

    if (sustain == 0) {
        sustain = null; // null sustain allows us to hold the key down
    }
}


function presetsM(value){	
	fxOn = true;
	if(document.getElementById("presetSelect").value == "default"){
			fxOn = false;
			divIsible();
			//fx			= (new audioLib.LP12Filter(sampleRate, 200, 2), new audioLib.Delay(sampleRate, 75, .1));
   		}
   		
   		if(document.getElementById("presetSelect").value == "dnb"){
			fx			= (new audioLib.LP12Filter(sampleRate, 2000, 1)).join(new audioLib.Chorus(sampleRate, 130, 9, 0.5),new audioLib.Delay(sampleRate, 500, 0.2));
   			console.log("preset selected");
   			divInvisible();
   		}
   		if(document.getElementById("presetSelect").value == "Distorted"){
			fx			= (new audioLib.LP12Filter(sampleRate, 2000, 1)).join(new audioLib.Chorus(sampleRate, 90, 9, 0.5),new audioLib.Delay(sampleRate, 500, 0.4), new audioLib.Distortion(sampleRate));
   			divInvisible();
   		}
   		if(document.getElementById("presetSelect").value == "messy"){

   			fx			= (new audioLib.LP12Filter(sampleRate, 8000, 4)).join(new audioLib.Chorus(sampleRate, 130, 9, 1.1),new audioLib.Delay(sampleRate));
   			fx[2].time = 960;
   			fx[2].feedback = 0.4;
   			divInvisible();
   		}
}

function evnOn(){
		adsr.triggerGate(true);
	}



//LOOK N FEEL
function attackInfo(){	
	boxInfo.innerHTML= "This is the attack value and controls how long it takes for the note to reach the maximum value.";
}


function decayInfo(){	
	boxInfo.innerHTML= "The time taken for the sound to move from the attack level to the selected sustain level.";
}

function sustainInfo(){	
	boxInfo.innerHTML= "This determines how long the sound is maintained until the key is released.  To allow the synth to sustain until the key is released, sustain should be set to zero (the left most setting). ";
}

function releaseInfo(){	
	boxInfo.innerHTML= "This determines how long the note takes to fade out once the key has been released.";
}

function distortionInfo(){	
	boxInfo.innerHTML= "Adjust the bitcrush value and the gain atribute of the signal. ";
}
function crushInfo(){	
	boxInfo.innerHTML= "Allows you to reduce the bit depth of the signal. ";
}

function gainInfo(){	
	boxInfo.innerHTML= "The gain increases the amount of signal passed to the effect.  ";
}
function masterInfo(){	
	boxInfo.innerHTML= "The master controls the master volume of the distortion. <br /> Turn down the master volume of the synth when turning this up. ";
}


function reverbInfo(){	
	boxInfo.innerHTML= "This is persistence of sound in a space after the initial sound has occurred. ";
}

function dryInfo(){	
	boxInfo.innerHTML= "Controls how much of the signal with NO reverb applied is passed through";
}

function wetInfo(){	
	boxInfo.innerHTML= "Controls how much of the signal with reverb applied is passed through";
}

function oscInfo(){	
	boxInfo.innerHTML= "Select the shape of the wave that the oscillator produces";
}

function presetInfo(){	
	boxInfo.innerHTML= "Select a preset for the sound. <br/> The only parameters that can be modified here are the Wave Shape and the LFO.";
}

function lfoInfo(){	
	boxInfo.innerHTML= "Select the speed that the modulating oscillator vibrates at. This modulates the main oscillator. ";
}

function volumeInfo(){	
	boxInfo.innerHTML= "Adjust the master volume. ";
}

function delayInfo(){	
	boxInfo.innerHTML= "Controls all the delay parameters including delay time and the amount of feedback";
}

function timeInfo(){	
	boxInfo.innerHTML= "The time slider controls the length of time between the individual delays. This ranges from 0 – 900 ms.";
}

function feedInfo(){	
	boxInfo.innerHTML= "The feed slider changes the amount of feedback applied to the signal.";
}

function filterInfo(){	
	boxInfo.innerHTML= "The filter section contains a Low-pass filter and a High-pass filter.";
}
function lpInfo(){	
	boxInfo.innerHTML= "The low-pass filter allows low frequencies through and attenuates the high frequencies.";
}
function hpInfo(){	
	boxInfo.innerHTML= "The high-pass filter allows high frequencies through and attenuates the low frequencies.";
}

function buttonInfo(){	
	boxInfo.innerHTML= "If you do not have a MIDI keyboard please select here to play via your QWERTY keyboard";
}

function allInfo(){	
	boxInfo.innerHTML= "This is a monophonic synth. For now, this works best with Google Chrome. Please download it www.google.com/chrome. To play with a MIDI keyboard, connect it and refresh the page. Otherwise please select QWERTY to play via the computer keyboard.";
}
function blankInfo(){	
	boxInfo.innerHTML= "";
}

function divInvisible(element, event){
	var one = document.getElementById("one");
	var three = document.getElementById("three");
	var dist = document.getElementById("dist");
	//one.style.visibility="hidden" ;
	dist.style.opacity=0.4 ;
	three.style.opacity=0.4 ;
	//three.style.visibility="hidden"; 
		//one.style.display = "none"; 
	//three.style.display = "none"; 

}
function divIsible(element, event){
	var one = document.getElementById("one");
	var three = document.getElementById("three");
	var dist = document.getElementById("dist");
	
	dist.style.opacity=1 ;
	//three.style.visibility="visible"; 
	three.style.opacity=1 ;
	//one.style.display = "block"; 
//three.style.display = "block"; 
}

function changeStyle(title) {
	var lnks = document.getElementsByTagName('link');
	for (var i = lnks.length - 1; i >= 0; i--) {
		if (lnks[i].getAttribute('rel').indexOf('style')> -1 && lnks[i].getAttribute('title')) 
		{
			lnks[i].disabled = true;
		if (lnks[i].getAttribute('title') == title) 
			lnks[i].disabled = false;
		}
	}
}