const elementPath = document.querySelector('#path')


const indicateButton = document.querySelector('#indicateButton')
const highlightButton = document.querySelector('#highlightButton')
const validateButton = document.querySelector('#validateButton')
let startingDivOnTree = document.querySelector(".top-element-box")
let propertiesWindow = document.querySelector('#elementProperties')
let parsedJson
let indicatedElement
let treeItem
let checkbox
let treeJson
let ancestors
let elementDisplayingProperties
let keysOutOfScope
let robotId




indicateButton.addEventListener('click', fillTree)
highlightButton.addEventListener('click', toggleHighlight)
validateButton.addEventListener('click', validateIndicatedElement)
elementPath.addEventListener('change', resetValidateButton)

function resetValidateButton() {
	validateButton.classList.add("toggle-off")
	validateButton.classList.remove("toggle-invalid")
	validateButton.classList.remove("toggle-valid")
}
async function toggleHighlight() {
	
	if (highlightButton.classList.contains('toggle-on')) {
		highlightButton.classList.remove('toggle-on')
		highlightButton.classList.add('toggle-off')
		stopHighlighting()
	}
	else {
		highlightButton.classList.add('toggle-on')
		highlightButton.classList.remove('toggle-off')
		validateIndicatedElement()
		while(highlightButton.classList.contains('toggle-on')) {
			highlightIndicatedElement()
			await new Promise(resolve => setTimeout(resolve, 1000))

		}
    }

}

function highlightIndicatedElement() {
	fetch("http://localhost:8080/api/elementhighlight", {
		method: "POST",
		headers: {
			'Accept': 'application/json, text/plain',
			'Content-Type': 'application/json;charset=UTF-8'
		},
		body: JSON.stringify({
			xpath: elementPath.value
		})
	})
}

function validateIndicatedElement() {
	fetch("http://localhost:8080/api/elementvalidate", {
		method: "POST",
		headers: {
			'Accept': 'application/json, text/plain',
			'Content-Type': 'application/json;charset=UTF-8'
		},
		body: JSON.stringify({
			xpath: elementPath.value
		})
	})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			if (data == "VALID") {
				validateButton.classList.remove("toggle-off")
				validateButton.classList.remove("toggle-invalid")
				validateButton.classList.add("toggle-valid")
			}
			else {
				validateButton.classList.remove("toggle-off")
				validateButton.classList.add("toggle-invalid")
				validateButton.classList.remove("toggle-valid")
            }
			

		});
}
 function stopHighlighting() {

	 fetch("http://localhost:8080/api/elementhighlight", {
		 method: "POST",
		 headers: {
			 'Accept': 'application/json, text/plain',
			 'Content-Type': 'application/json;charset=UTF-8'
		 },
		 body: JSON.stringify({
			 xpath: elementPath.value,
			 stop: true
		 })
	 })
}

function expandIndicatedBranch() {
	indicatedElement = document.querySelector('.indicated')
	ancestors = getAncestors(indicatedElement)
	for (var i = 1; i <= ancestors.length-1; i++) {
		if ( ancestors[i].classList.contains('under-element-box')) {
			childToggle(ancestors[i])
		}
	}
	var checkboxes = document.querySelectorAll('.checkbox-left-list')
	for (var i = 0; i <= checkboxes.length-1; i++) {
		if (!ancestors.includes(checkboxes[i].parentNode)) {
			checkboxes[i].disabled = true
		}
		
	}

}

function displayProperties() {
	elementDisplayingProperties = document.querySelector('.isDisplayingProperties')
	propertiesWindow.innerHTML =''
	robotId = elementDisplayingProperties.getAttribute('RobotId')

	treeItem = getObjects(treeJson, 'RobotId', robotId)[0]

	Object.keys(treeItem).forEach(key => {
		if (!keysOutOfScope.includes(key) && treeItem[key][0].length > 0) {
			var propertyItem = document.createElement('DIV')
			var itemBody = document.createElement('DIV')
			itemBody.classList.add('item-body')
			
			var itemCheckbox = document.createElement('INPUT')
			itemCheckbox.setAttribute('type', 'checkbox')
			itemCheckbox.setAttribute('robotId', robotId)
			itemCheckbox.setAttribute('propertyName', key)
			itemCheckbox.setAttribute('onclick', 'toggleProperty(this)')
			if (treeItem[key][1]) {
				itemCheckbox.checked = true
            }
			itemBody.appendChild(itemCheckbox)
			var itemLabel = document.createElement('LABEL')
			itemLabel.classList.add('content')
			itemLabel.textContent = treeItem[key][0]
			var itemSpan = document.createElement('SPAN')
			itemSpan.textContent = key + ': '
			itemLabel.prepend(itemSpan)
			itemBody.appendChild(itemLabel)
			propertyItem.appendChild(itemBody)
			propertyItem.classList.add('item')

			
			propertiesWindow.appendChild(propertyItem)
		}
	})

	


}

