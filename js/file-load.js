let indexedNodes;
let state = {
	graph_data: {},
	force_graph_prop: 'all',
	node_color_prop: 'all'
};
async function getSchemaData() {
	console.log('Starting ALL');
	let response = await fetch("/js/schemaorg-current-http.jsonld");
	let schemaData = await response.json();
	// updateDOMGotRe   sponse();

	console.log(schemaData);
	return schemaData;
}


async function getNodeListAndEdgeList() {
	let schemaData = await getSchemaData();
	console.log(`Got ${schemaData["@graph"].length} total edges`);

	let edgeList = [];
	let nodeList = [];

	schemaData["@graph"]
		.filter(element => element["@id"] !== null)
		.forEach((element) => {
		let nodeEL = {};

			element.id = element["@id"];
			nodeEL = {
				id: element["@id"],
				'@id': element["@id"],
				label: element["rdfs:label"],
				type: element["@type"]
			};
			nodeList.push(nodeEL);

		let allElProps = Object.keys(element);
		allElProps.forEach((prop) => {
			//if Literal
			if (typeof element[prop] !== 'object' && element[prop] !== null) {
				// nodeEL[prop.replace(':','')] = element[prop];
				//let it just be a prop in the Node -> saved in the nodelist
			} else if (Array.isArray(element[prop])) {
				element[prop].forEach((eachVal) => {
					edgeList.push({
						id: element["id"],
						prop: prop,
						val: eachVal["id"]
					})
				})
				// console.log(element[prop]);
			} else {
				if (element[prop]["@id"] !== null) {
					// console.log(`${prop} : ${element[prop]}`);
					edgeList.push({
						id: element["@id"],
						prop: prop,
						val: element[prop]["@id"]
					});
				}
			}
		});
	});
	console.log({ edgeList });
	console.log({ nodeList });
	return {
		nodeList: nodeList,
		edgeList: edgeList
	}
}


window.addEventListener('load', async function () {

	let graph_data = await getNodeListAndEdgeList();
	console.log(graph_data);

	// let listOfLinkedProperties = [...new Set(graph_data.edgeList.map(x => x.prop))];
	let listOfLinkedProperties = await createdCountedPropList(graph_data.edgeList.map(x => x.prop));
	let listOfLiteralProperties = Object.keys(graph_data.nodeList[0]);
	addPropNamesToDOM(listOfLinkedProperties);	//list of properties
	addNodeColorByDOM(listOfLiteralProperties);		//list of String Properties in the first Node object. (ideally, all possible Literal properties of a Node)

	goPlot(graph_data);
	document.getElementById('graph-force-prop-select').addEventListener('change', (event) => {
		state.force_graph_prop = event.target.value;
		goPlot(graph_data, state.force_graph_prop, state.node_color_prop)
	})
	document.getElementById('node-color-prop-select').addEventListener('change', (event) => {
		state.node_color_prop = event.target.value;
		goPlot(graph_data, state.force_graph_prop, state.node_color_prop)
	})
	// document.getElementById('node-radius-prop-select').addEventListener('change', (event) => {
	// 	state.node_color_prop = event.target.value;
	// 	goPlot(graph_data, state.force_graph_prop, state.node_color_prop)
	// })

	document.addEventListener('thumbstickdown', (e) => {
		console.log('THUmb Down');
		console.log(e);
	})

	document.addEventListener('raycaster-intersected', e => {
		console.log('Raycaster Intersected');
		console.log({e});
		console.log(e.target);
	})
	document.addEventListener('keydown', e => {
		console.log('kEY down');
		console.log({e});
	})
	
	// Chrome OS
	

});
async function goPlot(graph_data, force_graph_prop = 'http://schema.org/isPartOf', node_color_prop = 'type') {

	let selectedProp = force_graph_prop;
	let nodeList = graph_data.nodeList
	let edgeList = graph_data.edgeList
		.filter(x => x.prop == selectedProp || force_graph_prop === 'http://schema.org/isPartOf')
		.filter(x => x.target !== null)
		.map(x => {
			return {	
				source: x.id,
				target: x.val,
				prop: x.prop
			}
		});
	let nodeIDList = nodeList.map(x => x["@id"]);
	edgeList = edgeList.filter(x => nodeIDList.indexOf(x.source) >= 0 && nodeIDList.indexOf(x.target)>=0);
	console.log(`nodes: ${JSON.stringify(nodeList)}; `);
	console.log({ nodeList });
	console.log({ edgeList });

	// document.getElementById("forceGraph").setAttribute('forcegraph',
	// 	// `nodes: [{"id": 1, "name": "first"}, {"id": 2, "name": "second"}, {"id": 3, "name": "thgree"}, {"id": "karo", "name": "kaaro"}]; links: [{"source": 1, "target": 2}, {"source": 1, "target": 3}, {"source": 1, "target": "karo"}]`);
	// 	`nodes: ${JSON.stringify(nodeList)}; links: ${JSON.stringify(edgeList)}; node-auto-color-by:"type"; node-label:"label"`)
	let forceGraphAttr = {
		nodes: JSON.stringify(nodeList),
		
		links: JSON.stringify(edgeList),
		'node-auto-color-by': node_color_prop,
		'node-label': 'label',
		'link-auto-color-by': 'prop',
		'link-label': 'prop',
		'link-curvature': 0.4,
		// 'link-directional-arrow-length': 1,
		// 'link-directional-arrow-rel-pos': (e) => { return 1},
		'link-width': '1px',
		'on-node-center-hover': (e) => { showNodeInfoVDOM(e) }
	};
	document.getElementById("forceGraph").setAttribute('forcegraph', 
		Object.keys(forceGraphAttr).map(attr => `${attr}: ${forceGraphAttr[attr]}`).join(';'))
	console.log({ nodeList });
	console.log({ edgeList });

}

