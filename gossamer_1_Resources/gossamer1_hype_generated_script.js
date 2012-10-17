//	HYPE.documents["gossamer_1"]

(function HYPE_DocumentLoader() {
	var resourcesFolderName = "gossamer_1_Resources";
	var documentName = "gossamer_1";
	var documentLoaderFilename = "gossamer1_hype_generated_script.js";

	// find the URL for this script's absolute path and set as the resourceFolderName
	try {
		var scripts = document.getElementsByTagName('script');
		for(var i = 0; i < scripts.length; i++) {
			var scriptSrc = scripts[i].src;
			if(scriptSrc != null && scriptSrc.indexOf(documentLoaderFilename) != -1) {
				resourcesFolderName = scriptSrc.substr(0, scriptSrc.lastIndexOf("/"));
				break;
			}
		}
	} catch(err) {	}

	// Legacy support
	if (typeof window.HYPE_DocumentsToLoad == "undefined") {
		window.HYPE_DocumentsToLoad = new Array();
	}
 
	// load HYPE.js if it hasn't been loaded yet
	if(typeof HYPE_100 == "undefined") {
		if(typeof window.HYPE_100_DocumentsToLoad == "undefined") {
			window.HYPE_100_DocumentsToLoad = new Array();
			window.HYPE_100_DocumentsToLoad.push(HYPE_DocumentLoader);

			var headElement = document.getElementsByTagName('head')[0];
			var scriptElement = document.createElement('script');
			scriptElement.type= 'text/javascript';
			scriptElement.src = resourcesFolderName + '/' + 'HYPE.js?hype_version=100';
			headElement.appendChild(scriptElement);
		} else {
			window.HYPE_100_DocumentsToLoad.push(HYPE_DocumentLoader);
		}
		return;
	}
	
	var hypeDoc = new HYPE_100();
	
	var attributeTransformerMapping = {b:"i",c:"i",bC:"i",aS:"i",d:"i",M:"i",e:"f",N:"i",f:"d",aT:"i",O:"i",g:"c",aU:"i",P:"i",Q:"i",aV:"i",R:"c",aW:"f",aI:"i",S:"i",T:"i",l:"d",aX:"i",aJ:"i",m:"c",n:"c",aK:"i",X:"i",aZ:"i",A:"c",Y:"i",aL:"i",B:"c",C:"c",D:"c",t:"i",E:"i",G:"c",bA:"c",a:"i",bB:"i"};

var scenes = [{initialValues:{"2":{o:"content-box",h:"gossamer2.png",x:"visible",a:900,q:"100% 100%",b:250,j:"absolute",r:"inline",c:800,k:"div",z:"1",d:100},"3":{o:"content-box",h:"tagline2.png",x:"visible",a:-800,q:"100% 100%",b:350,j:"absolute",r:"inline",c:800,k:"div",z:"2",d:100,e:"1.000000"}},timelines:{kTimelineDefaultIdentifier:{framesPerSecond:30,animations:[{f:"2",t:0,d:2,i:"a",e:50,r:1,s:900,o:"2"},{f:"2",t:0.66666669,d:1.3333333,i:"a",e:50,r:1,s:-800,o:"3"},{f:"2",t:2,d:3.0333333,i:"a",e:50,s:50,o:"3"},{f:"2",t:2,d:3,i:"a",e:50,s:50,o:"2"},{f:"2",t:5,d:1.8000002,i:"a",e:-800,s:50,o:"2"},{f:"2",t:5.0333333,d:1.1666665,i:"a",e:900,s:50,o:"3"}],identifier:"kTimelineDefaultIdentifier",name:"Main Timeline",duration:6.8000002}},sceneIndex:0,perspective:"600px",oid:"1",onSceneAnimationCompleteAction:{type:4,javascriptOid:"4"},backgroundColor:"#1D2729",name:"Untitled Scene"}];


	
	var javascripts = [{name:"splash",source:"function(hypeDocument, element, event) {\n\tmydiv = document.getElementById(\"all\");\n\tmydiv.style.visibility = \"visible\"; \t\n\tmydiv2 = document.getElementById(\"splash\");\n\t/*mydiv2.style.visibility = \"hidden\"; */\n\tmydiv2.style.display = \"none\"; \n\t\n\t\n}",identifier:"4"}];


	
	var Custom = {};
	var javascriptMapping = {};
	for(var i = 0; i < javascripts.length; i++) {
		try {
			javascriptMapping[javascripts[i].identifier] = javascripts[i].name;
			eval("Custom." + javascripts[i].name + " = " + javascripts[i].source);
		} catch (e) {
			hypeDoc.log(e);
			Custom[javascripts[i].name] = (function () {});
		}
	}
	
	hypeDoc.setAttributeTransformerMapping(attributeTransformerMapping);
	hypeDoc.setScenes(scenes);
	hypeDoc.setJavascriptMapping(javascriptMapping);
	hypeDoc.Custom = Custom;
	hypeDoc.setCurrentSceneIndex(0);
	hypeDoc.setMainContentContainerID("gossamer1_hype_container");
	hypeDoc.setResourcesFolderName(resourcesFolderName);
	hypeDoc.setShowHypeBuiltWatermark(0);
	hypeDoc.setShowLoadingPage(true);
	hypeDoc.setDrawSceneBackgrounds(true);
	hypeDoc.setDocumentName(documentName);

	HYPE.documents[documentName] = hypeDoc.API;

	hypeDoc.documentLoad(this.body);
}());

