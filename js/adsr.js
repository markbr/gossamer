var pressed = [];
var attack;
var decay;
var sustain;
var release;
var delay; 
var fx, sample, comp;
var midiNote; 
var feedback;
var dtime, preset, lfospeed;
var myNote, lfo1;
var time, feedback, lfospeed, vol, cutOff;
var channels 	= 2,
	delayTime 		= 0,
	delayFeedback	= 0,
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

function audioCallback(buffer, channelCount){
    var gens = ctrl.pull();
    var bl = buffer.length;
    var gl = gens.length, sample2, sample3;

	// loop through each sample in  buffer
	for (current=0; current<bl; current+= channelCount)
	{
		sample = 0;
        for (i=0; i<gl; i++){
        	lfo1.generate();//LFO generated
			lfo1.frequency = lfospeed;
			gens[i].generate();
			//gens[i].fm = lfo1.getMix();
			//console.log(lfo1.getMix());
			//gens[i].fm = lfo1.getMix() * 0.2;
			sample = left = right = 0;

			sample += gens[i].getMix()*0.5;
			
			sample2 = gens[i].getMix()*0.2;
			
			// DISTORTION
			distortion.pushSample(sample);
			sample += distortion.getMix();
			
			// BIT CRUSHER
	/**/	bitCrusher.pushSample(sample);
			sample = bitCrusher.getMix();
			
			// HIGH PASS FILTER
			hpFilter.pushSample(sample);
			sample = hpFilter.getMix(1);
			
			// LOW PASS FILTER
			lpFilter.pushSample(sample);
			sample = lpFilter.getMix(0);
			
			// DELAY
			delay.pushSample(sample);
			sample = sample + delay.getMix();
			
			// REVERB
			reverb.pushSample(sample, 0);
			reverb.pushSample(sample, 1);
			left = reverb.getMix(0);
			right = reverb.getMix(1);

			// COMPRESSOR
			left = compressorLeft.pushSample(left);			
			right = compressorRight.pushSample(right);	
			
			sample3 = left + right;
			//sample3 = sample3 * adsr.getMix();
			
		}
		if (fxOn==true)
		{
			// Fill buffer for each channel
			for (n=0; n<channelCount; n++)
			{
				//buffer[current + n] = sample;
				//buffer[current + n] = fx.pushSample(sample);
				buffer[current + n] = fx.pushSample(sample);//add sample to the chain at the end of the buffer
			}
		}
		else if (fxOn==false)
		{
				for (n=0; n<channelCount; n++)
				{
					//buffer[current + n] = sample3 * vol;
					buffer[current + n] = sample3 * 0.2;
					
				}
		}
	}

	 
}

function onReady() 
{
    dev = audioLib.AudioDevice(audioCallback, 2); //1
	sampleRate= dev.sampleRate;//2
    ctrl = new KeyboardController();//3
    document.addEventListener('keyup', onKeyup, true);
    document.addEventListener('keydown', onKeydown, true);
    toggleEnvelope("on");
    lfo1			= new audioLib.Oscillator(sampleRate, 2);
    lfo1.waveShape = 'triangle';
    //osc.fm = lfo1.getMix() * 0.2;
    /*
    *******************************************INITIALISE AND CREATE EFFECTS********************************************
	*/
	//toggleDelay("off"); 
	//console.log(dev.channelCount);
													//smplRte, delaytime, depth, lfo Hz
	//fx			= (new audioLib.LP12Filter(sampleRate, 3000, 1)).join(new audioLib.Chorus(sampleRate, 130, 9, .7),new audioLib.Delay(sampleRate));
	fx			= (new audioLib.LP12Filter(sampleRate, 3000, 1)).join(new audioLib.Chorus(sampleRate, 130, 9, .2),new audioLib.Delay(sampleRate));

	
	delay = new audioLib.Delay(sampleRate, delayTime, delayFeedback);
	//chorus= new audioLib.Chorus(sampleRate, 1, 2,0.3);
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
}


function onKeyup(event) {
    pressed.splice(pressed.indexOf(event.keyCode), 1);
    ctrl.releaseKeyByID(event.keyCode);
}