async function addPropNamesToDOM(propIDList) {
	let selectMainNode = document.getElementById('graph-force-prop-select');
	let optionList = [];
	console.log({propIDList})
	Object.keys(propIDList).forEach(prop => {
		let optEL = document.createElement('option');
		optEL.setAttribute('value', prop);
		optEL.innerHTML = `${prop} (${propIDList[prop]})`;
		selectMainNode.appendChild(optEL);
	});
	
}


async function addNodeColorByDOM(literal_propIDList) {
	let selectMainNode = document.getElementById('node-color-prop-select');
	literal_propIDList.forEach(prop => {
		let optEL = document.createElement('option');
		optEL.setAttribute('value', prop);
		optEL.innerHTML = prop;
		selectMainNode.appendChild(optEL);
	});
	
}


async function createdCountedPropList(propList) {
	console.log({propList})
	return propList.reduce(function (acc, curr) {
		if (typeof acc[curr] == 'undefined') {
		  acc[curr] = 1;
		} else {
		  acc[curr] += 1;
		}
	  
		return acc;
	  }, {});	  
}


async function showNodeInfoVDOM(node) {
	let textVDOMEl = document.getElementById('nodeDesc');
	let skyVDOMEl = document.getElementById('theSky');
	let threeScene = skyVDOMEl.sceneEl.object3D;
	console.log(node);
	if (node === null) {
		textVDOMEl.setAttribute('visible', false);
		skyVDOMEl.setAttribute('color', '#131313');
	} else {
		let textValue = `value:`;
		Object.keys(node).forEach(prop => {
			textValue += `\n ${prop}: ${node[prop]}`
		});
		textVDOMEl.setAttribute('text', textValue)
		textVDOMEl.setAttribute('visible', true)
		skyVDOMEl.setAttribute('color', '#131353');
		let threeObj = threeScene.getObjectById(node.index, true);
		console.log(threeObj);
		threeObj.animations.push({
			target: 'scale',
			from: '4 4 4',
			to: '1 1 1',
			dur: 3000
		});

	}
	
}