function toggleDisplayProperties(x) {
	document.querySelectorAll('.isDisplayingProperties')[0].classList.remove('isDisplayingProperties')
	x.classList.add('isDisplayingProperties')
	displayProperties()
}

function toggleProperty(x) {
	robotId = x.getAttribute('robotId')
	var propertyName = x.getAttribute('propertyName')
	treeItem = getObjects(treeJson, 'RobotId', robotId)[0]
	if (treeItem[propertyName][1] == true) {
		treeItem[propertyName][1] = false
	}
	else {
		treeItem[propertyName][1] =  true
	}
	elementPath.value = 'native/'
	startingDivOnTree.innerHTML = '';
	populateTree(startingDivOnTree, treeJson, true, false)
	expandIndicatedBranch()
}

function retargetIndicatedElement(x) {
	stopHighlighting()
	resetValidateButton()
	indicatedElement = document.querySelector('.indicated')
	indicatedElement.classList.remove('indicated')
	x.classList.add('indicated')
	robotId = x.getAttribute('RobotId')
	


	treeItem = getObjects(treeJson, 'Indicated', true)[0]
	treeItem.Indicated = false
	var allSelected = getObjects(treeJson, 'Selected', true)
	for (var i = 0; i <= allSelected.length - 1; i++) {
		allSelected[i].Selected = false
	}
	treeItem = getObjects(treeJson, 'TopLevel', true)[0]
	treeItem.Selected = true
	treeItem = getObjects(treeJson, 'RobotId', robotId)[0]
	treeItem.Indicated = true
	treeItem.Selected = true
	elementPath.value = 'native/'
	startingDivOnTree.innerHTML = '';
	populateTree(startingDivOnTree, treeJson, true, false)
	expandIndicatedBranch()
	

}



const getAncestors = el => {
	let ancestors = [];
	while (el) {
		
			ancestors.unshift(el);
        
		
		el = el.parentNode;
	}
	return ancestors;
};

function childToggle(x) {
	
	let childs = x.children;
	

    
	for (let i = 0; i <= childs.length-1; i++)
	{
		let child = childs[i]
		if (child.classList.contains('under-element-box')) {
		
		if (child.classList.contains('hidden'))
		{
			child.classList.remove('hidden')
			if (x.querySelector('button') != null) {
				x.querySelector('button').classList.add('fa-minus')
			    x.querySelector('button').classList.remove('fa-plus')
            }
			
		}
		else
		{
			child.classList.add('hidden')
			if (x.querySelector('button') != null) {
				x.querySelector('button').classList.add('fa-plus')
				x.querySelector('button').classList.remove('fa-minus')
			}
        }
			
    }
	}
}

