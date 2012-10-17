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
		//noise.generate();
		osc1.fm = lfo1.getMix() * 0.2;
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
	dev1			= audioLib.AudioDevice(fillBuffer, 2);
	sampleRate		= dev1.sampleRate;

	//adsr =  audioLib.ADSREnvelope(sampleRate, 200, 10,1, 1000 );
	//adsr =  audioLib.ADSREnvelope(sampleRate, attack, decay, 1, release, sustain, release);
	adsr =  audioLib.ADSREnvelope(sampleRate, attack, decay, sustain, release);

	//adsr.triggerGate(true);
	//fx			= (new audioLib.LP12Filter(sampleRate, 200, 2), new audioLib.Delay(sampleRate, 75, .1));
	
	lfo1			= new audioLib.Oscillator(sampleRate);//, 2);
	lfo1.frequency = lfospeed;
	lfo1.waveShape = 'triangle';
	osc1			= new audioLib.Oscillator(sampleRate, null);
	//noise 			= new audioLib.Noise(sampleRate, 'brown');
	currentNote = 0;
	toggleEnvelope("on");
	
	
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
            content.innerHTML = "<h1>Gossamer loaded</h1><br/>";
        },
        error : function(msg) {
            console.log(msg);
        },
        data : function(midiEvent) 
        {
        
            if(midiEvent.status == midiBridge.NOTE_ON)
            {
            		//if(currentNote != 0){
            			evnOn();
            			noteOnName = midiEvent.noteName;
            			pressed.unshift(noteOnName);
            			console.log(noteOnName +" on");
            			console.log(pressed);
            			adsr.triggerGate(true);
            			//adsr.triggerGate(false);
            			//osc1 = new audioLib.Oscillator(sampleRate, 110);
						osc1 = new audioLib.generators.Note(sampleRate, noteOnName);
    					osc1.waveShape = document.getElementById("waveform").value;
                    	console.log(osc1.mix);
                    	osc1.mix = osc1.mix * midiEvent.data2 / 127;
                    	currentNote = noteOnName; 
						//add to array then compare midiNoteoff with the members of the array. 
						//if its a match feed a release. 
						
						
                	
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
			//fx			= (new audioLib.LP12Filter(sampleRate, 200, 2), new audioLib.Delay(sampleRate, 75, .1));
   		}
   		
   		if(document.getElementById("presetSelect").value == "dnb"){
			fx			= (new audioLib.LP12Filter(sampleRate, 2000, 1)).join(new audioLib.Chorus(sampleRate, 130, 9, 0.5),new audioLib.Delay(sampleRate, 500, 0.2));
   			console.log("preset selected");
   		}
   		if(document.getElementById("presetSelect").value == "Distorted"){
			fx			= (new audioLib.LP12Filter(sampleRate, 2000, 1)).join(new audioLib.Chorus(sampleRate, 90, 9, 0.5),new audioLib.Delay(sampleRate, 500, 0.4), new audioLib.Distortion(sampleRate));
   			
   		}
}

function evnOn(){
		adsr.triggerGate(true);
	}