function onKeydown(event) {

    if (pressed.indexOf(event.keyCode) !== -1) {
        return;
    }

    pressed.push(event.keyCode);

    var myNote;
    switch (String.fromCharCode(event.keyCode)) {     
        //case "Q":myNote = "A3"; break;
        case "W":myNote = "C#1"; break;
        case "E":myNote = "D#1"; break;
        //case "R":myNote = "C3"; break;
        case "T":myNote = "F#1"; break;
        case "Y":myNote = "G#1"; break;
        case "U":myNote = "A#2"; break;
        case "I":myNote = "B#2"; break;
        case "O":myNote = "C#2"; break;
        case "P":myNote = "D#2"; break;

        case "A":myNote = "C1"; break;
        //case "A":osc = new audioLib.Oscillator(dev.sampleRate, 220); break;
        
        
        case "S":myNote = "D1"; break;
        case "D":myNote = "E1"; break;
        case "F":myNote = "F1"; break;
        case "G":myNote = "G1"; break;
        case "H":myNote = "A2"; break;
        case "J":myNote = "B2"; break;
        case "K":myNote = "C2"; break;
        case "L":myNote = "D2"; break;
        case "Z":myNote = "C0"; break;
        case "X":myNote = "D0"; break;
        case "C":myNote = "E0"; break;
        case "V":myNote = "F0"; break;
        case "B":myNote = "G0"; break;
        case "N":myNote = "A0"; break;
        case "M":myNote = "B0"; break;
    }

    if (!myNote) {return;}
    osc = audioLib.generators.Note(dev.sampleRate,myNote);
    //osc.pulseWidth = 0.51;
    //osc.fm = lfo1.getMix() * 0.2;
    osc.waveShape = document.getElementById("waveform").value;
    if (document.getElementById("envelope").value == "on") {
        osc.setEnvelope(new audioLib.ADSREnvelope(this.sampleRate, attack, decay, 1, release, sustain, release));
        			console.log(osc.getMix());
    }
    ctrl.pressKey(osc, event.keyCode);
    
}

function toggleEnvelope(value) {
   if (document.getElementById("envelope").value == "on" || value=="off") {
        document.getElementById("envelope").value = "off";
        document.getElementById("envelopeLabel").style.visibility = 'visible';
        document.getElementById("adsr").style.visibility = 'visible';
    } else {
        document.getElementById("envelope").value = "on";
        document.getElementById("envelopeLabel").style.visibility = 'visible';
        document.getElementById("adsr").style.visibility = 'visible';
        onEnvelopeChange();
    }/* */
}

function onEnvelopeChange() {
    attack = document.getElementById("attackTime").value;
    decay = document.getElementById("decayTime").value;
    sustain = document.getElementById("sustainTime").value;
    release = document.getElementById("releaseTime").value;

    if (sustain == 0) {
        sustain = null; // null sustain allows us to hold the key down
    }
    //document.getElementById("envelopeLabel").innerHTML = "A:" + attack + "ms, D:" + decay + "ms, S:" + sustain + "ms, R:" + release + "ms";
}



   
/**
* fx stuff**************
*
*/
function onFxChange(){
	   // feedback = parseFloat(document.getElementById("feedbackTime").value);
	    //feedback = document.getElementById("feedbackTime").value;
	    //dtime = document.getElementById("delayTime").value;
	    //	    console.log(feedback);
	    //	    console.log(dtime);
	    	    	//document.getElementById("range").innerHTML=newValue;
		lfospeed = document.getElementById("lfospeed").value;



}



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