function populateTree(parentDiv, currentJsonNode, isTop, hideChild)
{
	let elementName = "";
	let elementType = "*"
	if (currentJsonNode["Name"] != null && currentJsonNode["Name"][0] != null) {

		currentJsonNode["Name"][0] = currentJsonNode["Name"][0].replace('/', '.')
		elementName = currentJsonNode["Name"][0];

	}
	if (currentJsonNode["Type"] != null && currentJsonNode["Type"][0] != null) {
		elementType = currentJsonNode["Type"][0];
	}
	let element = document.createElement("div")


	 
	let elementAFocus = document.createElement('A')
	
	

	Object.keys(currentJsonNode).forEach(key => {
		element.setAttribute(key, currentJsonNode[key])
	
	})
	

	if (elementName != null && elementName !== '' && elementName.split(' ').length > 1) {
		elementAFocus.textContent = `${elementType}  ${elementName.split(' ')[0]} ${elementName.split(' ')[1]}`
		elementAFocus.setAttribute('name', elementName)
	} else if (elementName != null && elementName !== '' ) {
		elementAFocus.textContent = `${elementType}  ${elementName.split(' ')[0]}`
		elementAFocus.setAttribute('name', elementName)
	} else {
		elementAFocus.textContent = elementType
	}
	
	


	if (hideChild) {
		element.classList.add('hidden')
	}

	
	//
	if (currentJsonNode["Indicated"] == true) {
		element.classList.add('indicated')
		element.classList.add('isDisplayingProperties')

	}

	
	
	checkbox = document.createElement("INPUT")
	checkbox.setAttribute("type", "checkbox")

	if (currentJsonNode["Selected"] == true) {
		element.classList.add('selected')

		elementPath.value = elementPath.value + '/' + currentJsonNode["Type"][0]

		keysOutOfScope = ["ChildElements", "Selected", "Indicated", "RobotId", "Type", "TopLevel"]
		Object.keys(currentJsonNode).forEach(key => {
			if (!keysOutOfScope.includes(key) && currentJsonNode[key][1] == true) {
				elementPath.value = elementPath.value + "[@" + key + "='" + currentJsonNode[key][0] + "']"

            }
		})

		
		checkbox.checked = true

	}
	else {
		
		
		checkbox.checked = false
	}
	
	checkbox.classList.add('checkbox-left-list')
	checkbox.setAttribute('onclick', 'selectTreeItemByRobotId(this.parentNode.getAttribute("robotId"))')
	if (isTop == true) {
		element.classList.add('top-element-box')
		hideChild = false

	} else {
		element.classList.add('under-element-box')
		hideChild = true
		elementAFocus.setAttribute('onclick', 'toggleDisplayProperties(this.parentNode)')
		elementAFocus.setAttribute('ondblclick', 'retargetIndicatedElement(this.parentNode)')
		element.prepend(checkbox)

	}
	element.appendChild(elementAFocus)

	if(currentJsonNode.hasOwnProperty("ChildElements"))
	{
		
		let button = document.createElement("button");
		button.setAttribute('onclick', 'childToggle(this.parentNode)')
		if (hideChild) {
			button.setAttribute('class', 'fas fa-plus')
		}
		else {
			button.setAttribute('class', 'fas fa-minus')
        }
		
		element.appendChild(button)

		 for (let i = 0; i < currentJsonNode["ChildElements"].length; i++)
		 {
			 populateTree(element, currentJsonNode["ChildElements"][i], false, hideChild)
		 }
	}
	parentDiv.appendChild(element);
}

function selectTreeItemByRobotId(x) {
	treeItem = getObjects(treeJson, 'RobotId', x)[0]
	if (treeItem.Selected) {
		treeItem.Selected = false
	}
	else {
		treeItem.Selected = true
	}
	elementPath.value = 'native/'
	startingDivOnTree.innerHTML = '';
	populateTree(startingDivOnTree, treeJson, true, false)
	expandIndicatedBranch()
}

//return an array of objects according to key, value, or key and value matching
function getObjects(obj, key, val) {
	var objects = [];
	for (var i in obj) {
		if (!obj.hasOwnProperty(i)) continue;
		if (typeof obj[i] == 'object') {
			objects = objects.concat(getObjects(obj[i], key, val));
		} else
			//if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
			if (i == key && obj[i] == val || i == key && val == '') { //
				objects.push(obj);
			} else if (obj[i] == val && key == '') {
				//only add if the object is not already in the array
				if (objects.lastIndexOf(obj) == -1) {
					objects.push(obj);
				}
			}
	}
	return objects;
}
function toggleLoadingScreen() {
	let bodytoBlur = document.querySelector("#master");
	let loaderDiv = document.querySelector("#loader")
	if (bodytoBlur.classList.contains('loadingBlur')) {
		bodytoBlur.classList.remove('loadingBlur')
		loaderDiv.classList.add('hidden')
	}
	else {
		bodytoBlur.classList.add('loadingBlur')
		loaderDiv.classList.remove('hidden')
    }
}

async function fillTree(x) {
    
	toggleLoadingScreen()
	await fetch('http://localhost:8080/api/getuitree', {
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	})
		.then(response => response.json())
		.then(data => {
			toggleLoadingScreen()
			console.log(data);
			const parsedJson = data;
			elementPath.value = 'native/'
			startingDivOnTree.innerHTML = '';
			treeJson = parsedJson[0]
			populateTree(startingDivOnTree, parsedJson[0], true, false)
			expandIndicatedBranch()
			displayProperties()

		});
   
			
           
        
    
}