function presets(value)
{		
	fxOn = true;
	if(document.getElementById("presetSelect").value == "default"){
			//fx			= new audioLib.Delay(sampleRate, 5, 0.1);
			//fx			= new audioLib.Delay(sampleRate, dtime, feedback);
			//fx			= (new audioLib.LP12Filter(sampleRate, 3000, 1)).join(new audioLib.Chorus(sampleRate, 130, 9, .7),new audioLib.Delay(sampleRate));			
			fxOn = false;
			divIsible();
   		}		
	 
   	if(document.getElementById("presetSelect").value == "Chorus"){
			fx			= new audioLib.Chorus(sampleRate, 350, 2,0.3);//smplRte, delaytime, depth, lfo Hz
   			divInvisible();
   			//ctime = document.getElementById("chorusTime").value;
   			//lfo = document.getElementById("lfoTime").value;
   			
   			//fx.time = ctime;
   			//fx.freq = lfo;
   		}			
			
   	if(document.getElementById("presetSelect").value == "BladeRunner"){
   			fx			= (new audioLib.LP12Filter(sampleRate, 8000, 8)).join(new audioLib.Chorus(sampleRate, 130, 9, 1.1),new audioLib.Delay(sampleRate));
   			fx[2].time = 960;
   			fx[2].feedback = 0.9;
   			//fx[2].feedback = feedback;
			divInvisible();
   		}
   		
   	if(document.getElementById("presetSelect").value == "Distorted"){
			fx			= (new audioLib.LP12Filter(sampleRate, 10000, 20)).join(new audioLib.Chorus(sampleRate, 30, 10, 0.3), new audioLib.Delay(sampleRate), new audioLib.Distortion(sampleRate, 10, 2), new audioLib.Compressor(sampleRate, 3, 0.5));
   			fx[2].time = 500;
   			fx[2].feedback = 0.40;
   			   				//fx[3].gain = 10;
			divInvisible();
   		}	
   		
   	if(document.getElementById("presetSelect").value == "dnb"){
			//fx			= (new audioLib.LP12Filter(sampleRate, 8000, 20)).join(new audioLib.Chorus(sampleRate, 30, 5, 0.5), new audioLib.Distortion(sampleRate,10, 2),new audioLib.Delay(sampleRate),  new audioLib.Distortion(sampleRate), new audioLib.Compressor(sampleRate, 3, 0.5));
   			//fx[2].time = 700;
   			//fx[2].feedback = 0.5;
   			fx			= (new audioLib.LP12Filter(sampleRate, 2000, 1)).join(new audioLib.Chorus(sampleRate, 130, 9, 0.5),new audioLib.Delay(sampleRate, 500, 0.2));

   		}	


}





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
	Message.innerHTML= "The feed slider changes the amount of feedback applied to the signal.";
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
	var dist = document.getElementById("grit");
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
	var dist = document.getElementById("grit");
	
	dist.style.opacity=1 ;
	//three.style.visibility="visible"; 
	three.style.opacity=1 ;
	//one.style.display = "block"; 
//three.style.display = "block"; 
}














////function CombFilter(sampleRate, delaySize(samples), feedback(0-1), damping(0-1)){


/*
function audioCallback(buffer, channelCount) {	
		
		var sample;
		
		for (var i = 0; i < buffer.length; i += channelCount) {
			sample = 0;
				
			adsr.generate();
			
			if (adsr.state === 5) {
				releasePhase = true;
			}

			// if in the release phase, release key when state cycles back to 0
			if (releasePhase && adsr.state === 0 && released === false) {
				released = true;
			} else if (released === false) { // if released, don't return any buffer
				osc.generate();
				sample = osc.getMix() * adsr.getMix();
			} 
			
			buffer[i] = sample;
			buffer[i+1] = sample;
		}		
	}*/
	

/*
document.onkeydown = function(event) {
 event = event || window.event;

 var e = event.keyCode;
 adsr.state = 0;
		released = false;
		releasePhase = false;
		adsr.triggerGate(true);

 if (e==65 ){
 // osc = new audioLib.Oscillator(dev.sampleRate, 110);
  osc = audioLib.generators.Oscillator(dev.sampleRate,110);
  pressed.push(event.keyCode);
 }

 if (e==83 ){
  osc = audioLib.generators.Oscillator(dev.sampleRate,220);
  pressed.push(e);
 }
 
 if (e==68 ){
  osc = audioLib.generators.Oscillator(dev.sampleRate,220);
  pressed.push(e);
 }
 
 if (e==32 ){
  stop();
 }
}


document.onkeyup = function(event) 
{
 event = event || window.event;

 var e = event.keyCode;
 console.log(e);
 //if (e == pressed[0])
 //{
 	if (!released) 
 	{
			releasePhase = true;
			adsr.triggerGate(false);
	}
 //}
}

	
	

*/
  